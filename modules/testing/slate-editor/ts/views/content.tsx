import React from 'react';
import { Page } from '@aimpact/platform/components/ui';
import { StoreManager } from '../store';

export function Content({ store }: { store: StoreManager }): JSX.Element {
	const { texts, content, isEditing } = store;

	return (
		<>
			<Page.header title={texts.title} />

			<Page.body>
				<div className="slate-container">
					<div className="slate-card">
						<h2 className="slate-title">{texts.editorTitle}</h2>
						<div className="slate-content">
							{isEditing ? (
								<textarea
									value={content}
									onChange={e => store.setContent(e.target.value)}
									className="slate-textarea"
									placeholder={texts.placeholder}
								/>
							) : (
								<div className="slate-display">{content || texts.emptyContent}</div>
							)}
						</div>
						<div className="slate-actions">
							<button onClick={() => store.toggleEditing()} className="slate-button">
								{isEditing ? texts.save : texts.edit}
							</button>
						</div>
					</div>
				</div>
			</Page.body>
		</>
	);
}
