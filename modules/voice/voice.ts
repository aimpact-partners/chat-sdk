import { Events, languages } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@aimpact/reactive/model';
import { languages } from '@beyond-js/kernel/core';

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
		super({
			lang: language,
			rate: rate
		});
		const LANGS = {
			en: 'en-US',
			es: 'es-MX'
		};

		// if (!language) language = LANGS[languages.current];
		this.reactiveProps(['positionToCut', 'textId', 'playing']);
		this.positionToCut = 0;
		globalThis._voice = this;
		this.lang = language;
		this.rate = rate;
	}

	// set({ language, rate }: { language?: string; rate?: number }) {
	// 	if (language) {
	// 		this.lang = language;
	// 	}
	// 	if (rate) this.rate = rate;
	// }
	_web() {
		if (this.#speaking) {
			speechSynthesis.cancel();
			this.trigger('on.finish');
		}

		const text = this.#text;
		const utterance = new SpeechSynthesisUtterance(text);

		utterance.rate = this.rate;
		utterance.lang = this.lang;

		const selectedVoice = speechSynthesis
			.getVoices()
			.find(voice => voice.name.includes('Google') && voice.lang.startsWith(this.lang));

		console.log(20, selectedVoice, this.lang, this.#languages[this.lang], utterance.lang);
		if (selectedVoice) {
			utterance.voice = selectedVoice;
			utterance.lang = selectedVoice.lang;
		} else {
			utterance.lang = this.#languages[this.lang];
		}

		utterance.onstart = () => {
			this.#speaking = true;
			this.trigger('change');
		};
		globalThis.addEventListener('beforeunload', () => {
			speechSynthesis.cancel();
		});

		utterance.onpause = () => {
			this.trigger('change');
		};
		utterance.onresume = () => this.trigger('change');

		utterance.onboundary = event => {
			this.#currentWord = event.charIndex === 0 ? 0 : event.charIndex;

			this.trigger('change');
			this.trigger('boundary');
		};

		utterance.onend = () => {
			this.#speaking = false;
			this.#currentWord = -1;
			this.trigger('change');
			this.trigger('on.finish');
		};

		speechSynthesis.speak(utterance);
	}

	play(text?: undefined | string, id?: undefined | string) {
		if (text) this.#text = text;

		this.#id = id;
		this._web();
	}

	stop() {
		speechSynthesis.cancel();
	}
}
