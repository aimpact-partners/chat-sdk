import React from 'react';
import { IconButton } from 'pragmate-ui/icons';
import { formatBytes } from '../../../format-bytes';
import dayjs from 'dayjs';
import { useUploadContext } from '../../../context';
export function TableView({ folder, deleteFile }) {
	const { texts } = useUploadContext();
	const formattedDate = day => dayjs(day).format('MMM, DD, YYYY [at] HH:mm A');

	return (
		<table className='file-details-table'>
			<thead>
				<tr>
					<th colSpan={2}>{texts.folder.table.header.name}</th>
					<th>{texts.folder.table.header.date}</th>
					<th>{texts.folder.table.header.size}</th>
					<th>{texts.folder.table.header.actions}</th>
				</tr>
			</thead>
			<tbody>
				{folder.documents?.map((file, i) => {
					return (
						<tr key={`${file.name}-${i}`}>
							<td colSpan={2}>{file.originalname}</td>
							<td>{formattedDate(file.createdAt)}</td>
							<td>{formatBytes(file.size)} </td>
							<td>
								<IconButton icon='delete' onClick={() => deleteFile(file.name)} />
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
