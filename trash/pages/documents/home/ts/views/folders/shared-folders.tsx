import React from 'react';
import { Icon } from 'pragmate-ui/icons';

export function SharedFolder({ sharedFolder }) {
	return (
		<div key={sharedFolder.id} className={`folder`}>
			<header className='folder__header'>
				<Icon icon='shared-folder' />
				<h3>{sharedFolder.path}</h3>
			</header>
		</div>
	);
}
