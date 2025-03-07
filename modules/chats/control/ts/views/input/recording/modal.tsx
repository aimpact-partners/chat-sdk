import React from 'react';
import { Icon } from 'pragmate-ui/icons';
import { AlertModal } from 'pragmate-ui/modal';
import { useChatContext } from '../../context';

export /*bundle*/ const PermissionsModal = ({ show, onClose, onConfirm }) => {
	if (!show) return null;
	const { texts } = useChatContext();
	const subtitle = texts.permissions.title;
	const description = texts.permissions.description;

	return (
		<>
			<AlertModal onClose={onClose} centered onConfirm={onConfirm}>
				<div className="permissions__modal-container">
					<header className="title-intro__modal-container">
						<h3>{subtitle}</h3>
						<span className="intro__modal-text p2">{texts.permissions.intro}</span>
					</header>
					<Icon className="mic__modal-icon lg my-10" icon="mic" />
					<p className="description__modal-text">{description}</p>
				</div>
			</AlertModal>
		</>
	);
};
