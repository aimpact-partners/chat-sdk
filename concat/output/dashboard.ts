/**
 * File: ts\controller.ts
 */
import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { StoreManager } from './store';
import { View } from './views';
export /*bundle*/
class Controller extends PageReactWidgetController {
	#store: StoreManager;
	createStore() {
		this.#store = new StoreManager();
		return this.#store;
	}
	get Widget() {
		return View;
	}

	show() {
		if (this.uri.vars.get('id')) {
			this.#store.load(this.uri.vars.get('id'));
		}
	}

	/**
	 * this method is executed when the widget is hidden
	 */
	hide() {
		this.#store.clear();
	}
}

/**
 * File: ts\store\index.ts
 */
//@ts-ignore
import { Session } from '@aimpact/ailearn-sdk/core';
//@ts-ignore
import { LayoutBroker } from '@aimpact/ailearn-app/dashboard-layout.widget';
import { Tracking, TrackingDashboard } from '@aimpact/ailearn-sdk/tracking';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
import { CurrentTexts } from '@beyond-js/kernel/texts';
import type { IWidgetStore } from '@beyond-js/widgets/controller';
import { module } from 'beyond_context';
import { WallStore } from './wall';

interface ISession {
	id: string;
	// ... other session properties
}

interface IStoreState {
	totalParticipants: number;
	fetching: boolean;
	view: 'general' | 'activity';
}

interface IStoreProperties {
	properties: string[];
}

export class StoreManager extends ReactiveModel<StoreManager> implements IWidgetStore {
	isStore: true;
	declare view: 'general' | 'activity';
	#session: ISession;
	#assignmentId: string;
	#tracking: Tracking;
	#currentTracking: Tracking;
	#trackings: Map<string, Tracking> = new Map();
	#model: TrackingDashboard;
	#activitySelected: any;
	get activitySelected() {
		return this.#activitySelected;
	}
	#filter: string;
	#texts: CurrentTexts<StoreManager> = new CurrentTexts(module.specifier);
	#globalTexts: CurrentTexts<any>;
	#users: Map<string, any> = new Map();
	#wallStore: WallStore;

	get session() {
		return this.#session;
	}

	get assignmentId() {
		return this.#assignmentId;
	}

	get assignment() {
		return this.#session;
	}

	get model() {
		return this.#model;
	}

	get texts(): Record<string, any> {
		return this.#texts?.value;
	}

