import React from 'react';
import { UIManager } from '@aimpact/chat/ui/manager';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useTexts } from '@aimpact/chat/shared/hooks';
import { module } from 'beyond_context';
import { Button } from 'pragmate-ui/components';
import { Input } from '@aimpact/chat/shared/components';
import { AddChat } from './chat-form';
import { ConversationsContext } from './context';
import { ChatList } from './list';

export /*bundle*/
function Conversations({ store }) {
	const [search, setSearch] = React.useState('');
	const dialogRef = React.useRef(null);

	const [showModal, setShowModal] = React.useState(false);
	const [textsReady, texts] = useTexts(module.specifier);
	const closeDialog = () => {
		UIManager.modalOpened = false;
	};

	useBinder(
		[UIManager],
		() => {
			// UIManager.modalOpened ? openDialog() : closeDialog();
			setShowModal(UIManager.modalOpened);
		},
		'modalOpened'
	);

	function handleSearch(e) {
		setSearch(e.target.value);
	}

	if (!textsReady) return null;
	const openDialog = () => setShowModal(true);

	return (
		<ConversationsContext.Provider
			value={{
				store,
				closeDialog: () => setShowModal(false),
				openDialog,
				totalChats: store.chats?.items?.length,
				chats: store.chats,
				showChildren: false
			}}
		>
			<article>
				<header className="aside__top">
					<h3>{texts.title}</h3>
				</header>
				<div className="sidebar__search">
					<Input
						label="Search Chats"
						disabled={!!store.chats?.items?.length}
						onChange={handleSearch}
						type="search"
						required
						value={search}
					/>
					<Button onClick={openDialog} icon="plus" />
				</div>
				<ChatList search={search} />
				{showModal && <AddChat dialogRef={dialogRef} />}
			</article>
		</ConversationsContext.Provider>
	);
}
