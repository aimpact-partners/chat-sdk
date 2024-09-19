import { ReactiveModel } from '@beyond-js/reactive/model';
import { Voice, VoiceLab } from '@aimpact/chat-sdk/voice';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';

import type { StoreManager } from './';
import { Recorder } from './recorder';

interface IStore {
	recordings: [];
}
export /* bundle */ class AudioManager extends ReactiveModel<IStore> {
	declare fetching: boolean;
	declare autoplay: boolean;
	#parent: StoreManager;
	#recorder: Recorder;

	get recorder() {
		return this.#recorder;
	}

	#players = {
		web: Voice,
		lab: VoiceLab // brings support to manage voice lab audios
	};

	#player = 'web';
	get player() {
		return this.#currentPlayer;
	}

	#currentPlayer: Voice;
	constructor(parent) {
		super({});
		this.#recorder = new Recorder();
		this.#parent = parent;
		this.reactiveProps(['autoplay']);

		this.#currentPlayer = new this.#players.web({
			language: AppWrapper.language,
			rate: AppWrapper.audioSpeed
		});

		AppWrapper.on('app.settings.change', this.listenAppChanges);
	}

	listenAppChanges = () => {
		const { rate, language } = AppWrapper;
		this.#currentPlayer.set({ rate, language });
	};

	selectPlayer(name) {
		if (!this.#players[name]) throw new Error(`Player ${name} not found`);

		this.#player = name;
		this.trigger('change');
	}
}
