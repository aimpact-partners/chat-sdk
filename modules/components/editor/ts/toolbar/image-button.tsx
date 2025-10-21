import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { useModuleProvider } from '../provider';
import type { IButton } from '../types/i-button';
import { Button } from 'pragmate-ui/components';
import { ImageIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';

interface ImageButtonProps {
	editor: Editor;
	specs: IButton;
}

export const ImageButton: React.FC<ImageButtonProps> = ({ editor, specs }) => {
	const { loaders } = useModuleProvider();

	const onClick = async () => {
		const url = await loaders?.image();
		if (!url) return;
		editor.chain().focus().setImage({ src: url }).run();
	};

	return (
		<button type="button" onClick={onClick} className={clsx('wiki-editor__button', {})}>
			<ImageIcon />
		</button>
	);
};
