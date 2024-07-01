import React from 'react';
import { useUploaderModalContext } from './context';
import { Icon, IconButton } from 'pragmate-ui/icons';

export function Item({ item, index }) {
	const { deleteFile } = useUploaderModalContext();
	const { name } = item;
	const onDelete = e => {
		e.stopPropagation();
		deleteFile(index);
	};

	return (
		<li key={`${name}.${index}`}>
			<span>
				<Icon icon='file' /> {name}
			</span>
			<section className='item__actions'>
				<IconButton icon='delete' onClick={onDelete} />
			</section>
		</li>
	);
}
