import React, { useState } from 'react';
import { useUploadContext } from '../../context';
import { ConfirmationModal } from '@aimpact/chat/shared/components';
import { EmptyFiles } from './empty-files';
import { Folder } from './item';
import { SharedFolder } from './shared-folders';

export const FolderList = ({ folders }) => {
	const [openedFolder, setOpenedFolder] = useState(null);
	const { knowledgeBox, setKnowledgeBox, store, texts } = useUploadContext();
	const confirmationRef = React.useRef(null);

	const openConfirmationModal = () => confirmationRef.current.showModal();
	const closeConfirmationModal = () => confirmationRef.current.close();

	function handleFolderClick(folder) {
		const isOpened = openedFolder === folder.id;
		isOpened ? setOpenedFolder(null) : setOpenedFolder(folder.id);
	}
	function openDeleteModal(e, folder) {
		e.stopPropagation();
		setKnowledgeBox(folder);
		openConfirmationModal();
	}
	async function deleteFolder() {
		try {
			const response = await store.remove(knowledgeBox.name);
		} catch (error) {
			console.error(error);
		}
	}

	const foldersList = folders.map((folder, i) => (
		<Folder
			key={`${folder.path}-${i}`}
			handleFolderClick={handleFolderClick}
			folder={folder}
			openedFolder={openedFolder}
			openDeleteModal={openDeleteModal}
		/>
	));
	const sharedFoldersList = store.sharedFolders.map((folder, i) => (
		<SharedFolder key={`${folder.path}-${i}`} sharedFolder={folder} />
	));

	if (!folders.length && !store.sharedFolders.length) return <EmptyFiles />;

	return (
		<div className='folder-list'>
			{[...foldersList, ...sharedFoldersList]}

			<ConfirmationModal
				ref={confirmationRef}
				content={`${texts.confirmation.delete} ${knowledgeBox.path}?`}
				cancel={closeConfirmationModal}
				submit={deleteFolder}
			/>
		</div>
	);
};
