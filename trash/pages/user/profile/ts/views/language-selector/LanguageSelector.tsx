import React from 'react';
import { Radio } from 'pragmate-ui/form';
import { useProfileContext } from '../../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';

export function LanguageSelector() {
	const { texts, store } = useProfileContext();

	const [language, setLanguage] = React.useState(store.language);

	useBinder([store], () => setLanguage(store.language));
	const handleChange = event => {
		store.language = event.target.value;
	};
	return (
		<>
			<h4>{texts.language}</h4>
			<section className='language-selector'>
				<Radio
					onChange={handleChange}
					checked={store.language === 'en'}
					name='language'
					value='en'
					label='English'
				/>
				<Radio
					onChange={handleChange}
					checked={store.language === 'es'}
					name='language'
					value='es'
					label='Spanish'
				/>
				<Radio
					onChange={handleChange}
					checked={store.language === 'pr'}
					name='portuguese'
					value='pr'
					label='Portuguese'
				/>
			</section>
		</>
	);
}
