import React from 'react';
import { Icon } from 'pragmate-ui/icons';
import { AlertModal } from 'pragmate-ui/modal';

import { useChatContext } from '../../context';

export /*bundle*/ const PermissionsErrorModal = ({ show, onClose }) => {
	if (!show) return null;
	const { texts } = useChatContext();
	const { title, description } = texts.permissions.error;

	return (
		<>
			<AlertModal className='modal--centered' open={true} show={true} onClose={onClose} centered>
				<div className='permissions__modal-container'>
					<div className='title-intro__modal-container'>
						<h3>{title}</h3>
					</div>
					<Icon className='mic__modal-icon lg my-10' icon='mic' />
					<p className='description__modal-text'>{description}</p>
				</div>
			</AlertModal>
		</>
	);
};
