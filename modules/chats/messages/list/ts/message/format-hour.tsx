import dayjs from 'dayjs';

export const formatHour = (timestamp: string | number | Date): string => {
	const now = dayjs();
	const date = dayjs(timestamp);

	const isSameDay = date.isSame(now, 'day');

	const hour = date.format('h A');

	return isSameDay ? hour : `${date.format('ddd')} ${hour}`;
};
