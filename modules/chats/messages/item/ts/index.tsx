import * as React from 'react';
import { ContentRenderer } from './renderer';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
export /*bundle*/
function Message({ message }: { message: any }) {
	const [content, setContent] = React.useState(message.content ?? '');
	useBinder([message], () => {
		setContent(message.content ?? '');
	});
	return <ContentRenderer content={content} />;
}
