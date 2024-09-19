import React from 'react';
import { FileDetails } from '../files';
import { Icon } from 'pragmate-ui/icons';
import { useUploadContext } from '../../context';
import { ShareFolder } from './share';
import { FolderActions } from './actions';
import { UIManager } from '@aimpact/chat/ui/manager';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';

type View = 'list' | 'grid';

export function Folder({ folder, openedFolder, handleFolderClick, openDeleteModal }) {
	const [view, setView] = React.useState<View>('list');
	const [visible, setVisible] = React.useState(false);
	const toggleVisibility = e => {
		e.stopPropagation();
		setVisible(!visible);
	};

	const shareDialog = React.useRef(null);
	const { openDialog } = useUploadContext();

	function addFile(e) {
		e.stopPropagation();
		openDialog(folder);
	}

	function shareFolder(e) {
		e.stopPropagation();
		shareDialog.current.showModal();
	}

	const setNewView = e => {
		e.stopPropagation();
		const { type } = e.currentTarget.dataset;
		setView(type);
		if (!isFolderOpen) handleFolderClick(folder);
	};

	function openChatForm(e) {
		e.stopPropagation();
		AppWrapper.selectedKnowledgeBoxId = folder.id;
		UIManager.modalOpened = true;
	}

	const isFolderOpen = openedFolder === folder.id;

	return (
		<>
			<div key={folder.path} className={`folder ${isFolderOpen ? 'open' : ''}`}>
				<header className="folder__header" onClick={() => handleFolderClick(folder)}>
					<Icon icon="folder" />
					<h3>{folder.path}</h3>
					<FolderActions
						visible={visible}
						setVisible={setVisible}
						setNewView={setNewView}
						view={view}
						isEmpty={!folder.documents?.length}
						addFile={addFile}
						openDeleteModal={e => openDeleteModal(e, folder)}
						shareFolder={shareFolder}
						openChatForm={openChatForm}
					/>
					<Icon icon="list-menu" className="mobile-menu" onClick={toggleVisibility} />
				</header>
				<FileDetails folder={folder} open={isFolderOpen} view={view} />
			</div>
			<ShareFolder ref={shareDialog} folder={folder} onClose={() => shareDialog.current.close()} />
		</>
	);
}
