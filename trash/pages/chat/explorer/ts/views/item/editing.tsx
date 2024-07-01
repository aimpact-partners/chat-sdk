import React from 'react';
import { Input } from 'pragmate-ui/form';
import { Icon } from 'pragmate-ui/icons';
import { IconButton } from 'pragmate-ui/icons';
import { Link } from 'pragmate-ui/components';
import { Tooltip } from 'pragmate-ui/tooltip';
import { useConversationsContext, useItemConversationsContext } from '../context';

export function EditingItem() {
	const { chatId, editing, setEditing, item } = useItemConversationsContext();
	const { store } = useConversationsContext();
	const [newName, setNewName] = React.useState<string>('');
	const handleNameChange = e => setNewName(e.target.value);
	const onSubmit = async e => {
		e.stopPropagation();
		await store.edit(chatId, newName);
	};

	const toggleEdit = e => {
		e.stopPropagation();
		setEditing(!editing);
	};
	return (
		<div className='item-label__container'>
			<Tooltip placement='top' content={item?.name}>
				<Link className='item-label' href={`/chat/${item.id}`}>
					<Icon icon='chat' className='xs' />
					<form onSubmit={onSubmit}>
						<Input type='text' value={newName} placeholder={item?.name} onChange={handleNameChange} />
					</form>
				</Link>
			</Tooltip>
			<div className='item__actions'>
				<IconButton icon='check' type='submit' onClick={onSubmit} />
				<IconButton icon='close' onClick={toggleEdit} />
			</div>
		</div>
	);
}
