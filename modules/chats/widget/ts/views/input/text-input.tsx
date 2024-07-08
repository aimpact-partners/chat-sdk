import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useInputContext } from './context';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';

export function TextInput({ setFetching, setText, handleSend, fetching, text, disabled }) {
	const { store } = useInputContext();
	const textAreaRef = React.useRef(null);
	React.useEffect(() => {
		const target = textAreaRef.current;
		target.style.height = 'auto';
		target.style.height = text.length == 1 ? 'auto' : target.scrollHeight + 'px';
		if (['undefined', undefined].includes(text.replaceAll('\n', ''))) return;
	}, [text]);

	useBinder(
		[store],
		() => {
			globalThis.setTimeout(() => textAreaRef.current.focus(), 300);
			setFetching(false);
		},
		'chat.available'
	);

	const disabledTextarea = { disabled: fetching || disabled };
	const handleInputChange = e => {
		const { value } = e.target;
		if (['undefined', undefined].includes(value.replaceAll('\n'))) return;
		setText(value);
	};
	const handleKeyDown = e => {
		if (e.key !== 'Enter') return;
		const cb = prevValue => prevValue + '\n';
		const value = e.target.value.replaceAll('\n');
		if (['', undefined, null].includes(value)) return;
		e.shiftKey ? setText(cb) : handleSend();
	};

	return (
		<div className="input__wrapper">
			<div>
				<AppIconButton className="chat-input__icon" icon="attachFile" />
			</div>
			<textarea
				{...disabledTextarea}
				rows={1}
				value={text}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				autoFocus={true}
				className="input__textarea"
				ref={textAreaRef}
			/>
		</div>
	);
}
