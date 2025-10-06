import type { Editor } from '@tiptap/react';
import type { JSX } from 'react';

export interface IButton {
	id: string;
	label: string;
	title: string;
	group: 'text' | 'style-selector' | 'lists' | 'blocks' | 'formatting';
	// Optional properties for special cases
	icon?: string | JSX.Element;
	action?: (editor: Editor) => void;
	isActive?: (editor: Editor) => boolean;
	// For extensions that don't follow the standard pattern
	extensionName?: string;
	actionType?: 'toggle' | 'set' | 'custom';
	// Special property for components that render their own UI
	isComponent?: boolean;
	component?: string;
}
