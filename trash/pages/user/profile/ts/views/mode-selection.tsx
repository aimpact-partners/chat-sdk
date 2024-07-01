import React from 'react';
import { Radio } from 'pragmate-ui/form';
import { useProfileContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { Switch, Checkbox } from 'pragmate-ui/form';
export function ModeSelection() {
	const { texts, store } = useProfileContext();

	const [checked, setChecked] = React.useState(store.accessibility === 'dyslexia');

	useBinder([store], () => setChecked(store.accessibility === 'dyslexia'));

	const onChange = event => {
		const value = store.accessibility === 'dyslexia' ? 'normal' : 'dyslexia';
		store.accessibility = value;
		setChecked(value === 'dyslexia');

		event.preventDefault();
	};

	return (
		<>
			<h4>{texts.language}</h4>
			<section className='language-selector'>
				<Checkbox onChange={onChange} checked={checked} name='check' label={texts.dyslexia} />
			</section>
		</>
	);
}
