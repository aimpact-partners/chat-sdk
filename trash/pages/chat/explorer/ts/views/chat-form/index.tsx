import React from 'react';
import { Form } from 'pragmate-ui/form';
import { Button } from 'pragmate-ui/components';
import { Modal } from 'pragmate-ui/modal';
import { useTexts } from '@aimpact/chat/shared/hooks';
import { module } from 'beyond_context';
import { routing } from '@beyond-js/kernel/routing';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';
import { Input } from '@aimpact/chat/shared/components';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useConversationsContext } from '../context';

const { useState } = React;
export const AddChat = ({}) => {
	const { store, closeDialog } = useConversationsContext();
	const [name, setName] = useState('');
	const [error, setError] = useState('');
	const [fetching, setFetching] = useState(false);
	const [kbId, setKbId] = useState('');

	const [textsReady, texts] = useTexts(module.specifier);
	useBinder([AppWrapper], () => {
		const kbId = AppWrapper.selectedKnowledgeBoxId;
		setKbId(kbId ?? '');
	});

	if (!textsReady) return;
	const onClose = () => {
		setName('');
		setError('');
		setFetching(false);
		AppWrapper.selectedKnowledgeBoxId = '';
		closeDialog();
	};

	const saveChat = async () => {
		try {
			setFetching(true);
			const response = await store.save(name, kbId);
			if (!response.status) {
				setError(response.error);
				return;
			}

			routing.pushState(`/chat/${response.chat.id}`);
			closeDialog();
			setName('');
			setKbId('');
		} catch (e) {
			console.error(e);
			setError(e.message);
		} finally {
			setFetching(false);
		}
	};

	const disabled = { disabled: !name || fetching };

	return (
		<Modal show onClose={onClose} className="chat__form">
			{error && <div className="error error-container">{texts.error}</div>}
			<header>
				<h1>{texts.header}</h1>
			</header>
			<Form onSubmit={saveChat} className="chat__form">
				<Input
					type="text"
					name="name"
					value={name}
					onChange={e => setName(e.target.value)}
					required
					disabled={fetching}
					placeholder={texts.addNamePlaceholder}
				/>

				<footer>
					<Button
						icon="close-circle"
						label={texts.cancelButton}
						variant="secondary outline"
						onClick={closeDialog}
					/>
					<Button
						icon="save"
						type="submit"
						label={texts.saveButton}
						variant="primary"
						onClick={saveChat}
						fetching={fetching}
						{...disabled}
					/>
				</footer>
			</Form>
		</Modal>
	);
};
