import React from 'react';
import { GridView } from './details/grid-view';
import { TableView } from './details/table-view';
import { useUploadContext } from '../../context';
import { Empty } from 'pragmate-ui/empty';

export function FileDetails({ folder, open, view }) {
	const { store } = useUploadContext();
	const { texts } = useUploadContext();
	async function deleteFile(name) {
		await store.remove(name);
	}

	const View = view === 'grid' ? GridView : TableView;

	const Control = !folder.documents?.length ? (
		<Empty message={texts.folder.empty} icon='info' />
	) : (
		<View folder={folder} deleteFile={deleteFile} />
	);

	return <div className={`folder-container ${open ? 'open' : ''}`}>{Control}</div>;
}
