import React from 'react';
import { routing } from '@beyond-js/kernel/routing';

export const ChildItem = ({ item }) => {
	const { pathname } = routing.uri;
	const chatId = pathname.split('/')[2];
	const isCurrent = chatId === item.id;

	const cls = `sidebar-item ${isCurrent ? 'current' : ''} ${item.children ? ` is-parent` : ''}`;

	return <li key={item.id} className={cls}></li>;
};
