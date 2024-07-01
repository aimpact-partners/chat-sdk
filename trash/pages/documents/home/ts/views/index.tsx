import React from 'react';
import { PreloadScreen } from '@aimpact/chat/shared/components';
import { UploadContext } from '../context';
import { Upload } from './upload';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { EmptyFolders } from './folders/empty-folders';
import { Documents } from './folders';
import { module } from 'beyond_context';
import { useTexts } from '@aimpact/chat/shared/hooks';
import { Modal } from 'pragmate-ui/modal';

export /*bundle*/
function View({ store }) {
	const [knowledgeBox, setKnowledgeBox] = React.useState({});
	const [isReady, setIsReady] = React.useState(store.ready);
	const [totalKbs, setTotalKbs] = React.useState(store.ready);

	const [textsReady, texts] = useTexts(module.specifier);
	const [toggleDiaglog, setToggleDialog] = React.useState(false);

	const openDialog = (KB: any = {}) => {
		setKnowledgeBox(KB);
		setToggleDialog(true);
	};

	const closeDialog = (KB: any = {}) => {
		setKnowledgeBox({});
		setToggleDialog(false);
	};

	useBinder([store], () => {
		setIsReady(store.ready);
		setTotalKbs(store.items.length);
	});
	if (!isReady || !textsReady) return <PreloadScreen />;

	const value = { texts, knowledgeBox, setKnowledgeBox, closeDialog, openDialog, totalItems: totalKbs, store };
	const Control = !store.items.length ? EmptyFolders : Documents;

	return (
		<UploadContext.Provider value={value}>
			<div className='view-container'>
				<Control />
			</div>
			{toggleDiaglog && (
				<Modal show={true} className='upload-modal' onClose={closeDialog}>
					<Upload closeDialog={closeDialog} />
				</Modal>
			)}
		</UploadContext.Provider>
	);
}
