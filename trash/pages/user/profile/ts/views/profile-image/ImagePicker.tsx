import React from 'react';
import { UserImage } from './UserImage';
import { toast } from 'pragmate-ui/toast';

export default function ImagePicker({ userProps }) {
	const [img, setImg] = React.useState<string>(userProps.photoURL);

	return (
		<section className='user-image-wrapper'>
			{img && <UserImage src={img ?? ''} alt={userProps.displayName} />}
		</section>
	);
}
