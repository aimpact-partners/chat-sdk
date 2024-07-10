import React from 'react';
import { Content } from './content';
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'class-intro': {};
		}
	}
}

export /*bundle*/ function Chat(): JSX.Element {
	const [reader] = React.useState(false);
	const separator = React.useRef(null);

	let cls = `in-test chat-control__container${reader ? ' reader__container' : ''}`;

	return (
		<div className={cls}>
			<Content separator={separator} />
		</div>
	);
}
