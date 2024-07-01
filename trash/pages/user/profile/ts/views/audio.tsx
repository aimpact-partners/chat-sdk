import React from 'react';

import { useProfileContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';

export function AudioSettings() {
	const { texts, store } = useProfileContext();
	const [value, setValue] = React.useState(1);
	useBinder([store], () => {
		setValue(store.audioSpeed);
	});

	const onInput = event => {
		store.audioSpeed = event.currentTarget.value;
	};

	return (
		<>
			<h4>{texts.audio.title}</h4>
			<section className='audio__container'>
				<label htmlFor='audioRange'>
					{texts.audio.speed}
					{/* <output className='bubble'></output> */}
					<input
						value={store.audioSpeed}
						name='audioRange'
						onInput={onInput}
						type='range'
						max='2'
						min='0.25'
						step='0.25'
					/>
				</label>
				<div className='speed__quantity'>
					<span>0.25</span>
					<span>0.50</span>
					<span>0.75</span>
					<span>1</span>
					<span>1.25</span>
					<span>1.50</span>
					<span>1.75</span>
					<span>2</span>
				</div>
			</section>
		</>
	);
}
