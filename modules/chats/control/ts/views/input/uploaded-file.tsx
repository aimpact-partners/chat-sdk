import React from 'react';
import { AppIcon } from '@aimpact/chat-sdk/components/icons';

interface UploadedFileProps {
	file: File;
	src: string;
}

function getIconKeyFromType(type: string): string {
	if (type.startsWith('image/')) return 'img';
	if (type.startsWith('audio/')) return 'audio';
	if (type.startsWith('video/')) return 'video';
	if (type === 'application/pdf') return 'pdf';
	if (type === 'text/csv') return 'csv';
	if (type === 'text/javascript' || type === 'application/json' || type === 'text/x-python') return 'code';
	if (
		type === 'application/msword' ||
		type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	)
		return 'doc';
	return 'doc';
}

export const UploadedFile: React.FC<UploadedFileProps> = ({ file }) => {
	const iconKey = getIconKeyFromType(file.type);
	const fileTypeClass = `file-type-${iconKey}`;

	return (
		<div className={`uploaded-file ${fileTypeClass}`}>
			<div className="file-icon">
				<AppIcon icon={iconKey} />
			</div>
			<div className="uploaded-file__details">
				<span className="uploaded-file__name">{file.name}</span>
				<span className="uploaded-file__type">{file.type || 'Unknown type'}</span>
			</div>
		</div>
	);
};
