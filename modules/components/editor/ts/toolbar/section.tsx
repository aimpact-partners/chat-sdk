import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from './button';
import { TextStyleSelector } from './text-style-selector';
import { BUTTONS, GROUPS } from './config';

interface ISectionProps {
	editor: Editor;
	group: keyof typeof GROUPS;
}

export const Section = ({ editor, group }: ISectionProps): JSX.Element => {
	const buttons = BUTTONS.filter(button => button.group === group);

	if (buttons.length === 0) return null;

	return (
		<div className="wiki-editor__toolbar-section">
			{buttons.map(button => {
				// If it's a special component, render it directly
				if (button.isComponent && button.component === 'TextStyleSelector') {
					return <TextStyleSelector key={button.id} editor={editor} />;
				}

				// Otherwise render as a regular button
				return <Button key={button.id} button={button} editor={editor} />;
			})}
		</div>
	);
};
