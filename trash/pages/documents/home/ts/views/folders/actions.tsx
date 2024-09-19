import React, { MutableRefObject } from 'react';
import { Icon } from 'pragmate-ui/icons';
import { useUploadContext } from '../../context';
interface Position {
	top?: string;
	bottom?: string;
}

export function FolderActions({
	visible,
	setVisible,
	setNewView,
	addFile,
	openDeleteModal,
	shareFolder,
	view,
	isEmpty,
	openChatForm,
}) {
	const menuRef = React.useRef(null);
	const [position, setPosition] = React.useState<Position>({ top: '50%' });
	const { texts } = useUploadContext();
	React.useLayoutEffect(() => {
		const handleClick = (event: any): void => {
			const { current }: MutableRefObject<HTMLFieldSetElement> = menuRef;
			const isSameNode: boolean = event.composedPath()[0] === current;
			const isAChildren: boolean = current?.contains(event.composedPath()[0]);

			if (!isSameNode && !isAChildren) setVisible(false);
		};
		document.addEventListener('click', handleClick);
		return (): void => document.removeEventListener('click', handleClick);
	}, []);

	/* posiciona el elemento hacia arriba o abajo dependiendo la interseccion con el viewport */
	React.useEffect(() => {
		if (menuRef.current) {
			const menuElement = menuRef.current;
			const menuRect = menuElement.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			if (menuRect.bottom > viewportHeight) setPosition({ bottom: '50%' });
		}
	}, [visible]);

	const generateViewClass = buttonView => {
		let cls = 'menu-item';
		if (isEmpty) return (cls += ' disabled');
		return (cls += buttonView === view ? ' active' : '');
	};

	return (
		<div style={{ ...position }} className={`folder-buttons ${visible ? 'visible' : ''}`} ref={menuRef}>
			<section className='action-group'>
				<span className={generateViewClass('list')} data-type='list' onClick={setNewView}>
					<Icon icon='list' />
					<p className='label'>{texts.folder.views.list}</p>
				</span>
				<span className={generateViewClass('grid')} data-type='grid' onClick={setNewView}>
					<Icon icon='grid' />
					<p className='label'>{texts.folder.views.grid}</p>
				</span>
			</section>

			<section className='action-group'>
				<span className='menu-item' onClick={openChatForm}>
					<Icon icon='add-chat' />
					<p className='label'>{texts.folder.actions.add}</p>
				</span>
				<span className='menu-item' onClick={addFile}>
					<Icon icon='upload-file' />
					<p className='label'>{texts.folder.actions.upload}</p>
				</span>
				<span className='menu-item' onClick={openDeleteModal}>
					<Icon icon='delete' />
					<p className='label'>{texts.folder.actions.delete}</p>
				</span>
				<span className='menu-item' onClick={shareFolder}>
					<Icon icon='share-link' />
					<p className='label'>{texts.folder.actions.share}</p>
				</span>
			</section>
		</div>
	);
}
