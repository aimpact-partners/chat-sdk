import React from 'react';
import { Icon, IconButton } from 'pragmate-ui/icons';
import { Link } from 'pragmate-ui/components';
import { Tooltip } from 'pragmate-ui/tooltip';
import { useConversationsContext, useItemConversationsContext } from '../context';

export function ItemLabel() {
	const { chatId, expanded, editing, setEditing, item, isParent, setExpanded } = useItemConversationsContext();
	const { showChildren } = useConversationsContext();
	const toggleEdit = e => {
		e.stopPropagation();
		setEditing(!editing);
	};
	const onDelete = event => event.stopPropagation();
	const onExpand = event => {
		event.stopPropagation();
		setExpanded(!expanded);
	};

	return (
		<div className='item__container'>
			<Tooltip placement='top' content={item?.name}>
				<Link className='item__label-container' href={`/chat/${item.id}`}>
					<Icon icon='chat' className='xs' />
					<span className='item__label-text'>{item?.name}</span>
				</Link>

				<div className='item__actions-container'>
					{isParent && showChildren && (
						<IconButton icon='expandMore' className={`${expanded ? 'expanded' : ''}`} onClick={onExpand} />
					)}
					{/* <span className='item__actions'>
						<IconButton icon='edit' onClick={toggleEdit} />
						<IconButton icon='delete' onClick={onDelete} />
					</span> */}
				</div>
			</Tooltip>
		</div>
	);
}
