import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import { BubbleMenuContent, FloatingMenuContent } from './menus';

interface IWikiEditorUIProps {
	onChange?: (content: string) => void;
	initialContent?: string;
	placeholder?: string;
	className?: string;
}

export /*bundle*/ const WikiEditorUI = ({
	onChange,
	initialContent = '',
	placeholder = 'Escribe algo...',
	className = ''
}: IWikiEditorUIProps): JSX.Element => {
	const [showFloatingMenu, setShowFloatingMenu] = React.useState(false);
	const [floatingMenuPosition, setFloatingMenuPosition] = React.useState({ x: 0, y: 0 });
	const [showBubbleMenu, setShowBubbleMenu] = React.useState(false);
	const [bubbleMenuPosition, setBubbleMenuPosition] = React.useState({ x: 0, y: 0 });

	const editor = useEditor({
		extensions: [
			StarterKit,
			ListItem,
			BulletList,
			OrderedList,
			Underline,
			TaskList,
			TaskItem,
			CodeBlock,
			Blockquote,
			HorizontalRule
		],
		content: initialContent,
		editorProps: {
			attributes: {
				class: `wiki-editor__content ${className}`,
				placeholder
			}
		},
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange?.(html);
		},
		onSelectionUpdate: ({ editor }) => {
			const { selection } = editor.state;
			const { $from, $to } = selection;
			const hasSelection = $from.pos !== $to.pos;

			if (!hasSelection) {
				setShowFloatingMenu(false);
				setShowBubbleMenu(false);
				return;
			}

			// Show bubble menu for selected text
			const fromCoords = editor.view.coordsAtPos($from.pos);

			const centerX = fromCoords.left;
			setBubbleMenuPosition({
				x: centerX,
				y: fromCoords.top - 60
			});
			setShowBubbleMenu(true);
			setShowFloatingMenu(false);
		}
	});

	return (
		<div className="wiki-editor__wrapper">
			<EditorContent editor={editor} />

			{editor && showBubbleMenu && (
				<div
					className="wiki-editor__bubble-menu"
					style={{
						position: 'absolute',
						left: bubbleMenuPosition.x,
						top: bubbleMenuPosition.y,
						zIndex: 1000,
						transform: 'translateX(-50%)'
					}}
				>
					<BubbleMenuContent editor={editor} />
				</div>
			)}

			{editor && showFloatingMenu && (
				<div
					className="wiki-editor__floating-menu"
					style={{
						position: 'absolute',
						left: floatingMenuPosition.x,
						top: floatingMenuPosition.y,
						zIndex: 1000,
						transform: 'translateX(-50%)'
					}}
				>
					<FloatingMenuContent editor={editor} />
				</div>
			)}
		</div>
	);
};
