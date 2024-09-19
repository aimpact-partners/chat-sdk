import React from 'react';
import { Input, CollapsibleHeader } from '@aimpact/chat/shared/components';
import { Button } from 'pragmate-ui/components';
import { useUploadContext } from '../../context';
import { FolderList } from './list';

export function Documents() {
	const { openDialog, store, texts } = useUploadContext();
	const [search, setSearch] = React.useState('');
	const [renderedItems, setRenderedItems] = React.useState(store.items);

	function handleSearch(e) {
		setSearch(e.target.value);
	}

	React.useEffect(() => {
		const searchTerm = search.trim();
		const filteredItems = store.items.filter(item => item.path.toLowerCase().includes(searchTerm.toLowerCase()));
		setRenderedItems(filteredItems);
	}, [search]);

	return (
		<>
			<CollapsibleHeader title={texts.home.title}>
				<Input
					type='search'
					name='documentName'
					value={search}
					onChange={handleSearch}
					required
					label={texts.home.search}
					className='grow'
				/>
				<Button
					className='grow'
					icon='upload-file'
					label={texts.home.upload}
					variant='primary'
					onClick={() => openDialog({})}
				/>
			</CollapsibleHeader>
			<FolderList folders={renderedItems} />
		</>
	);
}
