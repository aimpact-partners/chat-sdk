import React, { forwardRef } from 'react';
import { Button } from 'pragmate-ui/components';
import { Input } from '@aimpact/chat/shared/components';
import { IconButton } from 'pragmate-ui/icons';
import { toast } from 'pragmate-ui/toast';
interface ShareProps {
	folder: any;
	onClose: () => void;
}

export const ShareFolder = forwardRef<HTMLDialogElement, ShareProps>((props, ref) => {
	const { folder, onClose } = props;
	const baseUrl = window.location.origin;
	const folderLink = `${baseUrl}/documents/access?id=${folder.id}`;

	function copyToClipboard() {
		navigator.clipboard.writeText(folderLink);
		toast.success('Link copied to clipboard');
		onClose();
	}

	return (
		<dialog ref={ref}>
			<div className='share__modal'>
				<IconButton icon='close' className='close' onClick={onClose} />
				<header>
					<h1>Share your Documents</h1>
				</header>
				<div className='share__details'>
					<h3>Share your documents with others.</h3>
					<p> Copy the link and share it so they can access your knowledge folder.</p>
				</div>
				<Input value={folderLink} disabled className='share__input' />
				<footer>
					<Button icon='close-circle' variant='link outline' onClick={onClose}>
						Close
					</Button>
					<Button icon='copy-link' variant='primary' onClick={copyToClipboard}>
						Copy link
					</Button>
				</footer>
			</div>
		</dialog>
	);
});
