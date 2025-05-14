import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
export /*bundle*/ function useHmr(hmr) {
	const [update, setUpdate] = React.useState({});

	useBinder([hmr], () => {
		setUpdate({});
	});
	return [update, setUpdate];
}
