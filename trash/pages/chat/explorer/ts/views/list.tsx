import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { ChatListItem } from './item';
import { useConversationsContext } from './context';
import { organizeByParent } from './organizer';

export function ChatList({ search }) {
	const { chats } = useConversationsContext();
	const [items, setItems] = React.useState(organizeByParent(chats?.items));
	useBinder([chats], () => setItems(organizeByParent(chats.items)));

	if (!items.length) return null;
	const chatList = items.map((item, i) => <ChatListItem key={i} item={item} />);
	return (
		<div className='sidebar__list'>
			<ul>{chatList}</ul>
		</div>
	);
}
//
