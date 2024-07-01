import React from 'react';
import { UIForm } from './form';
import { Button } from 'pragmate-ui/components';
import { IconButton } from 'pragmate-ui/icons';
import { useChatContext } from '../../context';

export /*bundle*/ const SystemModal = ({ chat }) => {
	const dialogRef = React.useRef(null);
	const {
		texts: { assistant: texts },
	} = useChatContext();
	const openModal = () => dialogRef.current.showModal();
	const closeModal = () => dialogRef.current.close();

	return (
		<div className={`input__icon  input__icon--left`}>
			<Button icon='code' onClick={openModal} mode='primary' />
			{
				<dialog ref={dialogRef} onClose={closeModal}>
					<IconButton icon='close' className='close' onClick={closeModal} />
					<header>
						<h1>{texts.assistant}</h1>
					</header>
					<div>
						<p>{texts.message}</p>
					</div>
					<UIForm chat={chat} closeModal={closeModal} />
				</dialog>
			}
		</div>
	);
};
