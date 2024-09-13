// Timer.tsx
import React from 'react';
import { useTimer } from './use-timer';

interface TimerProps {
	action?: 'start' | 'stop' | 'restart';
}

export function Timer({ action }: TimerProps): JSX.Element {
	const isRunning = ['restart', 'start'].includes(action);
	const restart = action === 'restart';
	const [hours, minutes, seconds, milliseconds] = useTimer(isRunning, restart);
	const secRendered = seconds.toString().padStart(2, '0');
	const minutesRendered = minutes.toString().padStart(2, '0');
	return (
		<div className='timer-message__container'>
			<span>{`${minutesRendered}`}:</span>
			<span>{`${secRendered}`}</span>
		</div>
	);
}
