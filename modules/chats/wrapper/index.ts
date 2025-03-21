import { Chats, Chat } from '@aimpact/chat-sdk/core';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { ReactiveModel } from '@aimpact/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
import { languages } from '@beyond-js/kernel/core';
interface IWrapper {
	rate: string;
	language: string;
}
export /*bundle*/ class Wrapper extends ReactiveModel<IWrapper> {
	#chats: Chats;
	declare rate;

	declare triggerEvent: (string?) => void;
	declare reactiveProps: any;
	get chats() {
		return this.#chats;
	}

	#language: string = languages.current;
	get language() {
		return this.#language;
	}
	set language(value) {
		this.#language = value;
		this.triggerEvent('app.settings.change');
	}

	get languages() {
		return languages;
	}
	#audioSpeed: number =
		localStorage.getItem('aimpact.audio.speed') && !isNaN(parseInt(localStorage.getItem('aimpact.audio.speed')))
			? parseInt(localStorage.getItem('aimpact.audio.speed'))
			: 1;
	get audioSpeed() {
		return this.#audioSpeed;
	}
	set audioSpeed(value) {
		if (!value) return;
		this.#audioSpeed = value;
		localStorage.setItem('aimpact.audio.speed', value.toString());
		this.triggerEvent('app.settings.change');
	}
	#accessibility: string = localStorage.getItem('aimpact.chat.accessibility')
		? localStorage.getItem('aimpact.chat.accessibility')
		: 'normal';

	get accesiibility() {
		return this.#accessibility;
	}
	set accesiibility(value) {
		this.#accessibility = value;
		localStorage.setItem('aimpact.chat.accessibility', value);
		this.triggerEvent('app.settings.change');
	}
	set accessibility(value) {
		this.#accessibility = value;
		localStorage.setItem('aimpact.chat.accessibility', value);
		this.triggerEvent();
	}
	#currentChat: Chat;
	get currentChat() {
		return this.#currentChat;
	}

	set currentChat(chat) {
		if (!chat?.id) {
			throw new Error('invalid chat');
		}
		if (this.#currentChat?.id === chat?.id) return;
		this.#currentChat = chat;
		this.triggerEvent();
	}

	#ready: PendingPromise<boolean>;
	get isReady() {
		return this.#ready;
	}

	constructor() {
		super();
		this.reactiveProps(['isUpdating', 'selectedKnowledgeBoxId']);
		sessionWrapper.on('change', this.validateSession.bind(this));
		this.load();
	}

	validateSession() {
		if (!sessionWrapper.logged) return;

		this.ready = false;
		this.#ready = undefined;
		this.load();
	}

	async load() {
		if (this.#ready) return this.#ready;
		this.#ready = new PendingPromise();
		await sessionWrapper.isReady;

		if (!sessionWrapper.logged) {
			this.ready = true;
			this.#ready.resolve(true);
			return;
		}

		// TODO: @jircdev - Move the loading of knowledge boxes to a separate module for on-demand loading.

		/**
		 * TODO: @jircdev - Move the loading of chats to a separate module for on-demand loading.
		 */
		const chats = new Chats();
		this.#chats = chats;
		// this.#chats.on('change', this.triggerEvent);
		// await chats.load({ userId: sessionWrapper.user.id });

		this.ready = true;
		this.#ready.resolve(true);
	}

	setSettings(settings) {
		Object.keys(settings).forEach(key => (this[key] = settings[key]));
		this.triggerEvent();
	}
}
const _wrapper = new Wrapper();
export /*bundle*/ const AppWrapper = _wrapper;
globalThis.app = AppWrapper;
