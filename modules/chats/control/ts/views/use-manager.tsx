import React from 'react';
import { StoreManager } from '../store';

export function useManager({ id, language = 'en', realtime = true, model, onListenChat }) {
	const [store, setStore] = React.useState<StoreManager>({} as StoreManager);
	const [changeCount, setChangeCount] = React.useState(0);

	const callback = () => {
		const manager = new StoreManager({ id, language, realtime, model, onListenChat });
		const onChange = () => {
			setChangeCount(prevCount => prevCount + 1);
		};
		const cleanUp = () => {
			manager.off('change', onChange);
		};
		manager.on('change', onChange);
		setStore(manager);

		return cleanUp;
	};

	React.useEffect(callback, [id]);

	return { ready: store.ready, store, changeCount };
}
