import React from 'react';
import { useUploadContext } from '../../context';
import { Button } from 'pragmate-ui/components';

export function EmptyFolders() {
	const { openDialog, texts } = useUploadContext();

	return (
		<div className='empty'>
			<h1>{texts.empty.start}</h1>
			<p>
				<strong>{texts.empty.sub}</strong>
				<br />
				{texts.empty.desc}
			</p>
			<Button icon='folder' onClick={() => openDialog('')}>
				{texts.empty.upload}
			</Button>
		</div>
	);
}
