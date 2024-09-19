import React from 'react';
import { routing } from '@beyond-js/kernel/routing';
import { ItemConversationsContext, useConversationsContext } from '../context';
import { ItemLabel } from './label';
import { EditingItem } from './editing';

export const ChatListItem = ({ item }) => {
	const { pathname } = routing.uri;
	const chatId = pathname.split('/')[2];
	const isCurrent = chatId === item.id;
	const isParent = !!item.children.length;
	const { showChildren } = useConversationsContext();
	const [expanded, setExpanded] = React.useState(false);
	const [editing, setEditing] = React.useState(false);
	let children = [];
	if (isParent) {
		item.children.forEach(child => {
			children.push(<ChatListItem key={child.id} item={child} />);
		});
	}

	const cls = `sidebar-item ${isCurrent ? 'current' : ''} ${isParent ? ` is-parent` : ''}`;
	const subItemsCls = `subitems__list ${expanded ? 'visible' : ''}`;

	const value = {
		item,
		chatId,
		setExpanded,
		editing,
		setEditing,
		expanded,
		isParent,
		isCurrent,
	};
	const Control = editing ? EditingItem : ItemLabel;
	return (
		<ItemConversationsContext.Provider value={value}>
			<li className={cls}>
				<Control />
				{isParent && showChildren && <ul className={subItemsCls}>{children}</ul>}
			</li>
		</ItemConversationsContext.Provider>
	);
};
