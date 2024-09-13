import React from 'react';
import { useChatContext } from '../context';
export function useExtension(name) {
	const [ready, setReady] = React.useState(false);
	const ref = React.useRef(null);
	const {
		store: { extensions },
	} = useChatContext();

	const webComponentName = extensions.get(name)?.control;
	React.useEffect(() => {
		const onReady = event => setReady(true);
		if (!ref?.current) return;
		ref.current.addEventListener('ready', onReady);
		return () => ref.current?.removeEventListener('ready', onReady);
	}, [ref?.current]);

	return [ref, ready || !webComponentName, webComponentName];
}