	get participants() {
		if (!this.#filter) return this.#model.participants.items;
		const response = this.#model.participants.items.filter(item =>
			item.user.name.toLowerCase().includes(this.#filter.toLowerCase())
		);

		return response;
	}

	get globalTexts(): Record<string, any> {
		return this.#globalTexts.value;
	}

	get ready() {
		return super.ready && this.#texts.ready && this.#globalTexts.ready;
	}

	get users() {
		return this.#users;
	}

	get wall() {
		return this.#wallStore;
	}

	filter(filter) {
		this.#filter = filter;
		this.triggerEvent('change');
	}

	get state() {
		return {
			totalParticipants: this.model?.participants?.items?.length ?? 0,
			fetching: this.fetching,
			view: this.view
		};
	}

	constructor() {
		super({
			properties: ['view']
		});
		this.view = 'general';
		LayoutBroker.setModel(this);
		LayoutBroker.overlay = true;
		this.#globalTexts = new CurrentTexts('@aimpact/ailearn-app/i18n');
		this.#globalTexts.on('change', this.triggerEvent);
		this.#texts.on('change', this.triggerEvent);
		this.#globalTexts.fetch();
		globalThis.store = this;
	}

	async load(id: string) {
		try {
			if (!id) throw new Error('Invalid assignment ID');
			if (this.#model && this.#model.id === id) return;

			this.fetching = true;
			this.#assignmentId = id;
			this.#model = new TrackingDashboard({ id });

			// Initialize wall store
			this.#wallStore = new WallStore(id);

			await Promise.all([this.#texts.fetch(), this.#model.load(id)]);

			this.setupLayout();
		} catch (error) {
			console.error('Error loading dashboard:', error);
			throw error;
		} finally {
			super.ready = true;
			this.fetching = false;
		}
	}

	private setupLayout() {
		LayoutBroker.set({
			refresh: this.refresh,
			backLink: `/classrooms/view/${this.#model.classroom.id}`,
			breadcrumb: [
				[this.globalTexts.entities.classrooms, '/classrooms/list'],
				[this.#model.classroom.name, `/classrooms/view/${this.#model.classroom.id}`],
				[`Dashboard > ${this.#model.module.title}`]
			]
		});
	}

	async loadUserTracking(userId) {
		try {
			const participant = this.model.participants.map.get(userId);
			await participant.load();
			this.#currentTracking = participant;

			return this.#currentTracking;
		} catch (e) {
			console.error(e);
		}
	}

	refresh = async () => {
		try {
			this.fetching = true;
			await this.model.load();

			this.trigger('data.updated');
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	};

	refreshDrawer = async ({ userId, activity }: { userId?: string; activity?: any } = {}) => {
		try {
			const promise = new PendingPromise();
			this.fetching = true;
			this.trigger('fetching.drawer');
			await this.model.load(this.#assignmentId);

			if (userId) {
				const tracking = await this.loadUserTracking(userId);
				await tracking.load({ id: this.#assignmentId, userId });
			}
			if (activity && activity.chatModel) {
				activity.chatModel.loadAll({ id: activity.chatModel.id });
			}
			globalThis.setTimeout(() => {
				promise.resolve();
			}, 1000);
			return promise;
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
			this.trigger('fetching.drawer');
		}
	};

	refreshTracking = async userId => {
		const tracking = this.#trackings.get(userId);
		tracking.load({ id: this.#assignmentId, userId });
	};

	clear() {
		LayoutBroker.clear();
		this.#users.clear();
		this.#trackings.clear();
		this.#currentTracking = null;
		this.#model = null;
		super.ready = false;
		this.#activitySelected = null;
		this.#filter = '';
		if (this.#wallStore) {
			this.#wallStore.clear();
			this.#wallStore = null;
		}
		this.triggerEvent('cleared');
	}

	selectActivity(activity) {
		this.#activitySelected = activity;
		this.view = activity ? 'activity' : 'general';
		this.trigger('change');
	}

	async archive() {
		this.fetching = true;
		await this.model.archive();
		this.fetching = false;
	}

	async restore() {
		this.fetching = true;
		await this.model.restore();
		this.fetching = false;
	}
}

/**
 * File: ts\store\wall.ts
 */
import { DashboardWall } from '@aimpact/ailearn-sdk/core';
import { Assignment } from '@aimpact/ailearn-sdk/tracking';
import { ReactiveModel } from '@beyond-js/reactive/model';

export interface IAssignmentWallMessageBase {
	time: number;
	user: { id: string; name: string; photoUrl: string };
	activity: { id: string; title: string };
	chat: { id: string };
	prompt: { content: string };
	answer: { content: string };
}

export class WallStore extends ReactiveModel<WallStore> {
	#model: DashboardWall;
	#items: IAssignmentWallMessageBase[];
	#id: string;
	#assignment: Assignment;

	get model() {
		return this.#model;
	}

	get items() {
		return this.#items;
	}

	get id() {
		return this.#id;
	}

	get assignment() {
		return this.#assignment;
	}

	constructor(id: string) {
		super();
		this.#id = id;
		this.#model = new DashboardWall();
	}

	refresh = async () => {
		try {
			this.fetching = true;
			const { messages } = await this.model.load({ id: this.#id });
			this.#items = messages;
			this.triggerEvent('items.updated');
		} catch (error) {
			console.error('Error refreshing wall:', error);
		} finally {
			this.fetching = false;
		}
	};

	async load() {
		try {
			const { messages } = await this.#model.load({ id: this.#id });
			this.#items = messages;

			super.ready = true;
			this.triggerEvent();
		} catch (error) {
			console.error('Error loading wall:', error);
			throw error;
		}
	}

	clear() {
		this.#model = null;
		this.#items = [];
		this.#id = null;
		this.#assignment = null;
		this.triggerEvent('cleared');
	}
}

/**
 * File: ts\views\404.tsx
 */
import React from 'react';

export function NotFound({ store, texts }) {
	if (store.model.error?.code === 403) {
		return <app-not-allowed />;
	}
	return (
		<>
			<app-missing-control />
		</>
	);
}

/**
 * File: ts\views\actions.tsx
 */
import { Button } from 'pragmate-ui/components';
import React from 'react';
import { useDashboardContext } from './context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';

export function DashboardActions({ disabled }) {
	const { model, store, texts, setShowDrawer } = useDashboardContext();
	const [update, setUpdate] = React.useState({});
	const [fetching, setFetching] = React.useState(false);
	const onClick = async () => {
		store.wall.load();
		setShowDrawer({
			show: true,
			view: 'wall'
		});
	};
	useBinder(
		[model],
		() => {
			setUpdate({});
		},
		'archived.changed'
	);
	const archive = async () => {
		setFetching(true);
		await store.archive();
		setFetching(false);
	};
	const restore = async () => {
		setFetching(true);
		await store.restore();
		setFetching(false);
	};

	const actionText = model.archived ? 'restore' : 'archive';
	const action = model.archived ? restore : archive;

	return (
		<div className="dashboard-actions flex-container flex-vertical-center gap-05">
			{model.isUserCreator ? (
				<Button
					bordered
					icon="shared-folder"
					className="btn btn-primary outline pui-button has-icon "
					onClick={action}
					disabled={fetching}
					fetching={fetching}
				>
					{actionText}
				</Button>
			) : null}
			<Button
				bordered
				icon="shared-folder"
				disabled={disabled}
				className="btn btn-primary outline pui-button has-icon "
				onClick={onClick}
			>
				{texts.actions.wall}
			</Button>
		</div>
	);
}

/**
 * File: ts\views\activities\view\empty.tsx
 */
import { EmptyCard } from '@aimpact/ailearn-app/components/ui';
import React from 'react';
import { useDashboardContext } from '../../context';
export function EmptyMaterial({ message }: { message?: string }) {
	const { texts } = useDashboardContext();
	message = message ?? texts.activities.empty;
	return <EmptyCard icon="info" text={message} className="empty-section__container" />;
}

/**
 * File: ts\views\activities\view\index.tsx
 */
import config from '@aimpact/ailearn-app/config';
import React from 'react';
import { useDashboardContext } from '../../context';
import { IconButton } from 'pragmate-ui/icons';
import { List } from 'pragmate-ui/list';
import { ActivityParticipant } from './participant';
import { Empty } from 'pragmate-ui/empty';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { ConditionalContainer } from 'pragmate-ui/components';

export /*bundle*/
function ActivityView({}) {
	const { store, setView } = useDashboardContext();
	const { activitySelected: activity } = store;
	const [updated, setUpdated] = React.useState({});
	const onClose = () => store.selectActivity(undefined);

	useBinder([store], () => setUpdated(store.activitySelected), 'data.updated');
	if (!activity) return null;
	return (
		<>
			<section className={`activity-header bottom-rounded bg-activity--${activity.type}`}>
				<div>
					<h4>{activity.title} </h4>
				</div>
				<div className="close-icon">
					<IconButton icon="close" title="Close" onClick={onClose} className="circle" />
				</div>
			</section>
			<ConditionalContainer
				condition={activity.participants.length > 0}
				ternary
				options={{
					true: (
						<List
							className="activity-users__list"
							items={activity.participants}
							control={ActivityParticipant}
							specs={{ activity }}
						/>
					),
					false: <Empty text={'No participants found'} />
				}}
			/>
		</>
	);
}

/**
 * File: ts\views\activities\view\participant\chat.tsx
 */
import { Link } from 'pragmate-ui/components';
import { Image } from 'pragmate-ui/image';
import { List } from 'pragmate-ui/list';
import React from 'react';
import { useDashboardContext } from '../../../context';
import { CollapsibleContainer, CollapsibleContent, CollapsibleHeader } from 'pragmate-ui/collapsible';
import { ConditionalContainer } from 'pragmate-ui/components';
import { ActivityObjectiveStatusIcon } from '../../../components/objective-icon';
import { StudentAssignmentActivityObjective } from './objective';

export /*bundle*/
function ChatActivityParticipant({ item }) {
	const { store, setShowDrawer, texts } = useDashboardContext();
	const { activitySelected: activity } = store;
	const data = item.activities.get(activity.id);
	const [isDragging, setIsDragging] = React.useState(false);
	const onToggle = () => {
		setIsDragging(!isDragging);
	};
	if (!data) {
		console.warn(`the user ${item.user.name} has not participate on activity`, item);
		return null;
	}

	const onClick = event => {
		event.stopPropagation();
		event.preventDefault();
		store.loadUserTracking(item.id);
		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				activitySelected: activity.id,
				activity,
				participant: item
			}
		});
		return false;
	};

	return (
		<div className="activity-participant">
			<CollapsibleContainer toggleable={!!data?.progress?.objectives} onToggle={onToggle} open={isDragging}>
				<CollapsibleHeader className="activity-participant__header header--collapsible">
					<div className="activity-participant__header-content">
						<header>
							<Image className="user-data__img" src={item.user.photoUrl} />
							<Link
								className="hidden-md"
								href={`/dashboard/${store.assignmentId}?studentId=${item.user.id}`}
								onClick={onClick}
							>
								<h6>{item.user.name}</h6>
							</Link>
						</header>
						<div>
							<Link
								className="hidden-xs"
								href={`/dashboard/${store.assignmentId}?studentId=${item.user.id}`}
								onClick={onClick}
							>
								<h6>{item.user.name}</h6>
							</Link>
							<span className="activity-participant__synthesis">
								<ConditionalContainer
									condition={!!data?.progress?.summary}
									ternary
									options={{
										true: <>{data?.progress?.summary}</>,
										false: <>{texts.activities.noSummary}</>
									}}
								/>
							</span>
						</div>
					</div>

					<List
						className="unstyled-list objectives-header__states"
						items={data?.progress?.objectives}
						control={ActivityObjectiveStatusIcon}
					/>
				</CollapsibleHeader>
				<CollapsibleContent className="activity-participant__collapsible-content">
					<List items={data?.progress?.objectives} control={StudentAssignmentActivityObjective} />
				</CollapsibleContent>
			</CollapsibleContainer>
		</div>
	);
}

/**
 * File: ts\views\activities\view\participant\index.tsx
 */
import React from 'react';
import { ConditionalContainer } from 'pragmate-ui/components';
import { ChatActivityParticipant } from './chat';
import { MultipleChoiceActivityParticipant } from './multiple-choice';
import { SpokenActivityParticipant } from './spoken';

export function ActivityParticipant({ item, activity, ...specs }) {
	const type = ['content-theory', 'debate', 'character-talk', 'exercise', 'free-conversation'].includes(activity.type)
		? 'chat'
		: activity.type;

	return (
		<ConditionalContainer
			condition={type}
			options={{
				chat: <ChatActivityParticipant item={item} />,
				spoken: <SpokenActivityParticipant item={item} />,
				written: <SpokenActivityParticipant item={item} />,
				'hand-written': <SpokenActivityParticipant item={item} />,
				'multiple-choice': <MultipleChoiceActivityParticipant item={item} />
			}}
		/>
	);
}

/**
 * File: ts\views\activities\view\participant\multiple-choice.tsx
 */
import React from 'react';
import { useDashboardContext } from '../../../context';
import { Image } from 'pragmate-ui/image';
import { Link } from 'pragmate-ui/components';
import { Tooltip } from 'pragmate-ui/tooltip';

export /*bundle*/
function MultipleChoiceActivityParticipant({ item }) {
	const {
		store,
		setShowDrawer,
		texts: {
			activities: { multipleChoice: texts }
		}
	} = useDashboardContext();
	const { activitySelected: activity } = store;
	const data = item.activities.get(activity.id);

	const [isDragging, setIsDragging] = React.useState(false);

	if (!data) {
		console.warn(`the user ${item.user.name} has not participate on activity`, item);
		return null;
	}

	const onClick = event => {
		event.stopPropagation();
		event.preventDefault();
		const tracking = store.loadUserTracking(item.id);
		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				tracking,
				activitySelected: activity.id,
				participant: item
			}
		});
		return false;
	};
	const participantActivity = item.activities.get(activity.id);

	const { correct, total, wrong } = participantActivity.counters;
	const cls = `dashboard-chip ${correct > total / 2 ? ' success-label' : ' error-label'} `;

	return (
		<div className="activity-participant">
			<div className="activity-participant__header">
				<Link href={`/dashboard/${store.assignmentId}?studentId=${item.user.id}`} onClick={onClick}>
					<div className="user-data__section">
						<Image className="user-data__img" src={item.user.photoUrl} />
						<h6>{item.user.name}</h6>
					</div>
				</Link>
				<div className="activity-participant__header-content">
					<span className={cls}>
						{participantActivity.counters.correct} / {participantActivity.counters.total}
					</span>
				</div>
			</div>
		</div>
	);
}

/**
 * File: ts\views\activities\view\participant\objective.tsx
 */
import * as React from 'react';
import { useDashboardContext } from '../../../context';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
export function StudentAssignmentActivityObjective({ item }) {
	if (!item) {
		return null;
	}
	const { name, analysis } = item;
	const { texts } = useDashboardContext();
	const iconNames = {
		'in-progress': 'activityInProgress',
		pending: 'activityPending',
		completed: 'activityCompleted',
		outstanding: 'activityOutstanding'
	};
	const status = ['undefined', 'string'].includes(typeof item.status) ? item.status : item.status.text;
	return (
		<div className="assigment-activity-objective__container">
			<div className="objective-title__container">
				<div>
					<h6>{name}</h6>
				</div>
				<div className={`status__container status__container--${status}`}>
					<span>{texts.activities.objectivesStatus[status]}</span>
					<AppIcon icon={iconNames[status]} className={`activity-status__icon icon-${status}`} />
				</div>
			</div>
			<p>{analysis ? analysis : texts.activities.noAnalysis}</p>
		</div>
	);
}

/**
 * File: ts\views\activities\view\participant\spoken.tsx
 */
import React from 'react';
import { useDashboardContext } from '../../../context';
import { Image } from 'pragmate-ui/image';
import { Link } from 'pragmate-ui/components';
import { Tooltip } from 'pragmate-ui/tooltip';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { List } from 'pragmate-ui/list';

import { CollapsibleContainer, CollapsibleHeader, CollapsibleContent } from 'pragmate-ui/collapsible';

export /*bundle*/
function SpokenActivityParticipant({ item }) {
	const { store, setShowDrawer } = useDashboardContext();
	const { activitySelected: activity } = store;
	const data = item.activities.get(activity.id);
	const [isDragging, setIsDragging] = React.useState(false);
	const onToggle = () => {
		setIsDragging(!isDragging);
	};
	if (!data) {
		console.warn(`the user ${item.user.name} has not participate on activity`, item);
		return null;
	}

	const onClick = event => {
		event.stopPropagation();
		event.preventDefault();
		const tracking = store.loadUserTracking(item.id);
		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				tracking,
				activitySelected: activity.id,
				participant: item
			}
		});
		return false;
	};
	const participantActivity = item.activities.get(activity.id);
	const IconState = ({ item: objective }) => {
		return (
			<Tooltip content={objective.objective}>
				<AppIcon icon={`points${objective.points}`} />
			</Tooltip>
		);
	};

	return (
		<div className="activity-participant">
			<div className="activity-participant__header flex-container flex-vertical-center">
				<Link href={`/dashboard/${store.assignmentId}?studentId=${item.user.id}`} onClick={onClick}>
					<div className="user-data__section">
						<Image className="user-data__img" src={item.user.photoUrl} />
						<h6>{item.user.name}</h6>
					</div>
				</Link>
				{/* <span className="activity-participant__synthesis">{data?.synthesis}</span> */}
				<div>
					<List className="unstyled-list" items={participantActivity.objectives} control={IconState} />
				</div>
			</div>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\chat\chat-tab.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
//@ts-ignore
import { AgentsChatContainer, AgentsChatPanel } from '@aimpact/chat-sdk/chat-component.code';
import { EmptyChat } from './empty';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';

export function StudentAssignmentActivityChatTab({ item, tracking }) {
	const { texts } = useDrawerContext();
	const ref = React.useRef();

	const tActivity = tracking.activities.map.get(item.activity.id);
	const chatId = tActivity?.chatModel?.id;

	if (!tActivity.chatModel.messages.items.length) {
		return (
			<div className="chat-tab" ref={ref}>
				<EmptyChat />
			</div>
		);
	}

	return (
		<div className="chat-tab" ref={ref}>
			{tActivity.chatModel.messages.items.slice(-2).map(item => {
				<div>{item.text}</div>;
			})}
		</div>
	);
	return (
		<div className="chat-tab" ref={ref}>
			<AgentsChatContainer
				chat={tActivity?.chatModel?.id}
				id={chatId}
				empty={EmptyChat}
				icon="/assets/images/chat/profile.png"
			>
				<AgentsChatPanel />
			</AgentsChatContainer>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\chat\empty.tsx
 */
import { Empty } from 'pragmate-ui/empty';
import React from 'react';
import { useDrawerContext } from '../../../../context';

export function EmptyChat() {
	const {
		texts: {
			chat: { empty: texts }
		},
		store
	} = useDrawerContext();

	if (!store?.model) return null;

	const { title, description } = texts;

	return (
		<div className="empty-chat">
			<Empty icon="info">
				<h3>{title}</h3>
				<span>{description}</span>
			</Empty>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\chat\index.tsx
 */
import { Panes, Tab, Tabs, TabsContainer } from 'pragmate-ui/tabs';
import * as React from 'react';
import { DrawerAlert } from '../../../../components/drawer-alerts';
import { useDrawerContext } from '../../../../context';
//@ts-ignore
import { Button } from 'pragmate-ui/components';
import { StudentAssignmentActivityObjectives } from './objectives';
import { ConditionalContainer } from 'pragmate-ui/components';

interface IProps {
	item: any; // ParticipantActivity
	participant: any; // Tracking Participant object
	activityId: string; //@todo: it must be removed
	tracking: any; // Tracking object (general tracking object)
	user: any; // User object
}
/**
 *
 * @param paramm item: ParticipantActivity
 * @returns
 */
export function StudentAssignmentActivityChatBody(props: IProps) {
	const { item, user, tracking, activityId, participant } = props;
	const { texts, setShowDrawer } = useDrawerContext();
	const tActivity = participant.activities.get(activityId);
	const chatId = tActivity?.chatModel?.id;
	const [messages, setMessages] = React.useState(tActivity?.chatModel?.messages.items ?? []);
	React.useEffect(() => {
		if (!chatId) return;
		const triggerChange = () => {
			setMessages([...tActivity.chatModel.messages.items]);
		};
		tActivity.chatModel.on('change', triggerChange);
		return () => {
			tActivity.chatModel.off('change', triggerChange);
		};
	}, [chatId]);

	const tabs = [];

	if (item.progress?.objectives) tabs.push(<Tab key="objectives">{texts.activities.objectives}</Tab>);

	const interactions = item.interactions ? item.interactions : item.messages?.count;
	tabs.push(
		<Tab key="summary">
			<div className="tab__label">
				{texts.activities.chat.tab}
				{item.messages?.count ? <i className="drawer__badge">{interactions}</i> : null}
			</div>
		</Tab>
	);

	if (item?.alerts?.length)
		tabs.push(
			<Tab key="alerts" className="alerts-tab">
				<div className="tab__label">
					{texts.alerts}
					<span className="drawer__badge drawer__badge--danger">{item.alerts.length}</span>
				</div>
			</Tab>
		);

	const openChat = event => {
		item.loadChat();

		setShowDrawer({
			show: true,
			view: 'student-chat',
			data: {
				tracking,
				participant,
				participantActivity: item,
				chat: tActivity.chatModel
			}
		});
	};

	return (
		<TabsContainer active={0}>
			<Tabs className="drawer__tabs">{tabs}</Tabs>
			<Panes>
				{item.progress?.objectives && <StudentAssignmentActivityObjectives item={item} tracking={tracking} />}
				<div>
					<section className="activity-data-section">
						<h6>{texts.activities.summary}</h6>
						<p>{item.synthesis}</p>
						<ConditionalContainer
							condition={!!interactions}
							ternary
							options={{
								true: (
									<footer className="mt-15 flex-container flex-end">
										<Button onClick={openChat} className="chat__btn" variant="primary" bordered>
											{texts.activities.chat.action}
										</Button>
									</footer>
								),
								false: null
							}}
						/>
					</section>
				</div>

				<DrawerAlert alerts={item?.alerts} user={user} />
			</Panes>
		</TabsContainer>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\chat\objective.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';

export function StudentAssignmentActivityObjective({ item }) {
	const { name, analysis } = item;
	const { texts } = useDrawerContext();
	const iconNames = {
		'in-progress': 'activityInProgress',
		pending: 'activityPending',
		completed: 'activityCompleted',
		outstanding: 'activityOutstanding'
	};

	const status = ['undefined', 'string'].includes(typeof item.status) ? item.status : item.status.text;
	return (
		<div className="assigment-activity-objective__container">
			<div className="objective-title__container">
				<div>
					<h6>{name}</h6>
					<p>{analysis ? analysis : texts.activities.noAnalysis}</p>
				</div>
				<div>
					<div className={`status__container status__container--${status}`}>
						<span>{texts.activities.objectivesStatus[status]}</span>
						<AppIcon icon={iconNames[status]} className={`activity-status__icon icon-${status}`} />
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\chat\objectives.tsx
 */
import { List } from 'pragmate-ui/list';
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
import { StudentAssignmentActivityObjective } from './objective';
//@ts-ignore

export function StudentAssignmentActivityObjectives({ item, tracking }) {
	const { texts } = useDrawerContext();

	return (
		<div>
			<div className="objectives__summary">
				<p>{item.progress?.summary}</p>
			</div>
			{item.progress?.objectives && (
				<div>
					<h4 className="mt-15">{texts.activities.progres}</h4>
					<List
						className="unstyled-list"
						items={item.progress?.objectives}
						control={StudentAssignmentActivityObjective}
					/>
				</div>
			)}
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\index.tsx
 */
import { AppIcon, ICONS } from '@aimpact/ailearn-app/components/icons';
import { CollapsibleContainer, CollapsibleContent, CollapsibleHeader } from 'pragmate-ui/collapsible';
import { ConditionalContainer } from 'pragmate-ui/components';
import * as React from 'react';
import { useDrawerContext } from '../../../context';
import { StudentAssignmentActivityChatBody } from './chat';
import { StudentAssignmentActivityMultipleChoiceBody } from './multiple-choice';
import { StudentAssignmentActivitySpokenBody } from './spoken';

/**
 *
 * @param param0 activityId is passed when the user clicks on an activity
 * @returns
 */
export function StudentAssignmentActivity({
	item: activity,
	user,
	index,
	tracking,
	activityId,
	activitySelected,
	participant
}) {
	const { texts } = useDrawerContext();
	const hasParticipated = participant.activities.has(activity.id);
	const item = participant.activities.get(activity.id);
	const open = (!activitySelected && index === 0) || activitySelected === activity.id;
	const [isDragging, setIsDragging] = React.useState(open);
	const ref = React.useRef(null);
	const onToggle = () => setIsDragging(!isDragging);
	const clsDrawer = `ds-drawer__activity-item ${isDragging ? 'is-open' : ''} ${open ? 'is-open' : ''}`;
	if (!activityId) activityId = activity.id;

	React.useEffect(() => {
		if (!open || !ref.current) return;
		ref.current?.classList.toggle('activity-item--opened');
		const drawerContent = ref.current.closest('.ds-drawer__content') as HTMLElement;
		if (!drawerContent) return;

		// Get the bounding rectangle of the target element
		const elementRect = ref.current.getBoundingClientRect();

		// Check if the element is fully visible in the viewport
		const isFullyVisible = elementRect.top >= 0 && elementRect.bottom <= window.innerHeight;

		if (!isFullyVisible) {
			// Scroll the element into view with smooth behavior and align to the top
			ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}

		// Toggle the 'activity-item--opened' class after a brief delay
		const timeoutId = setTimeout(() => {
			ref.current?.classList.toggle('activity-item--opened');
		}, 1000);

		// Clean up the timeout if the component unmounts before the delay
		return () => clearTimeout(timeoutId);
	}, [open]);

	if (!hasParticipated) {
		return (
			<article className="ds-drawer__activity-item is-disabled" ref={ref}>
				<CollapsibleContainer>
					<CollapsibleHeader>
						<header className="activity__header">
							<section className="activity-header__container">
								<picture className={`activity-type__icon activity--${activity?.type}`}>
									<AppIcon icon={ICONS[activity.type]} />
								</picture>
								<div>
									<h5>{activity.title}</h5>
									<div>
										<span>{texts.activities.types[activity.type]}</span>
										<div className="activity-status">{texts.activities.status.pending}</div>
									</div>
								</div>
							</section>
						</header>
					</CollapsibleHeader>
				</CollapsibleContainer>
			</article>
		);
	}

	return (
		<article className={clsDrawer} ref={ref}>
			<CollapsibleContainer data={item} onToggle={onToggle} open={isDragging}>
				<CollapsibleHeader>
					<header className="activity__header">
						<section className="activity-header__container">
							<picture className={`activity-type__icon activity--${activity?.type}`}>
								<AppIcon icon={ICONS[activity.type]} />
							</picture>
							<div>
								<h5>{activity.title}</h5>
								<span>{texts.activities.types[activity.type]}</span>
							</div>
						</section>
					</header>
				</CollapsibleHeader>
				<CollapsibleContent className="ds-drawer__activity-item__collapsible-content">
					<ConditionalContainer
						condition={activity.type}
						options={{
							'content-theory': (
								<StudentAssignmentActivityChatBody
									tracking={tracking}
									item={item}
									user={user}
									participant={participant}
									activityId={activityId}
								/>
							),
							'character-talk': (
								<StudentAssignmentActivityChatBody
									tracking={tracking}
									item={item}
									user={user}
									participant={participant}
									activityId={activityId}
								/>
							),
							debate: (
								<StudentAssignmentActivityChatBody
									tracking={tracking}
									item={item}
									user={user}
									participant={participant}
									activityId={activityId}
								/>
							),
							'multiple-choice': (
								<StudentAssignmentActivityMultipleChoiceBody
									item={item}
									user={user}
									activityId={activityId}
								/>
							),
							spoken: (
								<StudentAssignmentActivitySpokenBody
									item={item}
									participant={participant}
									tracking={tracking}
									activityId={activityId}
								/>
							)
						}}
					/>
				</CollapsibleContent>
			</CollapsibleContainer>
		</article>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\multiple-choice\answer.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
import { HtmlWrapper } from 'pragmate-ui/components';
import { List } from 'pragmate-ui/list';

export function StudentAssignmentActivityMultipleChoiceQuestionOptions({ item, answer, correctAnswer, index }) {
	const { texts } = useDrawerContext();

	const selected = index === answer;
	let cls = `option-item `;
	if (index === correctAnswer) cls += `option--correct`;
	if (selected) {
		cls += `${selected && index === correctAnswer ? ` option--corrected` : `option--wrong `}`;
	}
	if (index === answer) cls += ` option--selected`;
	// if (index === correctAnswer) cls += ` option--correct`;
	return <div className={cls}>{item}</div>;
}

/**
 * File: ts\views\assignment\drawer\activity\multiple-choice\index.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
import { HtmlWrapper } from 'pragmate-ui/components';
import { List } from 'pragmate-ui/list';
import { StudentAssignmentActivityMultipleChoiceQuestions } from './questions';

export function StudentAssignmentActivityMultipleChoiceBody({ item }) {
	const { texts, store } = useDrawerContext();
	const activity = store.model.activities.get(item.id);

	return (
		<div className="activity-data-section">
			<p>{activity.description}</p>
			<h6>{texts.activities.multipleChoice.participation.title}</h6>
			<div className="multiple-choice__container">
				<h6>
					{texts.activities.multipleChoice.participation.detail}: {item.counters.correct}/
					{item.counters.total}
				</h6>

				<List
					className="multiple-choice__list questions-list"
					items={item.assessment.questions}
					control={StudentAssignmentActivityMultipleChoiceQuestions}
				/>
			</div>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\multiple-choice\questions.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../../context';
import { HtmlWrapper } from 'pragmate-ui/components';
import { List } from 'pragmate-ui/list';
import { StudentAssignmentActivityMultipleChoiceQuestionOptions } from './answer';

export function StudentAssignmentActivityMultipleChoiceQuestions({ item, user, activityId }) {
	const { texts } = useDrawerContext();
	const specs = {
		answer: item.answer,
		correctAnswer: item.correctAnswer
	};

	return (
		<li className="multiple-choice__item">
			<h6>{item.question}</h6>
			<List
				className="multiple-choice__list options-list"
				items={item.options}
				specs={specs}
				control={StudentAssignmentActivityMultipleChoiceQuestionOptions}
			/>
		</li>
	);
}

/**
 * File: ts\views\assignment\drawer\activity\spoken.tsx
 */
import * as React from 'react';
import { useDrawerContext } from '../../../context';
import { AudioPlayer, AIButton } from '@aimpact/ailearn-app/components/ui';
import config from '@aimpact/ailearn-app/config';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { Panes, Tab, Tabs, TabsContainer } from 'pragmate-ui/tabs';
import { settings } from '@aimpact/ailearn-app/model/wrapper';
/**
 *
 * @param param0  item: ParticipantActivity
 * @returns
 */
export function StudentAssignmentActivitySpokenBody({ item, participant }) {
	const { texts, store } = useDrawerContext();
	const userId = participant.user.id ?? participant.user?.uid;
	const audioUrl = `${settings.apis.ailearn}/assignments/${store.model.id}/activities/${item.id}/progress/${userId}/audio`;
	const output = item?.objectives?.map(objective => {
		return (
			<div className="tab-feedback-section" key={`${item.id}-${objective.objective}`}>
				<div>
					<h6 className="flex-container flex-vertical-center gap-05">
						<AppIcon icon={`points${objective.points}`} />
						{objective.name}
					</h6>
				</div>
				<div>
					<span>{objective.feedback}</span>
				</div>
			</div>
		);
	});

	const tabs = [<Tab key="feedback">{texts.activities.spoken.feedback}</Tab>];
	if (item.transcription) tabs.push(<Tab key="transcription">{texts.activities.spoken.transcription}</Tab>);

	return (
		<div>
			<div className="activity-data-section">
				<h5>{texts.activities.spoken.audio}</h5>
				<AudioPlayer url={audioUrl} />
			</div>
			<TabsContainer active={0} className="drawer-activity__tabs-container">
				<Tabs className="drawer__tabs">{tabs}</Tabs>
				<Panes>
					<div className="activity-data-section-list">{output}</div>

					<div className="activity-data__content">
						<p>{item.transcription}</p>
					</div>
				</Panes>
			</TabsContainer>
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\chat-tab.tsx
 */
import * as React from 'react';
//@ts-ignore
import { AgentsChatContainer, AgentsChatPanel } from '@aimpact/chat-sdk/chat-component.code';
import { EmptyChat } from './activity/chat/empty';
import { AnimatedContainer } from '@aimpact/ailearn-app/components/ui';

export function StudentAssignmentActivityChatTab({ item: { chat, participantActivity }, tracking }) {
	const ref = React.useRef(null);

	React.useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener('scroll', event => {
			event.stopPropagation();
			event.preventDefault();
		});
	}, [ref.current]);

	if (!chat?.messages.items.length) {
		return (
			<div className="chat-tab" ref={ref}>
				<EmptyChat />
			</div>
		);
	}

	return (
		<AnimatedContainer>
			<div className="chat-tab" ref={ref}>
				<AgentsChatContainer
					model={chat}
					id={chat?.id}
					empty={EmptyChat}
					icon="/assets/images/chat/profile.png"
				>
					<AgentsChatPanel />
				</AgentsChatContainer>
			</div>
		</AnimatedContainer>
	);
}

/**
 * File: ts\views\assignment\drawer\confirm-action.tsx
 */
import React from 'react';
import { AppIconButton } from '@aimpact/ailearn-app/components/icons';
import { ConfirmModal } from 'pragmate-ui/modal';
import { useTexts } from '@beyond-js/react-18-widgets/hooks';
import { Button } from 'pragmate-ui/components';
import { useDrawerContext } from '../../context';
export interface IConfirmActionProps {
	callback: () => void;
}
export function ConfirmAction({ callback }: IConfirmActionProps) {
	const [open, setOpen] = React.useState(false);

	const { texts } = useDrawerContext();

	const toggleOpen = () => setOpen(!open);
	const onClickButton = event => {
		event.stopPropagation();
		toggleOpen();
	};

	const onConfirm = async () => {
		await callback();
		toggleOpen();
	};

	return (
		<>
			<Button className="btn-credits" variant="primary" onClick={onClickButton}>
				{texts.addCredits.action}
			</Button>
			{open && (
				<ConfirmModal show onConfirm={onConfirm} onCancel={toggleOpen}>
					<div className="modal-overlay" onClick={toggleOpen} />
					<div className="modal-content">
						<h3>{texts.addCredits.title}</h3>
						<p>{texts.addCredits.description}</p>
					</div>
				</ConfirmModal>
			)}
		</>
	);
}

/**
 * File: ts\views\assignment\drawer\drawer-chat.tsx
 */
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import * as React from 'react';
import { DrawerSkeleton } from '../../drawer/header-skeleton';
import { StudentAssignmentActivityChatTab } from './chat-tab';
import { StudentDrawerHeader } from './header';
import { useDashboardContext, useDrawerContext } from '../../context';

export function StudentDrawerChat({ item }) {
	const { tracking, participantActivity, chat } = item;
	const { showDrawer, setShowDrawer } = useDrawerContext();
	const [ready, setReady] = React.useState(participantActivity.chatModel.ready);
	const [fetching, setFetching] = React.useState(false);
	const ref = React.useRef(null);
	useBinder([participantActivity.chatModel], () => {
		setReady(participantActivity.chatModel.ready);
	});

	if (!participantActivity.chatModel.ready) return <DrawerSkeleton item={item} />;
	const onBack = () => {
		setShowDrawer({
			show: true,
			view: 'student',
			data: showDrawer.data
		});
	};
	const onRefresh = async () => {
		try {
			setFetching(true);
			await chat.load();
			const list = ref.current.querySelector('.messages__list');

			if (list) list.scrollIntoView({ behavior: 'smooth', block: 'end' });
			setFetching(false);
		} catch (e) {
			console.error(e);
		}
	};
	const cls = `ds-drawer-container${fetching ? ' is-fetching' : ''}`;
	return (
		<div className={cls} ref={ref}>
			<StudentDrawerHeader onRefresh={onRefresh} item={item} showActivity onBack={onBack} />
			<StudentAssignmentActivityChatTab item={item} tracking={tracking} />
		</div>
	);
}

/**
 * File: ts\views\assignment\drawer\empty.tsx
 */
import React from 'react';
import { Empty } from 'pragmate-ui/empty';
import { ICONS } from '@aimpact/ailearn-app/components/icons';

export interface IEmptyProps {
	text: string;
	icon?: string;
	className?: string;
	description?: string;
	children?: React.ReactNode;
}
export /*bundle */ function EmptyCard({
	text,

	className
}: IEmptyProps) {
	const cls = `empty-section__container${className ? ` ${className}` : ''}`;

	return (
		<Empty className={cls}>
			<p>{text}</p>
		</Empty>
	);
}

/**
 * File: ts\views\assignment\drawer\header.tsx
 */
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import * as Drawer from 'pragmate-ui/drawer';
import { IconButton } from 'pragmate-ui/icons';
import * as React from 'react';
import { useDrawerContext } from '../../context';
import { toast } from 'pragmate-ui/toast';
import { Button } from 'pragmate-ui/components';
/**
 *
 * @param param0
 * @returns
 */

interface IStudentHeaderDrawerProps {
	item: {
		participant: any; // Participant object.
		tracking: any; // Tracking object.
		activity?: any; // Activity object.
		activitySelected?: string;
		participantActivity?: any; // ParticipantActivity object.
	};
	showCredits?: boolean;
	showActivity?: boolean;
	onBack?: () => void;
	onRefresh?: () => void;
}
export function StudentDrawerHeader(props: IStudentHeaderDrawerProps) {
	const { onRefresh, item, showCredits = false, showActivity = false, onBack } = props;
	const { participant, participantActivity } = item;
	const [processing, setProcessing] = React.useState(false);
	const activity = participantActivity?.activity;
	const { texts } = useDrawerContext();
	const { user: student } = participant;
	const [credits, setCredits] = React.useState(participant.credits.getProperties());
	globalThis.p = participant;
	useBinder([participant], () => {
		setCredits(participant.credits.getProperties());
	});

	const onClick = async () => {
		try {
			setProcessing(true);
			await participant.enableAI();
			toast.success(texts.enableAI.success);
			setProcessing(false);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<>
			<header className="dashboard-drawer__header">
				<section className="user__title flex-container flex-space-between">
					<div>
						<h2>{student.name}</h2>
						{showCredits ? (
							<div className="drawer__header__subtext">
								{credits.total ? (
									<>
										{texts.interactions}: {credits.consumed} {texts.of} {credits.total}
									</>
								) : (
									<>{texts.enableAI.noEnable}</>
								)}
							</div>
						) : null}
						{showActivity && activity ? (
							<div className="drawer__header__subtext">{activity.title}</div>
						) : null}
					</div>

					<div className="drawer__header-actions">
						{showCredits && credits.total && credits.total === credits.consumed ? (
							<Button fetching={processing} disabled={processing} variant="primary" onClick={onClick}>
								{texts.enableAI.action}
							</Button>
						) : null}
						{!!onBack && <IconButton icon="backArrow" onClick={onBack} />}
						<IconButton icon="refresh" className="circle refresh-icon" onClick={onRefresh} />
						<Drawer.CloseButton />
					</div>
				</section>
			</header>
		</>
	);
}

/**
 * File: ts\views\assignment\drawer\index.tsx
 */
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import * as Drawer from 'pragmate-ui/drawer';
import { IconButton } from 'pragmate-ui/icons';
import { List } from 'pragmate-ui/list';
import * as React from 'react';
import { useDrawerContext } from '../../context';
import { StudentAssignmentActivity } from './activity';
import { EmptyCard } from './empty';
import { set } from 'lodash';
import { StudentDrawerHeader, StudetDrawerHeader } from './header';
import { DrawerSkeleton } from '../../drawer/header-skeleton';
import { AnimatedContainer } from '@aimpact/ailearn-app/components/ui';
/**
 *
 * @param param0
 * @returns
 */

interface IStudentDrawerProps {
	item: {
		participant?: any; // Participant object.
		tracking?: any; // Tracking object.
		activity?: any; // Activity object.
		activitySelected?: string;
	};
}
export function StudentAssignmentSummary(props: IStudentDrawerProps) {
	const { item } = props;

	const { participant, tracking, activity, activitySelected } = item;
	const { texts, store } = useDrawerContext();
	const { user: student } = participant;
	const [items, setItems] = React.useState(participant.activities.items);
	const [fetching, setFetching] = React.useState(false);
	const [credits, setCredits] = React.useState(participant.credits.getProperties());
	const [ready, setReady] = React.useState(participant.ready);
	const cls = `ds-drawer-container${fetching ? ' is-fetching' : ''}`;
	const activityId = activity?.id;

	const onRefresh = async () => {
		setFetching(true);
		await item.participant.load();
		setTimeout(() => {
			setItems([...participant.activities.items]);
			setFetching(false);
		}, 1000);
	};
	useBinder([participant], () => {
		setReady(participant.ready);
		setItems([...participant.activities.items]);
		setCredits(participant.credits.getProperties());
	});

	if (!ready) return <DrawerSkeleton item={item} />;

	return (
		<AnimatedContainer>
			<div className={cls}>
				<StudentDrawerHeader item={item} showCredits onRefresh={onRefresh} />
				<section className="ds-drawer__content">
					{items.length ? (
						<List
							className="assignment-activity-list"
							items={store.model.activities.items}
							specs={{ user: student, tracking, activityId, participant, activitySelected }}
							control={StudentAssignmentActivity}
						/>
					) : (
						<EmptyCard text={texts.assignment.empty.title} />
					)}
				</section>
			</div>
		</AnimatedContainer>
	);
}

/**
 * File: ts\views\assignment\general.tsx
 */
import config from '@aimpact/ailearn-app/config';
import { List } from 'pragmate-ui/list';
import React from 'react';
import { useDashboardContext } from '../context';
import { Item } from './item';

export /*bundle*/
function GeneralView() {
	const { store } = useDashboardContext();

	return (
		<>
			<div className="dashboard__list">
				<List className="list-unstyled users__list" items={store.participants} control={Item} />
			</div>
		</>
	);
}

/**
 * File: ts\views\assignment\item\activity\chat.tsx
 */
import React from 'react';
import { ActivityIcon } from '../../../components/activity-icon';
import { useDashboardContext } from '../../../context';
import { ModuleActivityMessages } from './label';
import { ModuleActivityStatus } from './status';

export function ModuleActivityChat({ activity, participant }) {
	const { user } = participant;
	const { setShowDrawer, store } = useDashboardContext();
	const data = participant.activities[activity.id]?.data;
	const output = [];

	if (activity.type === 'assessment' && activity.subtype === 'multiple-choice' && data.data) {
		output.push(
			<span>
				{activity.data.counters.correct} /{activity.data.counters.total}
			</span>
		);
	}

	const onClick = async event => {
		event.stopPropagation();
		event.preventDefault();

		await store.loadUserTracking(participant.user.id);

		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				activitySelected: activity.id,
				participant,
				activity
			}
		});
	};

	return (
		<li onClick={onClick} key={`${user.id}.${activity.id}`} className="card-student-item">
			{/* The div container is used to wrap the icon and  avoid the icon to be affected by the flex properties */}
			<div>
				<ActivityIcon type={activity.type} />
			</div>
			<div className="activity-title__container-content">
				<span className="activity-title">{activity.title}</span>
				<div className="user-activity__information">
					<ModuleActivityMessages item={activity} participant={participant} />
					<ModuleActivityStatus item={activity} participant={participant} />
				</div>
			</div>
		</li>
	);
}

/**
 * File: ts\views\assignment\item\activity\details.tsx
 */
import React from 'react';
import { Icon } from 'pragmate-ui/icons';
import { ModuleActivityStatus } from './status';

export function ModuleActivityDetails({ item }) {
	const { activity, participant } = item;
	const participantActivity = participant.activities.get(activity.id);
	const output = [];

	if (activity.type === 'assessment' && activity.subtype === 'multiple-choice' && data.data) {
		output.push(
			<span>
				{item.data.counters.correct} /{item.data.counters.total}
			</span>
		);
	}

	return (
		<div className="user-activity__information">
			<div className="flex-container flex-vertical-center gap-05">
				{participantActivity?.alerts?.length ? <Icon icon="error" className="error-icon" /> : null}
			</div>
			<ModuleActivityStatus item={item} participant={participant} />
		</div>
	);
}

/**
 * File: ts\views\assignment\item\activity\index.tsx
 */
import React from 'react';
import { ConditionalContainer } from 'pragmate-ui/components';
import { ModuleActivityChat } from './chat';
import { ModuleActivitySpoken } from './spoken';
import { ModuleActivityMultipleChoice } from './multiple-choice';

export function ModuleActivity({ item: activity, participant }) {
	const type = ['content-theory', 'debate', 'character-talk', 'free-conversation', 'exercise'].includes(activity.type)
		? 'chat'
		: activity.type;

	return (
		<ConditionalContainer
			condition={type}
			options={{
				chat: <ModuleActivityChat activity={activity} participant={participant} />,
				spoken: <ModuleActivitySpoken activity={activity} participant={participant} />,
				written: <ModuleActivitySpoken activity={activity} participant={participant} />,
				'hand-written': <ModuleActivitySpoken activity={activity} participant={participant} />,
				'multiple-choice': <ModuleActivityMultipleChoice activity={activity} participant={participant} />
			}}
		/>
	);
}

/**
 * File: ts\views\assignment\item\activity\label.tsx
 */
import React from 'react';
import { useDashboardContext } from '../../../context';
import { Icon } from 'pragmate-ui/icons';

export function ModuleActivityMessages({ item, participant }) {
	const activity = item;
	const { texts } = useDashboardContext();
	const hasParticipated = participant.activities.has(activity.id);
	const participantActivity = participant.activities.get(activity.id);

	let type = 'warning';
	let label = texts.activities.status.pending;

	if (hasParticipated) {
		type = 'success';
		label = texts.activities.status.done;
	}

	if (['content-theory', 'debate', 'character-talk'].includes(activity.type)) {
		if (participantActivity?.interactions) {
			label = `${participantActivity?.interactions.count} ${texts.activities.interactions}`;
		} else {
			const totalMessages = participantActivity?.messages?.count ?? 0;
			label = `${totalMessages} ${texts.activities.interactions}`;
		}
	}

	if (activity.type === 'spoken' && item.data) {
		const icons = Object.values(item.data)
			.map(data => (data as any).icon)
			.join('');
		label = icons;
		type = 'default';
	}

	if (activity.type === 'assessment' && activity.subtype === 'multiple-choice' && item.data) {
		const { correct, total } = item.data.counters;
		if (correct < total / 2) type = 'error';
		label = `${correct} / ${total}`;
	}

	if (hasParticipated && participantActivity?.messages) {
		label = `${texts.messageCounter} ${participantActivity?.messages.count}`;
	}

	const hasAlerts = participantActivity?.alerts?.length;
	const cls = `activity-status${hasAlerts ? ' has-alerts' : ''}`;
	return (
		<div className={cls}>
			<span>{label}</span>
			{hasAlerts ? <Icon icon="error" className="error-icon" /> : null}
		</div>
	);
}

/**
 * File: ts\views\assignment\item\activity\multiple-choice.tsx
 */
import React from 'react';
import { useDashboardContext } from '../../../context';
import { ModuleActivityMessages } from './label';
import { ActivityIcon } from '../../../components/activity-icon';

export function ModuleActivityMultipleChoice({ activity, participant }) {
	const { user } = participant;
	const { setShowDrawer, store } = useDashboardContext();
	const participantActivity = participant.activities.get(activity.id);

	const onClick = event => {
		event.stopPropagation();
		event.preventDefault();
		store.loadUserTracking(user.id);

		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				activitySelected: activity.id,
				participant,
				activity
			}
		});
	};

	return (
		<li onClick={onClick} key={`${user.id}.${activity.id}`} className="card-student-item">
			<div>
				<ActivityIcon type={activity.type} />
			</div>
			<div className="activity-title__container-content">
				<span className="activity-title">{activity.title}</span>
				<div className="user-activity__information">
					<div>
						<ModuleActivityMessages item={activity} participant={participant} />
					</div>
					<div>
						{participantActivity?.counters ? (
							<div className="user-activity__information user-activity__information-multiple-choice">
								<span className="activity-item-counter">{participantActivity.counters.correct}</span>
								<span className="activity-item-divider">/</span>
								<span className="activity-item-counter">{participantActivity.counters.total}</span>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</li>
	);
}

/**
 * File: ts\views\assignment\item\activity\spoken.tsx
 */
import React from 'react';
import { useDashboardContext } from '../../../context';
import { ModuleActivityMessages } from './label';
import { ActivityIcon } from '../../../components/activity-icon';

import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { List } from 'pragmate-ui/list';
export function ModuleActivitySpoken({ activity, participant }) {
	const { user } = participant;

	const { setShowDrawer, store } = useDashboardContext();
	const participantActivity = participant.activities.get(activity.id);

	const onClick = event => {
		event.stopPropagation();
		event.preventDefault();
		const tracking = store.loadUserTracking(user.id);

		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				activitySelected: activity.id,
				tracking,
				participant,
				activity
			}
		});
	};

	const IconItem = ({ item: icon }) => <AppIcon icon={`points${icon.points}`} />;
	return (
		<li onClick={onClick} key={`${user.id}.${activity.id}`} className="card-student-item">
			<div>
				<ActivityIcon type={activity.type} />
			</div>
			<div className="activity-title__container-content">
				<span className="activity-title">{activity.title}</span>
				<div className="user-activity__information">
					<ModuleActivityMessages item={activity} participant={participant} />
					<div className="spoken-icons">
						<List items={participantActivity?.objectives} control={IconItem} />
					</div>
				</div>
			</div>
		</li>
	);
}

/**
 * File: ts\views\assignment\item\activity\status.tsx
 */
import React from 'react';

import { ActivityObjectiveStatusIcon } from '../../../components/objective-icon';
import { useDashboardContext } from '../../../context';

export function ModuleActivityStatus({ item, participant }) {
	const activity = item;
	const { texts } = useDashboardContext();
	const participantActivity = participant.activities.get(activity.id);

	if (!participantActivity?.progress?.objectives) return null;
	const icons = participantActivity?.progress?.objectives?.map((item, index) => (
		<ActivityObjectiveStatusIcon key={`${item?.text}-${index}-icon`} item={item} />
	));

	return <div className="activity-status__container">{icons}</div>;
}

/**
 * File: ts\views\assignment\item\index.tsx
 */
import { Link } from 'pragmate-ui/components';
import { Image } from 'pragmate-ui/image';
import { List } from 'pragmate-ui/list';
import React from 'react';
import { useDashboardContext } from '../../context';
import { ModuleActivity } from './activity';

export function Item({ item }) {
	const { model, store, setShowDrawer } = useDashboardContext();
	const { user } = item;

	const participantUri = `/assignments/${store.assignmentId}/dashboard/participant/${item.user.id}`;
	const openDrawer = event => {
		event.preventDefault();
		event.stopPropagation();
		store.loadUserTracking(user.id);
		setShowDrawer({
			show: true,
			view: 'student',
			data: {
				participant: item
			}
		});
		localStorage.setItem('student.details', JSON.stringify(item.user));

		return false;
	};
	console.log(0.2);
	return (
		<li className="dashboard-card card__user">
			<header>
				<Image src={user?.photoUrl} alt={`${user.name}-avatar`} className="avatar__image" />
				<Link href={participantUri} onClick={openDrawer}>
					<h5>{user.name}</h5>
				</Link>
			</header>
			<div className="detail__info">
				<List
					className="user-activity__data"
					specs={{ participant: item }}
					items={model.activities.items}
					control={ModuleActivity}
				/>
			</div>
		</li>
	);
}

/**
 * File: ts\views\components\activity-icon.tsx
 */
import * as React from 'react';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { IconBox } from './icon-box';

export /*bundle*/ function ActivityIcon({ type, className }: { type: string; className?: string }) {
	const cls = `icon-box-container activity--${type} pui-box-icon${className ? ` ${className}` : ''}`;
	return (
		<div className={cls}>
			<IconBox name={type} />
		</div>
	);
}

/**
 * File: ts\views\components\drawer-alerts\index.tsx
 */
import * as React from 'react';
import { List } from 'pragmate-ui/list';
import { DrawerAlertItem } from './item';
import { useDashboardContext } from '../../context';

export /*bundle*/ function DrawerAlert({ alerts, user }) {
	const { texts } = useDashboardContext();

	if (!alerts?.length) return null;

	return (
		<>
			<List
				as="div"
				className="mt-15 ds-drawer__list"
				items={alerts}
				control={DrawerAlertItem}
				specs={{ user }}
			/>
		</>
	);
}

/**
 * File: ts\views\components\drawer-alerts\item.tsx
 */
import * as React from 'react';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import { List } from 'pragmate-ui/list';
import { CollapsibleContainer, CollapsibleHeader, CollapsibleContent } from 'pragmate-ui/collapsible';
import { useDashboardContext } from '../../context';
import { settings } from '@aimpact/ailearn-app/model/wrapper';
export /*bundle*/ function DrawerAlertItem({ item, user }) {
	const ref = React.useRef(null);
	const { texts } = useDashboardContext();
	const [open, setOpen] = React.useState(false);
	const cls = `ds-drawer__activity-item ${open ? 'is-open' : ''}`;
	const onToggle = () => {
		setOpen(!open);
		return true;
	};

	return (
		<article className={cls} ref={ref}>
			<CollapsibleContainer onToggle={onToggle}>
				<CollapsibleHeader>
					<span>{item.text}</span>
				</CollapsibleHeader>
				<CollapsibleContent>
					<div className="alert-item">
						{item.iteration.assistant ? (
							<>
								<h6>{settings.APP_NAME}</h6>
								<Markdown content={item.iteration.assistant} />
							</>
						) : (
							<>{texts?.noMessages}</>
						)}

						<h6>{user.name}</h6>
						<Markdown content={item.iteration.student} />
					</div>
				</CollapsibleContent>
			</CollapsibleContainer>
		</article>
	);
}

/**
 * File: ts\views\components\empty.tsx
 */
import { ICONS } from '@aimpact/ailearn-app/components/icons';
import { PageContainer } from '@aimpact/ailearn-app/components/ui';
import config from '@aimpact/ailearn-app/config';
import React from 'react';
import { DashboardContext, DrawerContext, DrawerData } from '../context';
import { Empty as EmptyComponent } from 'pragmate-ui/empty';
import { DashboardActions } from '../actions';
import { Header } from '../header';

export function Empty({ store, setShowDrawer, texts }) {
	const value = { texts, model: store.model, store, setShowDrawer };
	return (
		<DashboardContext.Provider value={value}>
			<PageContainer>
				<DashboardActions disabled={true} />
				<Header />
				<EmptyComponent className="empty-section__container" icon={ICONS.classworks}>
					<h3 className="title">{store.model.module.title}</h3>
					<p>{texts.empty}</p>
				</EmptyComponent>
			</PageContainer>
		</DashboardContext.Provider>
	);
}

/**
 * File: ts\views\components\icon-box.tsx
 */
import * as React from 'react';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';

export /*bundle*/ function IconBox({ name, className }: { name: string; className?: string }) {
	const cls = `pui-box-icon${className ? ` ${className}` : ''}`;
	return <AppIcon icon={name} className={cls} />;
}

/**
 * File: ts\views\components\objective-icon.tsx
 */
import React from 'react';

import { Tooltip } from 'pragmate-ui/tooltip';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { useDashboardContext } from '../context';

export function ActivityObjectiveStatusIcon({ item }) {
	const { texts } = useDashboardContext();
	const iconNames = {
		'in-progress': 'activityInProgress',
		pending: 'activityPending',
		completed: 'activityCompleted',
		outstanding: 'activityOutstanding'
	};

	const status = ['undefined', 'string'].includes(typeof item.status) ? item.status : item.status.text;

	return (
		<Tooltip content={`${item.name}: ${texts.activities.objectivesStatus[status]}`} key={`${item.name}.${status}`}>
			<AppIcon icon={iconNames[status]} className={`activity-status__icon icon-${status}`} />
		</Tooltip>
	);
}

/**
 * File: ts\views\context.ts
 */
import React from 'react';
import type { StoreManager } from '../store';
import type { Dashboard } from '../model';
import { AssignmentActivity } from '../model/activities/activity';
import { ParticipantActivity } from '../model/participants/activities/activity';

export type DrawerData = {
	show: boolean;
	view: string;
	data?: {
		tracking?: any;
		participant?: ParticipantActivity;
		activity?: AssignmentActivity;
		activitySelected?: string; // id of the activity
		participantActivity?: ParticipantActivity;
		chat?: any;
	};
	student?: Record<string, any>;
	tracking?: any;
};
interface DashboardContextProps {
	texts: Record<string, any>;
	model: Dashboard;
	store: StoreManager;
	showDrawer: Partial<DrawerData>;
	setShowDrawer: (showDrawer: Partial<DrawerData>) => void;
	view: 'general' | 'activity';
	onRefresh: () => void;
	setView: (view: 'general' | 'activity') => void;
	drawerContent: any;
	setDrawerContent: (drawerContent: any) => void;
}
export const DashboardContext = React.createContext({} as Partial<DashboardContextProps>);
export const useDashboardContext = () => React.useContext(DashboardContext);

export const DrawerContext = React.createContext({} as Partial<DashboardContextProps>);
export const useDrawerContext = () => React.useContext(DrawerContext);

/**
 * File: ts\views\drawer\content.tsx
 */
import * as React from 'react';
import * as Drawer from 'pragmate-ui/drawer';

import { useDashboardContext } from '../context';

export function Wall({ item }) {
	const { user: student } = item;
	const [fetching, setFetching] = React.useState(false);
	const cls = `ds-drawer-container${fetching ? ' is-fetching' : ''}`;

	return (
		<div className={cls}>
			<header className="dashboard-drawer__header">
				<section className="user__title flex-container flex-space-between">
					<h2>{student.name}</h2>
					<div>
						<Drawer.CloseButton />
					</div>
				</section>
			</header>
		</div>
	);
}

/**
 * File: ts\views\drawer\header-skeleton.tsx
 */
import { SkeletonText } from '@aimpact/ailearn-app/components/ui';
import * as Drawer from 'pragmate-ui/drawer';
import { IconButton } from 'pragmate-ui/icons';
import * as React from 'react';
import { StudentDrawerHeader } from '../assignment/drawer/header';

export function DrawerSkeleton({ item }) {
	return (
		<>
			<header className="dashboard-drawer__header">
				<section className="user__title flex-container flex-space-between">
					<div>
						<h2>
							{item?.participant?.user?.name ? (
								<>{item.participant.user.name}</>
							) : (
								<SkeletonText height="8px" width="100px" />
							)}
						</h2>
						<div className="drawer__header__subtext">
							<SkeletonText height="11px" width="100px" color="#fff" />
						</div>
					</div>

					<div className="drawer__header-actions">
						<IconButton icon="refresh" className="circle refresh-icon" disabled />
						<Drawer.CloseButton />
					</div>
				</section>
			</header>
		</>
	);
}

/**
 * File: ts\views\drawer\index.tsx
 */
import React from 'react';

import { routing } from '@beyond-js/kernel/routing';
import { ConditionalContainer } from 'pragmate-ui/components';
import { Drawer } from 'pragmate-ui/drawer';
import { ConfirmModal } from 'pragmate-ui/modal';
import { StudentAssignmentSummary } from '../assignment/drawer';
import { StudentDrawerChat } from '../assignment/drawer/drawer-chat';
import { useDrawerContext } from '../context';
import { Wall } from './wall';

export function AsideDrawer() {
	const { texts, showDrawer, store, setShowDrawer } = useDrawerContext();
	const [open, setOpen] = React.useState(false);
	const [fetching, setFetching] = React.useState(false);

	React.useEffect(() => {
		if (!showDrawer?.view) {
			routing.replaceState({}, null, `?`);
			return;
		}
		routing.pushState(`?drawer=${showDrawer.view}`);
	}, [showDrawer.view]);

	React.useEffect(() => {
		if (showDrawer?.show) globalThis.document.querySelector('html').style.overflow = 'hidden';
		else globalThis.document.querySelector('html').style.overflow = 'auto';
	}, [showDrawer?.show]);
	if (showDrawer.show === false) return;
	const toggleOpen = () => setOpen(!open);
	const addCredits = async () => {
		try {
			// setFetching(true);
			await store.model.addCredits(showDrawer.data.tracking);
			setFetching(false);
		} catch (e) {
			console.error(e);
		} finally {
			// setFetching(false);
		}
	};
	const onConfirm = async () => {
		await addCredits();
		toggleOpen();
	};

	const cls = `ds-drawer ${fetching ? ' is-fetching' : ''}`;

	return (
		<>
			<Drawer
				className={cls}
				position="right"
				open={showDrawer.show}
				onClose={() => setShowDrawer({ show: false })}
			>
				<ConditionalContainer
					condition={showDrawer.view}
					options={{
						wall: <Wall item={showDrawer.data} />,
						'student-activity': <StudentAssignmentSummary item={showDrawer.data} />,
						'student-chat': <StudentDrawerChat item={showDrawer.data} />,
						student: <StudentAssignmentSummary item={showDrawer.data} />
					}}
				/>
			</Drawer>
			{open && (
				<ConfirmModal show onConfirm={onConfirm} onCancel={toggleOpen}>
					<div className="modal-overlay" onClick={toggleOpen} />
					<div className="modal-content">
						<h3>{texts.addCredits.title}</h3>
						<p>{texts.addCredits.description}</p>
					</div>
				</ConfirmModal>
			)}
		</>
	);
}

/**
 * File: ts\views\drawer\wall.tsx
 */
import { WallView } from '@aimpact/ailearn-app/dashboard/wall/widget.code';
import * as Drawer from 'pragmate-ui/drawer';
import { IconButton } from 'pragmate-ui/icons';
import * as React from 'react';
import { useDrawerContext } from '../context';
export function Wall({ item }) {
	const { store } = useDrawerContext();

	const [fetching, setFetching] = React.useState(false);
	const cls = `ds-drawer-container${fetching ? ' is-fetching' : ''}`;
	const onRefresh = async event => {
		try {
			setFetching(true);
			event.stopPropagation();
			await store.wall.load();
			setFetching(false);
		} catch (e) {
			console.error(e);
		}
	};
	return (
		<div className={cls}>
			<header className="dashboard-drawer__header">
				<section className="user__title flex-container flex-space-between">
					<h2>Wall</h2>
					<div className="drawer__header-actions">
						<IconButton icon="refresh" className="circle refresh-icon" onClick={onRefresh} />
						<Drawer.CloseButton />
					</div>
				</section>
			</header>
			<section className="ds-drawer__content">
				<WallView store={store.wall} texts={store.texts.wall} />
			</section>
		</div>
	);
}

/**
 * File: ts\views\global.tsx
 */
import React from 'react';
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'app-dashboard-wall': { id: string };
		}
	}
}

/**
 * File: ts\views\header\activity-filter.tsx
 */
import React from 'react';
import { useDashboardContext } from '../context';
import { IconButton, Icon } from 'pragmate-ui/icons';
import { ICONS } from '@aimpact/ailearn-app/components/icons';
import { Tooltip } from 'pragmate-ui/tooltip';
export function ActivityFilter({ item }) {
	const { store } = useDashboardContext();
	const icon = ICONS[item.type];
	let cls = `activity-type__icon activity--${item.type}`;

	if (store.activitySelected?.id === item.id) cls += ' active';

	const title = item.title;
	const handleClick = event => store.selectActivity(item);

	return (
		<Tooltip content={title}>
			<section className={cls} onClick={handleClick}>
				<Icon icon={icon} />
			</section>
		</Tooltip>
	);
}

/**
 * File: ts\views\header\index.tsx
 */
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { EntityImage } from '@aimpact/ailearn-app/components/ui';
import { routing } from '@beyond-js/kernel/routing';
import { CollapsibleContainer, CollapsibleContent, CollapsibleHeader } from 'pragmate-ui/collapsible';
import { Link } from 'pragmate-ui/components';
import React from 'react';
import { useDashboardContext } from '../context';
import { UserData } from './user-data';

export function Header() {
	const { model, texts } = useDashboardContext();
	const { title, description, picture, creator, owner } = model.module;

	const onClassroomClick = event => {
		event.stopPropagation();
		event.preventDefault();
		routing.pushState(`/classrooms/view/${model.classroom.id}`);
	};
	return (
		<CollapsibleContainer className="page__header-container">
			<CollapsibleHeader>
				<header className="dashboard-header">
					<EntityImage entity="module" src={picture} alt={title} />
					<div>
						<Link href={`/assignments/${model.id}`}>
							<h1>{title}</h1>
						</Link>
						<div className="dashboard-header__data">
							<div>
								<div className="dashboard-header__classroom" onClick={onClassroomClick}>
									<AppIcon icon="classroom" />
									<span className="assignment-classroom">{model.classroom.name}</span>
								</div>
								<div className="users-data__container">
									{creator && <UserData data={creator} label={texts.creator} />}
									{owner && <UserData data={owner} label={texts.owner} />}
								</div>
							</div>
						</div>
					</div>
				</header>
			</CollapsibleHeader>
			<CollapsibleContent>
				<div className="dashboard-content">
					<section className="main-content">
						<p className="p1 hidden-xs">{description}</p>
					</section>
					<div className="actions"></div>
				</div>
			</CollapsibleContent>
		</CollapsibleContainer>
	);
}

/**
 * File: ts\views\header\student-header.tsx
 */
import React from 'react';
import { useDashboardContext } from '../context';
import { Input } from 'pragmate-ui/form';
import { List } from 'pragmate-ui/list';
import { ActivityFilter } from './activity-filter';
import { IconButton } from 'pragmate-ui/icons';

export function StudentsHeader() {
	const { model, texts, store } = useDashboardContext();
	const listCls = `activity-types__list${store.activitySelected ? ' activity-selected' : ''}`;
	const [refreshing, setRefreshing] = React.useState(false);

	const onFilter = event => {
		store.filter(event.currentTarget.value);
	};
	return (
		<header className="dashboard-students__header">
			<div className="ds-students-header__col">
				<section>
					<Input
						onChange={onFilter}
						type="text"
						className="header__search"
						placeholder={texts.list.search}
						icon="search"
					/>
				</section>
			</div>
			<div className="ds-students-header__col">
				<h6>{texts.studentHeader.filter}</h6>
				<List className={listCls} items={model.activities.items} control={ActivityFilter} />
			</div>
		</header>
	);
}

/**
 * File: ts\views\header\user-data.tsx
 */
import * as React from 'react';
import { Image } from 'pragmate-ui/image';
import { IUser } from '../../model/types';

export function UserData({ label, data: { photoUrl, name } }: { label?: string; data: IUser }) {
	return (
		<div className="user-data__section">
			<h6 className="user-data__label">{label}</h6>
			<section className="user-data__detail">
				<Image className="user-data__img" src={`${photoUrl}`} />
				<span className="user-data__name">{name}</span>
			</section>
		</div>
	);
}

/**
 * File: ts\views\index.tsx
 */
import { useStore } from '@aimpact/ailearn-app/components/hooks';
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { PageContainer, PageLoader } from '@aimpact/ailearn-app/components/ui';
import { ConditionalContainer } from 'pragmate-ui/components';
import React, { useState } from 'react';
import type { StoreManager } from '../store';
import { NotFound } from './404';
import { DashboardActions } from './actions';
import { ActivityView } from './activities/view';
import { GeneralView } from './assignment/general';
import { Empty } from './components/empty';
import { DashboardContext, DrawerContext, DrawerData } from './context';
import { AsideDrawer } from './drawer';
import { Header } from './header';
import { StudentsHeader } from './header/student-header';

export /*bundle*/ function View({ store }: { store: StoreManager }) {
	const [showDrawer, setShowDrawer] = useState<Partial<DrawerData>>({ show: false, data: null });

	useStore(store, ['change', 'data.updated', 'fetching.changed']);
	const { state } = store;
	const { texts } = store;
	const ref = React.useRef(null);

	const value = {
		texts,
		model: store.model,
		store,
		setShowDrawer,
		view: store.view,
		setView: view => (store.view = view)
	};

	if (!store.ready) return <PageLoader fetching={true} />;

	if (!store.model.found) return <NotFound store={store} texts={texts} />;
	if (store.model.totalParticipants === 0) return <Empty store={store} texts={texts} setShowDrawer={setShowDrawer} />;

	const drawerValue = { texts, model: store.model, showDrawer, store, setShowDrawer };
	const cls = `dashboard-container${state.fetching ? ' is-fetching' : ''}`;

	return (
		<div ref={ref}>
			{store.model.archived ? (
				<div className="notifications-bar center-items notifications--info">
					<AppIcon icon="info" />
					{texts.archived}
				</div>
			) : null}
			<PageContainer className={cls}>
				<DashboardContext.Provider value={value}>
					<DashboardActions />
					<Header />
					<StudentsHeader />
					<ConditionalContainer
						condition={store.view}
						options={{
							general: <GeneralView />,
							activity: <ActivityView />
						}}
					/>
				</DashboardContext.Provider>
				<DrawerContext.Provider value={drawerValue}>
					<AsideDrawer />
				</DrawerContext.Provider>
			</PageContainer>
		</div>
	);
}

/**
 * File: wall\ts\controller.ts
 */
import { ReactWidgetController } from '@beyond-js/react-18-widgets/base';
import { StoreManager } from './store';
import { WallView } from './views';
import { LayoutBroker } from '@aimpact/ailearn-app/dashboard-layout.widget';
export /*bundle*/
class Controller extends ReactWidgetController {
	#store: StoreManager;
	createStore() {
		this.#store = new StoreManager(this.attributes);
		return this.#store;
	}

	get Widget() {
		return WallView;
	}

	constructor(a) {
		super(a);
	}
	/**
	 * this method is executed when the widget is show
	 */
	show() {
		this.#store.load(this.uri.vars.get('id'));
	}

	hola() {
		console.log('hola');
	}
}

/**
 * File: wall\ts\interface.ts
 */
export interface IAssignmentWallMessageBase {
	time: number;
	user: { id: string; name: string; photoUrl: string };
	activity: { id: string; title: string };
	chat: { id: string };
	prompt: { content: string };
	answer: { content: string };
}

/**
 * File: wall\ts\store.ts
 */
import { DashboardWall } from '@aimpact/ailearn-sdk/core';
import { Assignment } from '@aimpact/ailearn-sdk/tracking';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { CurrentTexts } from '@beyond-js/kernel/texts';
import type { IWidgetStore } from '@beyond-js/widgets/controller';
import { module } from 'beyond_context';
import { IAssignmentWallMessageBase } from './interface';

export class StoreManager extends ReactiveModel<StoreManager> implements IWidgetStore {
	isStore = true;
	#model: DashboardWall;

	get model() {
		return this.#model;
	}

	#items: IAssignmentWallMessageBase[];
	get items() {
		return this.#items;
	}

	#id: string;
	get id() {
		return this.#id;
	}

	#assignment: Assignment;
	get assignment() {
		return this.#assignment;
	}
	#texts: CurrentTexts<StoreManager> = new CurrentTexts(module.specifier);
	get texts() {
		return this.#texts?.value;
	}
	get ready() {
		return super.ready && this.#texts.ready;
	}
	constructor(attributes) {
		super();

		this.#texts.on('change', this.triggerEvent);
		this.load(attributes.get('id'));
	}

	refresh = async () => {
		try {
			this.fetching = true;
			const { messages } = await this.model.load({ id: this.#id });
			this.#items = messages;
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	};

	async load(id) {
		try {
			this.#model = new DashboardWall();
			this.#id = id;
			const { messages } = await this.#model.load({ id });

			this.#items = messages;

			super.ready = true;
			this.triggerEvent();
		} catch (e) {
			console.error(e);
		}
	}
}

/**
 * File: wall\ts\views\components\profile-icon.tsx
 */
import { AppIcon } from '@aimpact/ailearn-app/components/icons';
import { Image } from 'pragmate-ui/image';
import React, { useState } from 'react';

export function ProfileIcon({ role, photoUrl }) {
	const [loadError, setLoadError] = useState(false);
	// the local storage is used to store the user's default profile icon while is defined a better way to handle this.

	const handleLoadError = () => setLoadError(true);
	const src = role === 'user' ? photoUrl : '/assets/images/branding/profile.png';

	return (
		<picture className="picture__container">
			{(photoUrl && !loadError) || role !== 'user' ? (
				<Image src={src} alt="user image profile" onError={handleLoadError} />
			) : (
				<AppIcon className="lg" icon="user" />
			)}
		</picture>
	);
}

/**
 * File: wall\ts\views\content\index.tsx
 */
import React from 'react';
import { useWallDashboardContext } from '../context';
import { Item } from './item';
import { List } from 'pragmate-ui/list';

export /*bundle*/ const Content: React.FC = () => {
	const { items } = useWallDashboardContext();

	return <List className="wall__container" items={items} control={Item} />;
};

/**
 * File: wall\ts\views\content\item.tsx
 */
import React from 'react';
import { useWallDashboardContext } from '../context';
import { Message } from './message';

export function Item({ data }) {
	const { texts } = useWallDashboardContext();

	return (
		<div className="wall-user-container" id={data.time}>
			<p className="title-activity h3">{data.activity.title}</p>
			<Message role="user" text={data.prompt.content} user={data.user} />
			<Message role="system" text={data.answer.content} user={undefined} />
		</div>
	);
}

/**
 * File: wall\ts\views\content\message.tsx
 */
import React, { useState } from 'react';
import { ProfileIcon } from '../components/profile-icon';
import { IconButton } from 'pragmate-ui/icons';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';

export function Message({ role, text, user }) {
	const [isExpanded, setIsExpand] = useState(false);
	const cls = `wall-message ${role}`;

	function toggleText() {
		setIsExpand(!isExpanded);
	}

	function applyEllipsis(text: string, maxLength: number): string {
		return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
	}

	const output = applyEllipsis(text, isExpanded ? 5000 : 180);
	const isTruncated = text.length > 180;

	return (
		<div className={cls}>
			<section className="picture__container">
				<ProfileIcon role={role} photoUrl={user?.photoUrl} />
			</section>
			<section className="wall-message__container">
				<div className={`message-text__container expand-${isExpanded}`}>
					{user && <h6 className="message-user__label-text p2">{user.name}</h6>}
					<Markdown className={`message__label-text p2 expand-${isExpanded}`} content={output} />
				</div>
			</section>
			{isTruncated && (
				<section className="wall-actions__container">
					<IconButton
						onClick={toggleText}
						className="md"
						icon={!isExpanded ? 'arrowDropDown' : 'arrowDropUp'}
					/>
				</section>
			)}
		</div>
	);
}

/**
 * File: wall\ts\views\context.ts
 */
import React from 'react';
import { StoreManager } from '../../../ts/store';
import { IAssignmentWallMessageBase } from '../../../ts/interface';

interface IContext {
	store: StoreManager;
	texts: Record<string, any>;
	items: IAssignmentWallMessageBase[];
	fetching: boolean;
	totalItems: number;
}
export const WallDashboardContext = React.createContext<IContext>({} as IContext);
export const useWallDashboardContext = () => React.useContext(WallDashboardContext);

/**
 * File: wall\ts\views\empty.tsx
 */
import React from 'react';
import { EmptyCard } from '@aimpact/ailearn-app/components/ui';
import { useWallDashboardContext } from './context';

export function EmptyList() {
	const { texts } = useWallDashboardContext();
	return <EmptyCard text={texts.emptyTitle} description={texts.empty} icon="info" />;
}

/**
 * File: wall\ts\views\header.tsx
 */
import { NavbarHeader } from '@aimpact/ailearn-app/components/navbar-header.code';
import React from 'react';
import { useWallDashboardContext } from './context';
import { IconButton } from 'pragmate-ui/icons';
import config from '@aimpact/ailearn-app/config';
export /*bundle*/ function Header() {
	const { store } = useWallDashboardContext();

	return (
		<>
			<NavbarHeader
				breadcrumb={[
					['Assignment', `/dashboard/${store.id}`],
					['Wall', '']
				]}
			>
				<IconButton icon="refresh" onClick={store.refresh} />
			</NavbarHeader>
		</>
	);
}

/**
 * File: wall\ts\views\index.tsx
 */
import { PageContainer, PageLoader } from '@aimpact/ailearn-app/components/ui';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import React from 'react';
import type { StoreManager } from '../../../ts/store';
import { WallDashboardContext } from './context';
import { ConditionalContainer } from 'pragmate-ui/components';
import { Content } from './content';
import { EmptyList } from './empty';
import { WallStore } from '../../../ts/store/wall';
import { useStore } from '@aimpact/ailearn-app/components/hooks';
import { AnimatedContainer } from '@aimpact/ailearn-app/components/ui';
export interface IViewState {
	ready: boolean;
	fetching: boolean;
	items: any[];
}

export /*bundle */ function WallView({ store, texts }: { store: WallStore }) {
	useStore(store);
	const state = {
		ready: store.ready,
		fetching: store.fetching,
		items: store.items
	};

	if (!state.ready) return <PageLoader fetching={state.fetching} />;

	const totalItems = store.items.length;

	const contextValue = {
		texts,
		store,
		items: store.items,
		fetching: store.fetching,
		totalItems
	};

	return (
		<WallDashboardContext.Provider value={contextValue}>
			<AnimatedContainer>
				<ConditionalContainer
					condition={!!store.items.length}
					ternary
					options={{
						false: <EmptyList />,
						true: <Content />
					}}
				/>
			</AnimatedContainer>
		</WallDashboardContext.Provider>
	);
}

