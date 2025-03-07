import { ReactiveModel } from '@aimpact/reactive/model';
import type { IWidgetStore } from '@beyond-js/widgets/controller';
import { ClientSession } from '@aimpact/agents-api/realtime/client';
import { Conversation } from '@aimpact/agents-api/realtime/client/conversation';
import { devices, IDevice } from '@aimpact/agents-api/realtime/audio/recorder';

import { sessionWrapper } from '@aimpact/chat-sdk/session';

interface IRealtimeStore {
	muted: boolean;
	available: boolean;
	deviceSelected: string;
	duration: number;
	chatId: string;
}
export class RealtimeStore extends ReactiveModel<IRealtimeStore> implements IWidgetStore {
	isStore = false;
	declare muted: boolean;
	declare deviceSelected: string;
	declare chatId: string;
	declare available: boolean;
	declare duration: number;
	#conversation: Conversation;
	get conversation() {
		return this.#conversation;
	}
	#client: ClientSession;
	get client() {
		return this.#client;
	}

	#validate = 0;
	#interval: number | NodeJS.Timeout;

	#audioDevices: IDevice[] = [];
	get audioDevices(): IDevice[] {
		return this.#audioDevices;
	}
	constructor(available: boolean) {
		super({ properties: ['muted', 'deviceSelected', 'available', 'duration'] });

		this.duration = 0;
		if (!available) {
			this.ready = true;
			this.available = false;
			return;
		}
		this.#conversation = new Conversation('123');
		this.#client = new ClientSession({ vad: null });
		this.#client.conversation.set(this.#conversation);
		this.muted = true;
		this.init();
	}

	async init() {
		this.#client.on('session.open', this.invalidate);
		this.#client.on('session.created', this.invalidate);
		this.#client.on('session.ready', this.invalidate);
		this.#client.on('session.close', this.invalidate);

		this.#client.on('session.created', this.initiate);
		this.#client.on('session.ready', this.isReady);
		this.#client.on('session.close', this.end);

		await devices.prepare();
		this.#audioDevices = [...devices.values()];
		this.ready = true;
		this.selectDevice(devices.default?.id || '');
		// const token = `eyJhbGciOiJSUzI1NiIsImtpZCI6IjgxYjUyMjFlN2E1ZGUwZTVhZjQ5N2UzNzVhNzRiMDZkODJiYTc4OGIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiRsOpbGl4IFRvdmFyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGV3WkFlSC0yOXAzUUotcndFdVV1TVRBampTNEZna09zZkMwdjFtPXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FpbXBhY3QtcGFydG5lcnMtZGV2IiwiYXVkIjoiYWltcGFjdC1wYXJ0bmVycy1kZXYiLCJhdXRoX3RpbWUiOjE3MzY1NDgzNDUsInVzZXJfaWQiOiI4Y0dmMmpPbERMWlJDWTZyUVdXc0xuaGpNQjYyIiwic3ViIjoiOGNHZjJqT2xETFpSQ1k2clFXV3NMbmhqTUI2MiIsImlhdCI6MTczODA5OTE1OSwiZXhwIjoxNzM4MTAyNzU5LCJlbWFpbCI6ImZlbGl4QGJleW9uZGpzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTEwNDcxNTE1MzE1OTYzOTg4NjA5Il0sImVtYWlsIjpbImZlbGl4QGJleW9uZGpzLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.CHkrLTBQSvaPtgcqKdrksI2hi4nah3gJe_Kz7MIoVSICEXO1BLJXMDzENTbCY9N_d2Cmiw5Pz1SnejQXSsxIbBGnsEDclGS2Jpm55-IkMVfjqxOucYjfDfs1xiSHbtOkLf2D9lGTPfPHaEc07c4nQwRabcRsiNkLjFqoitGCPvR0Ej6FtzV2EbAgQITdsyXYplK8RC6ZCGPQWofzXCMoBc-i_xDBWLG9qTrpnnAvc9_SDCwPEQMqTJgmvDZT6NxItAZOq3fIb83-MZ2m4o-9HKwmk-oYDhVUlyA1l4p-lOaBGGXF2ePqunldXhoVWwg24o5PH_a_fZ0E63S09G7whA`;
	}
	selectDevice(id: string) {
		this.deviceSelected = id;
		const device = this.#audioDevices.find(device => device.id === id);
		this.#client.recorder.device = device;
	}
	initiate = async () => {
		const token = await sessionWrapper.user.firebaseToken;
		if (!this.chatId) {
			console.error('Chat id is not set');
			return;
		}
		this.#client.update({ conversation: { id: this.chatId }, token });
		this.onmic();
		this.#interval = setInterval(() => this.duration++, 1000);
	};

	isReady = () => {
		console.warn('ready');
		this.#interval = setInterval(() => this.duration++, 1000);
	};
	end = () => {
		clearInterval(this.#interval);
		this.duration = 0;
	};
	clean() {
		this.#client.off('session.open', this.invalidate);
		this.#client.off('session.created', this.invalidate);
		this.#client.off('session.ready', this.invalidate);
		this.#client.off('session.close', this.invalidate);
	}

	invalidate = () => {
		this.#validate++;
		this.trigger('invalidated');
		this.trigger('change');
	};

	call = () => {
		if (this.#client.status === 'closed') {
			this.#client.connect();
			this.invalidate(); // To update calling state to 'connecting'
		}
		if (['open', 'created'].includes(this.#client.status)) {
			this.#client.close();
			this.invalidate(); // To update calling state to 'closing'
		}
	};

	onmic = () => {
		this.muted = !this.muted;
		// values.muted = muted;
		// console.log(2, this.muted, this.#client.recorder);
		this.muted ? this.#client.recorder.stop() : this.#client.recorder.record();
	};
}
