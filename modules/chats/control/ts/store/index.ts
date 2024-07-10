import { ReactiveModel } from '@beyond-js/reactive/model';
import { Chat, Messages } from '@aimpact/chat-sdk/core';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';
import { AudioManager } from './audio';

import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { CurrentTexts } from '@beyond-js/kernel/texts';
import { module } from 'beyond_context';
import { IStore } from './types';

export class StoreManager extends ReactiveModel<IStore> implements IStore {
	declare waitingResponse: boolean;
	declare autoplay: boolean;
	declare fetching: boolean;

	#EXTENSIONS = ['chat-intro'];
	#messages: Messages;
	get messages() {
		return this.#messages?.items;
	}

	#name: string;
	get name() {
		return this.#name;
	}

	#category: string;
	get category() {
		return this.#category;
	}

	#chat: Chat;
	get chat() {
		return this.#chat;
	}

	get model(): Chat {
		return this.#chat;
	}
	#chats = AppWrapper.chats;
	get chats() {
		return this.#chats.items ?? [];
	}

	#texts: CurrentTexts<StoreManager> = new CurrentTexts(module.specifier);
	get textsModel() {
		return this.#texts;
	}
	get texts() {
		return this.#texts?.value;
	}
	#audio: AudioManager = new AudioManager(this);
	get audioManager(): AudioManager {
		return this.#audio;
	}

	#processTranscription = false;
	get proccessTranscription() {
		return this.#processTranscription;
	}

	#selectedModel = 'GPT 4';
	get selectedModel() {
		return this.#selectedModel;
	}
	set selectedModel(model) {
		this.#selectedModel = model;
	}

	#notFound: boolean;
	get notFound() {
		return this.#notFound;
	}
	set notFound(notFound) {
		this.#notFound = notFound;
	}

	#currentMessage: any;
	get currentMessage() {
		return this.#currentMessage;
	}

	set currentMessage(message) {
		if (message?.id === this.#currentMessage?.id) return;
		this.#currentMessage = message;
	}

	#disabled;
	get disabled() {
		return this.#disabled;
	}
	set disabled(disabled) {
		if (this.#disabled === disabled) return;
		this.#disabled = disabled;
		this.triggerEvent('change');
	}

	#extensions = new Map();
	get extensions() {
		return this.#extensions;
	}
	#id: string;

	get ready() {
		return super.ready && this.#texts.ready;
	}

	constructor(id) {
		super();
		this.#texts.on('change', this.triggerEvent);
		this.#id = id;
		this.reactiveProps(['waitingResponse', 'autoplay']);
		this.autoplay = true;
		globalThis.store = this;
		// attrs.on('change', () => this.checkAttributes(attrs));
		this.load(this.#id);
	}

	load = async (id: string) => {
		if (!id) {
			super.ready = true;
			this.notFound = true;
			return;
		}

		if (!sessionWrapper.user?.logged) {
			sessionWrapper.on('login', this.load);
			return;
		}

		this.fetching = true;

		const chat = new Chat({ id });
		this.#chat = chat;
		this.#messages = chat.messages;
		await chat.loadAll({ id });
		globalThis.chat = chat;
		AppWrapper.currentChat = chat;

		if (!chat.found) {
			this.fetching = false;
			super.ready = true;
			this.notFound = true;
			return;
		}

		const language = chat.language?.default ?? AppWrapper.language;
		this.audioManager.player.set({ language });

		/* usar propiedad role para identificar owner del mensaje*/
		// chat.on('change', () => this.triggerEvent('new.message'));

		this.fetching = false;
		super.ready = true;
		this.notFound = false;

		this.trigger('change');
	};

	async sendMessage(content: string) {
		try {
			performance.mark('start');
			this.#currentMessage = undefined;

			if (typeof content === 'string' && [undefined, '', null].includes(content)) return;

			this.fetching = true;
			// return http.response(data);
			return this.#chat.sendMessage(content);
		} catch (e) {
			// return http.error(400, message);
			console.error(e);
		}
	}

	async sendAudio(content: Blob) {
		try {
			performance.mark('start');
			this.#currentMessage = undefined;
			this.fetching = true;
			return this.#chat.sendAudio(content);
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	}
	transcribe(audio: Blob) {
		return this.#chat.transcribe(audio);
	}

	unmount() {
		this.#audio.player?.stop();
	}

	clean() {
		this.fetching = false;
		super.ready = false;
	}
}
