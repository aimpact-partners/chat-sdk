import { Events } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@beyond-js/reactive/model';
export /*bundle*/ class Voice extends ReactiveModel<Voice> {
	#speaking = false;
	get speaking() {
		return this.#speaking;
	}

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

	declare lang;
	declare trigger;
	declare rate;

	#id;
	get textId() {
		return this.#id;
	}

	#instance;
	get instance() {
		return this.#instance;
	}

	declare positionToCut;
	constructor() {
		super();
		this.reactiveProps(['lang', 'positionToCut']);
		this.positionToCut = 0;
		this.lang = 'es';
		this.rate = 1.25;
	}

	_web() {
		if (this.#speaking) {
			speechSynthesis.cancel();
			this.trigger('on.finish');
		}

		const text = this.#text;
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = this.lang;
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
		if (globalThis.cordova) {
			this.#text = '';
			this.play();
			return;
		}
		speechSynthesis.cancel();
	}
}
