import React from 'react';
import { useUploadContext } from '../../context';
import { Button } from 'pragmate-ui/components';

export function EmptyFiles() {
	const { openDialog, store, texts } = useUploadContext();
	const text = store.items.length ? texts.empty.noResult : texts.empty.start;

	return (
		<div className='empty'>
			<h1>{text}</h1>
			<p>
				<strong>{texts.empty.sub}</strong>
				<br /> {texts.empty.desc}
			</p>
			<Button icon='folder' onClick={() => openDialog('')} label={texts.empty.upload} />
		</div>
	);
}
