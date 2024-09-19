import React from 'react';

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'aimpact-chat-control': any;
		}
	}
}

export function View({ store, uri }) {
	const [id] = React.useState(uri.vars.get('id'));

	return (
		<>
			<aimpact-chat-control id={id} />
		</>
	);
}
