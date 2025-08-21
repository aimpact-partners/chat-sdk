import type { Editor } from '@tiptap/react';
import type { IButton } from './config';

/**
 * Generates button action based on standard pattern
 */
export const generateButtonAction = (button: IButton): ((editor: Editor) => void) => {
	// If it already has a custom action, use it
	if (button.action) {
		return button.action;
	}

	// If it's a special case, handle it
	if (button.actionType === 'set') {
		return editor => {
			editor.chain().focus().setHorizontalRule().run();
		};
	}

	// Standard behavior: toggle + extension name
	const extensionName = button.extensionName || button.id;
	return editor => {
		const command = `toggle${extensionName.charAt(0).toUpperCase() + extensionName.slice(1)}`;

		if (typeof editor.chain === 'function' && editor.chain().focus()[command]) {
			editor.chain().focus()[command]().run();
		}
	};
};

/**
 * Generates button active state
 */
export const generateButtonIsActive = (button: IButton): ((editor: Editor) => boolean) => {
	// If it already has a custom state, use it
	if (button.isActive) {
		return button.isActive;
	}

	// Standard behavior: check if extension is active
	const extensionName = button.extensionName || button.id;
	return editor => editor.isActive(extensionName);
};

/**
 * Generates button icon
 */
export const generateButtonIcon = (button: IButton): string | JSX.Element => {
	// If it already has a custom icon, use it
	if (button.icon) {
		return button.icon;
	}

	// Standard behavior: use label
	return button.label;
};
