import React, { useState, useCallback } from 'react';
import { Form } from 'pragmate-ui/form';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { InputContext } from './context';
import { TextInput } from './text-input';
import { InputActionButton } from './action-button';
import { UploadedFile } from './uploaded-file';
import { useChatContext } from '../context';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';
import { IAgentsInputProps } from './types/agents-input';
import { useInputForm } from './hooks/use-input-form';
import { Icon, IconButton } from 'pragmate-ui/icons';
import { useStore } from '../hooks/use-store';

export /*bundle*/ const AgentsChatInput = ({
	isWaiting = false,
	autoTranscribe = false,
	disabled = false,
	onClick
}: Partial<IAgentsInputProps>) => {
	const { store, recorder, setShowRealtime, realtime } = useChatContext();
	const { triggerRef, dropZoneRef, files, text, setText, onSubmit, fetching, recording, setRecording, setFetching } =
		useInputForm();
	const isFetching = fetching || store.waitingResponse || isWaiting;
	const isDisabled = store.disabled || disabled;

	/* ─────────────── File Uploader ─────────────── */

	/* UI feedback while dragging */
	const [dragging, setDragging] = useState(false);
	const activateDrag = useCallback(() => setDragging(true), []);
	const deactivateDrag = useCallback(() => setDragging(false), []);

	/* ─────────────── Context value ─────────────── */
	const contextValue = {
		store,
		onSubmit,
		recorder,
		autoTranscribe,
		fetching,
		setText,
		setRecording,
		recording,
		text,
		setFetching,
		disabled: isDisabled
	};
	useStore(store);

	/* ─────────────── UI / attrs ─────────────── */
	const attrs = { disabled: disabled || store.disabled };
	const buttonIsDisabled = attrs.disabled || store.waitingResponse || recording;

	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''} ${isDisabled ? 'is-disabled' : ''}`;
	if (files.length > 0) cls += ' files-container';
	const containerAttrs = {
		className: cls,
		ref: dropZoneRef,
		onDragEnter: activateDrag,
		onDragLeave: deactivateDrag,
		onDragOver: e => {
			e.preventDefault();
			activateDrag();
		},
		onDrop: e => {
			deactivateDrag();
		}
	};
	const controlAttrs = {
		onClick,
		className: `chat-input-form ${isDisabled ? 'is-disabled' : ''}`
	};

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) attrs.disabled = true;

	const onClickSpeech = () => {
		setShowRealtime(true);
		store.realtime.call();
	};

	return (
		<InputContext.Provider value={contextValue}>
			<Form onSubmit={onSubmit} {...controlAttrs}>
				<div {...containerAttrs}>
					{/* toggle drag overlay */}
					{dragging && (
						<div className="uploader-overlay">
							<AppIconButton icon="upload-file" />
							<span className="uploader-overlay__text">Add your files here</span>
						</div>
					)}

					{/* Uploaded files list */}
					{Array.isArray(files) && files.length > 0 && (
						<section className="uploaded-files-list">
							{files.map((item, idx) => (
								<UploadedFile key={item.file?.name + idx} file={item.file} src={item.src} />
							))}
						</section>
					)}
					<section className="chat-input__inner-content">
						{/* Button that opens the file dialog */}
						<button title="upload__button" ref={triggerRef} className="chat-input__icon" type="button">
							<Icon icon="upload-file" />
						</button>

						<TextInput
							text={text}
							setFetching={setFetching}
							fetching={isFetching}
							setText={setText}
							handleSend={onSubmit}
							disabled={isDisabled}
						/>
						<div className="input-chat__actions">
							{realtime && <IconButton icon="speech" onClick={onClickSpeech} />}
							<InputActionButton buttonIsDisabled={buttonIsDisabled} />
						</div>
					</section>
				</div>
			</Form>
		</InputContext.Provider>
	);
};
