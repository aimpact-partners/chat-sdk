import { Events } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { languages } from '@beyond-js/kernel/core';
export /*bundle*/ class Voice extends ReactiveModel<Voice> {
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
		pr: 'pt-BR',
	};
	constructor({ language, rate }: { language?: string; rate?: number } = { rate: 1.25 }) {
		super();
		if (!language) language = languages.current;
		this.reactiveProps(['positionToCut', 'textId']);
		this.positionToCut = 0;

		this.lang = language;
		this.rate = rate;

		this.initialValues({
			lang: language,
			rate: rate,
		});
	}

	set({ language, rate }) {
		if (language) {
			this.lang = language;
		}
		if (rate) this.rate = rate;
	}
	_web() {
		if (this.#speaking) {
			speechSynthesis.cancel();
			this.trigger('on.finish');
		}

		const text = this.#text;
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = this.#languages[this.lang];
		utterance.rate = this.rate;

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
		globalThis.cordova ? this._mobile() : this._web();
	}

	stop() {
		speechSynthesis.cancel();
	}
}
