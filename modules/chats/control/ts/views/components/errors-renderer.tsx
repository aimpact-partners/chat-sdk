import React from 'react';
import { Alert } from 'pragmate-ui/alert';
import { useStore } from '../hooks/use-store';
import { useChatContext } from '../context';
interface ErrorsRendererProps {
	errors: any[];
}

export const ErrorsRenderer: React.FC<ErrorsRendererProps> = ({ errors }) => {
	const { store } = useChatContext();
	useStore(store.chat, ['error']);

	if (!store.chat.errors?.length) return null;
	return (
		<>
			{store.chat.errors.map((error, idx) => (
				<Alert key={idx} type="error">
					{typeof error === 'string' ? error : JSON.stringify(error)}
				</Alert>
			))}
		</>
	);
};
