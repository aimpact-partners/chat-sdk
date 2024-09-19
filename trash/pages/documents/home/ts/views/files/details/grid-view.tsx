import React from 'react';
import { Icon } from 'pragmate-ui/icons';
import dayjs from 'dayjs';

export function GridView({ folder, deleteFile }) {
	const formattedDate = day => dayjs(day).format('MMM, DD, YYYY [at] HH:mm A');

	const files = folder.documents?.map((file, i) => {
		return (
			<div key={`${file.name}-${i}`} className='file-card'>
				<div className='card-top'>
					<Icon icon='doc' className='lg' />
					<header>
						<h4 className='file-name'>{file.name}</h4>
						<p className='file-date'>{formattedDate(file.createdAt)}</p>
					</header>
				</div>
				<div className='card-bottom'>
					<p>{file.size} bytes</p>
					{file.type}
					<Icon icon='delete' onClick={() => deleteFile(file.name)} />
				</div>
			</div>
		);
	});

	return <div className='file-details-grid'>{files}</div>;
}
