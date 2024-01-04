import { Collection } from '@beyond-js/reactive/entities';

import { Audio } from './item';

interface IAudios {
	items: Audio[];
}

export class Audios extends Collection {
	item = Audio;
	protected storeName = 'AudioRecords';
	protected db = 'chat-api';

	constructor(a) {
		super(a);
		// this.provider = new AudioProvider();
		this.init();
	}
}
