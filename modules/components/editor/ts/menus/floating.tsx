import * as React from 'react';
import type { Editor } from '@tiptap/react';

interface IFloatingMenuProps {
	editor: Editor;
}

export const FloatingMenuContent = ({ editor }: IFloatingMenuProps): JSX.Element => {
	if (!editor) return null;

	const insertBlock = (type: string): void => {
		switch (type) {
			case 'heading1':
				editor.chain().focus().toggleHeading({ level: 1 }).run();
				break;
			case 'heading2':
				editor.chain().focus().toggleHeading({ level: 2 }).run();
				break;
			case 'heading3':
				editor.chain().focus().toggleHeading({ level: 3 }).run();
				break;
			case 'bulletList':
				editor.chain().focus().toggleBulletList().run();
				break;
			case 'orderedList':
				editor.chain().focus().toggleOrderedList().run();
				break;
			case 'taskList':
				editor.chain().focus().toggleTaskList().run();
				break;
			case 'blockquote':
				editor.chain().focus().toggleBlockquote().run();
				break;
			case 'codeBlock':
				editor.chain().focus().toggleCodeBlock().run();
				break;
			case 'horizontalRule':
				editor.chain().focus().setHorizontalRule().run();
				break;
		}
	};

	return (
		<div className='wiki-editor__floating-menu-content'>
			<div className='wiki-editor__floating-menu-section'>
				<h4>Encabezados</h4>
				<button onClick={() => insertBlock('heading1')} className='wiki-editor__floating-button'>
					H1
				</button>
				<button onClick={() => insertBlock('heading2')} className='wiki-editor__floating-button'>
					H2
				</button>
				<button onClick={() => insertBlock('heading3')} className='wiki-editor__floating-button'>
					H3
				</button>
			</div>

			<div className='wiki-editor__floating-menu-section'>
				<h4>Listas</h4>
				<button onClick={() => insertBlock('bulletList')} className='wiki-editor__floating-button'>
					Lista con viñetas
				</button>
				<button onClick={() => insertBlock('orderedList')} className='wiki-editor__floating-button'>
					Lista numerada
				</button>
				<button onClick={() => insertBlock('taskList')} className='wiki-editor__floating-button'>
					Lista de tareas
				</button>
			</div>

			<div className='wiki-editor__floating-menu-section'>
				<h4>Bloques</h4>
				<button onClick={() => insertBlock('blockquote')} className='wiki-editor__floating-button'>
					Cita
				</button>
				<button onClick={() => insertBlock('codeBlock')} className='wiki-editor__floating-button'>
					Bloque de código
				</button>
				<button onClick={() => insertBlock('horizontalRule')} className='wiki-editor__floating-button'>
					Línea horizontal
				</button>
			</div>
		</div>
	);
};
