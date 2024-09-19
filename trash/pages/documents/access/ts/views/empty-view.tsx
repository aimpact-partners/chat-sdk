import React from 'react';
import { Link } from 'pragmate-ui/components';
import { Button } from 'pragmate-ui/components';
import { Icon } from 'pragmate-ui/icons';
import { EmptyView } from './empty-view';
import { ICONS } from '@aimpact/chat-sdk/components/icons';

export const EmptyView = () => {
	return (
		<div className="access__folder">
			<img alt="Shared folder" src="/assets/shared-folder.png" />
			<span className="access-details">
				<Icon icon={ICONS['aip-chat-logo']} className="acccess__ailogo" />
				<h1>Welcome to AIM Chat</h1>
				<p>
					<strong>No pudimos encontrar la carpeta compartida!</strong>
					<br />
					Revisa que el link se haya copiado correctamente.
				</p>
				<Link href="/documents">
					<Button icon="folder" label="Ir a documentos" />
				</Link>
			</span>
		</div>
	);
};
