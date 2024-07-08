// useTimer.ts
import React from 'react';
const { useState, useEffect } = React;

export function useTimer(isRunning: boolean, restart: boolean): [number, number, number, number] {
	const [time, setTime] = useState(0);

	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isRunning) {
			intervalId = setInterval(() => {
				setTime(prevTime => prevTime + 1);
			}, 10); // 10 ms interval for tracking milliseconds
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isRunning]);

	useEffect(() => {
		if (restart) {
			setTime(0);
		}
	}, [restart]);

	const milliseconds = time % 100; // 1000 ms in a second, but we're updating every 10 ms
	const seconds = Math.floor((time / 100) % 60); // Converted to seconds
	const minutes = Math.floor((time / 6000) % 60); // Converted to minutes
	const hours = Math.floor(time / 360000); // Converted to hours

	return [hours, minutes, seconds, milliseconds];
}
