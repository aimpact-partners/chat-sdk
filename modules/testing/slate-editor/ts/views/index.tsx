import React from 'react';
import { Page } from '@aimpact/platform/components/ui';
import { useStore } from '@beyond-js/react-18-widgets/hooks';
import { StoreManager } from '../store';
import { Content } from './content';

export function View({ store }: { store: StoreManager }) {
	const { ready } = store;
	useStore(store);

	return (
		<Page.layout ready={ready}>
			<Content store={store} />
		</Page.layout>
	);
}
