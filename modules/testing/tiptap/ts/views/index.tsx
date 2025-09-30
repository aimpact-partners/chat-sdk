import React from 'react';
import { StoreManager } from '../store';
import { WikiEditor } from '@aimpact/chat-sdk/components/editor';
export function View({ store }: { store: StoreManager }) {
	return (
		<>
			<div className="slate-container">
				<WikiEditor />
			</div>
		</>
	);
}
