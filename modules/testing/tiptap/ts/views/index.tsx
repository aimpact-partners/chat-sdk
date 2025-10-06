import React from 'react';
import { StoreManager } from '../store';
import { WikiEditor } from '@aimpact/chat-sdk/editor';
export function View({ store }: { store: StoreManager }) {
	return (
		<>
			<div className="slate-container">
				<WikiEditor
					loaders={{
						image: () => {
							return window.prompt('Image URL');
						}
					}}
				/>
			</div>
		</>
	);
}
