import React from 'react';
import { Textarea, Form } from 'pragmate-ui/form';
import { Button } from 'pragmate-ui/components';
import { toast } from 'pragmate-ui/toast';
import { useChatContext } from '../../context';

export const UIForm = ({ chat, closeModal }) => {
	const [value, setValue] = React.useState(chat?.system);
	const [error, setError] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const { texts } = useChatContext();

	function handleChange(event) {
		const { value: textAreaValue } = event.target;
		setValue(textAreaValue);
	}

	function handleClose() {
		setError(false);
		setLoading(false);
		setValue(chat?.system);
		closeModal();
	}

	const handleSubmit = async event => {
		event.preventDefault();
		setLoading(true);
		const response = await chat.publish({ system: value });
		if (!response.status) setError(response.error);

		toast.success(texts.system.success);
		handleClose();
	};

	return (
		<Form onSubmit={handleSubmit} className='system-form'>
			{error && <div className='error error-container'>{error}</div>}
			<Textarea rows={5} value={value} placeholder='Agrega tu contenido...' onChange={handleChange} />
			<footer>
				<Button icon='close-circle' label='Cancel' variant='link outline' onClick={handleClose} />
				<Button type='submit' icon='save' onClick={handleSubmit} label='Submit' loading={loading} />
			</footer>
		</Form>
	);
};
