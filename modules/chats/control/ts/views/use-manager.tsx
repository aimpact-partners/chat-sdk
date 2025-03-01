import React from 'react';
import { StoreManager } from '../store';

export function useManager({ id, language = 'en', realtime = true, model }) {
	const [ready, setReady] = React.useState(false);
	const [store, setStore] = React.useState<StoreManager>({} as StoreManager);
	const [state, setState] = React.useState({});
	const callback = () => {
		const manager = new StoreManager({ id, language, realtime, model });
		const onChange = () => {
			setState({ ...manager.getProperties() });
			setReady(manager.ready);
		};
		const cleanUp = () => {
			manager.off('change', onChange);
		};
		manager.on('change', onChange);
		setStore(manager);
		setReady(manager.ready);
		return cleanUp;
	};
	React.useEffect(callback, [id]);

	return { ready, store };
}
