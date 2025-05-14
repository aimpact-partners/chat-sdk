import { Events, languages, PendingPromise } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { voiceManager } from './manager';

export interface IVoice {
	language: any;
	lang: any;
	rate: any;
}

export /*bundle*/ class Voice extends ReactiveModel<IVoice> {
	#speaking = false;
	get speaking() {
		return this.#speaking;
	}

	#id;
	#text: string;
	get text() {
		return this.#text;
	}

	set text(value: string) {
		this.#text = value;
	}

	#currentWord = -1;
	get currentWord() {
		return this.#currentWord;
	}

	get paused(): boolean {
		return speechSynthesis.paused;
	}

	#lang;
	get lang() {
		return this.#lang;
	}

	set lang(value) {
		if (value === this.#lang) return;
		this.#lang = value;
		this.trigger('change');
	}

	declare trigger;
	#instance;
	get instance() {
		return this.#instance;
	}

	#rate = 1.2;
	get rate() {
		return this.#rate;
	}

	set rate(value: number) {
		if (value === this.#rate) return;
		this.#rate = value;
		this.trigger('change');
	}

	declare positionToCut;
	#languages = {
		en: 'en-EN',
		es: 'es-MX',
		pr: 'pt-BR'
	};
	get languages() {
		return this.#languages;
	}

	constructor({ language, rate }: { language?: string; rate?: number } = { rate: 1.25 }) {
		super({ lang: language, rate });
		this.reactiveProps(['positionToCut', 'textId', 'playing']);
		this.positionToCut = 0;
		globalThis._voice = this;
		this.lang = language;
		this.rate = rate;
	}

	#selectedVoice;

	async _web() {
		if (this.#speaking) {
			speechSynthesis.cancel();
			this.trigger('on.finish');
		}

		const text = this.#text;
		const rate = localStorage.getItem('aimpact.audio.speed')
			? parseFloat(localStorage.getItem('aimpact.audio.speed'))
			: this.rate;

		// Wait for voiceManager to load voices
		await voiceManager.ready();

		// Get the selected or default voice
		const voice = voiceManager.getVoice(this.lang);
		const chunks = this._splitText(text, 150);

		this.#speaking = true;
		this.trigger('change');

		for (const chunk of chunks) {
			await new Promise<void>(resolve => {
				const utterance = new SpeechSynthesisUtterance(chunk);
				utterance.rate = isNaN(rate) ? this.rate : rate;
				utterance.lang = this.lang;
				if (voice) utterance.voice = voice;

				utterance.onstart = () => this.trigger('change');
				utterance.onboundary = e => {
					this.#currentWord = e.charIndex === 0 ? 0 : e.charIndex;
					this.trigger('change');
					this.trigger('boundary');
				};
				utterance.onend = () => resolve();

				speechSynthesis.speak(utterance);
			});
		}

		this.#speaking = false;
		this.#currentWord = -1;
		this.trigger('on.finish');
	}

	_splitText(text: string, maxLength: number): string[] {
		const chunks: string[] = [];
		let remaining = text;

		while (remaining.length > 0) {
			if (remaining.length <= maxLength) {
				chunks.push(remaining);
				break;
			}

			let chunk = remaining.slice(0, maxLength + 1);
			const splitPoint = chunk.lastIndexOf(' ');
			if (splitPoint !== -1) {
				chunks.push(remaining.slice(0, splitPoint));
				remaining = remaining.slice(splitPoint + 1);
			} else {
				chunks.push(remaining.slice(0, maxLength));
				remaining = remaining.slice(maxLength);
			}
		}

		return chunks;
	}

	play(text?: string, id?: string) {
		if (text) this.#text = text;
		this.#id = id;
		this._web();
	}

	stop() {
		speechSynthesis.cancel();
		setTimeout(() => {
			if (this.#speaking) {
				this.#speaking = false;
				this.#currentWord = -1;
				this.trigger('on.finish');
			}
		}, 100);
	}
}
