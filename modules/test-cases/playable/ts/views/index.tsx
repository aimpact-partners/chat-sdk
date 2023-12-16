import * as React from 'react';
import { Playable } from '@aimpact/chat-sdk/widgets/playable';
import { Voice, VoiceLab } from '@aimpact/chat-sdk/voice';
const text = `
# Hola como te va ? 

## pensamientos 

yo pensaba que esto era una prueba pero no lo es`;

const text2 = 'hola como te a ti? que me cuentas?';

const markdowntext = `

- **work**: software architech
- hobbie
- rap
`;
const voice = new Voice({ language: 'es', rate: 1 });
voice.langue = 'es';
export /*bundle*/
function View() {
	const playable = true;
	const onClickWord = e => {
		console.log('clicked', e);
	};
	return (
		<div>
			<h1>Playable component</h1>
			{/* <Playable content={text2} id='id' player={voice} playable={playable} onClickWord={onClickWord} /> */}
			<h2>Content with markdown</h2>
			<Playable content={markdowntext} id='id2' player={voice} playable={playable} onClickWord={onClickWord} />
		</div>
	);
}
