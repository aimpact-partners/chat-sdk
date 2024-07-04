import React from 'react';
import { Button } from 'pragmate-ui/components';
import { toast } from 'pragmate-ui/toast';
import config from '@aimpact/chat/config';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { useUploader } from 'media-suite/uploader-code';
import { useUploadContext } from '../../context';
import { UploaderModalContext } from './context';
import { UploadedFiles } from './files';

interface ISpecs {
	type: string;
	container: string;
	project: string;
	userId: string;
	knowledgeBoxId?: string;
}

export function Upload({ closeDialog }) {
	const { userId } = sessionWrapper;
	const { url, project } = config.params;

	const { uploadFiles, clearFiles, files, button, drag, deleteFile, totalFiles } = useUploader({
		url,
		multiple: true
	});

	const { store, knowledgeBox, texts } = useUploadContext();

	const [name, setName] = React.useState(knowledgeBox?.path ?? '');
	const [error, setError] = React.useState('');
	const [fetching, setFetching] = React.useState(false);

	React.useEffect(() => setName(knowledgeBox.path ?? ''), [knowledgeBox.path]);

	const handleSubmit = async () => {
		setError('');
		setFetching(true);
		let hasInvalidFile = false;
		files.forEach(file => {
			if (!store.acceptedDocuments.includes(file.type)) {
				setError('Only text files are allowed!');
				clearFiles();
				hasInvalidFile = true;
			}
		});
		if (hasInvalidFile) return setFetching(false);

		let container = knowledgeBox.path ? knowledgeBox.path.trim() : name;
		container = container.toLowerCase().trim().replace(/\s/g, '-');
		const specs: ISpecs = {
			project,
			type: 'files',
			container,
			userId
		};

		knowledgeBox.id && (specs.knowledgeBoxId = knowledgeBox.id);
		const response = await uploadFiles(specs);

		if (!response.status) {
			setError(texts.upload.error);
			return setFetching(false);
		}

		await store.load();
		setFetching(false);
		clearFiles();
		toast.success(texts.upload.success);
		closeDialog && closeDialog();
	};

	const value = { deleteFile, clearFiles, files, totalFiles };
	const cls = `upload-modal ${fetching ? ' is-fetching' : ''}`;

	return (
		<UploaderModalContext.Provider value={value}>
			<div className={cls}>
				<header>
					<h1>{texts.upload.title}</h1>
				</header>
				<form onSubmit={handleSubmit}>
					<div ref={drag} className="documents-drag">
						<p ref={button}>
							<strong>{texts.upload.drag}</strong> <br /> {texts.upload.help}
						</p>
						<Button
							ref={button}
							disabled={fetching}
							icon="upload-file"
							className="outline"
							variant="primary"
						>
							{texts.upload.action}
						</Button>
					</div>
					{!!error?.length && <div className="error">{error}</div>}
					<UploadedFiles />
					<footer className="modal__actions flex-container flex-center">
						<Button
							icon="close-circle"
							variant="primary"
							label={texts.upload.cancel}
							onClick={closeDialog}
							disabled={fetching}
						/>
						<Button
							icon="save"
							variant="primary"
							label={texts.upload.save}
							disabled={!name || !totalFiles || fetching}
							onClick={handleSubmit}
							loading={fetching}
							type="submit"
						/>
					</footer>
				</form>
			</div>
		</UploaderModalContext.Provider>
	);
}
