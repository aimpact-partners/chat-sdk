import React from 'react';

import {useUploaderModalContext} from './context';
import {Item} from './item';
export const UploadedFiles = () => {
	const {files, totalFiles} = useUploaderModalContext();

	if (!totalFiles) return null;
	const items = [];
	files.forEach((item, index) => items.push(<Item key={index} index={index} item={item} />));

	return <ul className='list__upload-items'>{items}</ul>;
};
