import * as React from 'react';
import clsx from 'clsx';
import type { Editor } from '@tiptap/react';

interface IBubbleMenuProps {
	editor: Editor;
}

export const BubbleMenuContent = ({ editor }: IBubbleMenuProps): JSX.Element => {
	if (!editor) return null;

	return (
		<div className='wiki-editor__bubble-menu-content'>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('bold'),
				})}
				title='Negrita'
			>
				<strong>B</strong>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('italic'),
				})}
				title='Cursiva'
			>
				<em>I</em>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('underline'),
				})}
				title='Subrayado'
			>
				<u>U</u>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('strike'),
				})}
				title='Tachado'
			>
				<s>S</s>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('code'),
				})}
				title='Código inline'
			>
				<code>{'<>'}</code>
			</button>
		</div>
	);
};
