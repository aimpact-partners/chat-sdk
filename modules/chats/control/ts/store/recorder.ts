import { PendingPromise } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@aimpact/reactive/model';

export class Recorder extends ReactiveModel<Recorder> {
	#initialised = false;
	#stream: MediaStream;
	#mediaRecorder: MediaRecorder;
	#chunks: Blob[] = [];
	get chunks() {
		return this.#chunks;
	}
	#error: string;
	#audio: Blob;
	get audio() {
		return this.#audio;
	}
	#recording = false;
	#initPromise: PendingPromise<void>;
	#stopPromise: PendingPromise<Blob>;
	#recordingPromise: PendingPromise<void>;

	get isSafari() {
		return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	}
	constructor() {
		super();
		this.init();
		globalThis.recorder = this;
	}

	async hasPermissions(): Promise<boolean> {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach(track => track.stop());
			return true;
		} catch (e) {
			this.#error = e.message;
			return false;
		}
	}

	async init() {
		if (this.#initialised) return;
		try {
			this.#initPromise = new PendingPromise<void>();

			// Obtener permisos y stream de audio
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			this.#stream = stream;

			// Asegurar que el formato es compatible con Safari
			const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';

			this.#mediaRecorder = new MediaRecorder(this.#stream, { mimeType });

			// Enlazar evento de captura de datos antes de iniciar la grabación
			this.#mediaRecorder.addEventListener('dataavailable', event => {
				if (event.data.size > 0) {
					this.#chunks.push(event.data);
				}
			});

			this.#mediaRecorder.addEventListener('stop', () => {
				this.#audio = new Blob(this.#chunks, { type: 'audio/webm' });
				console.log(2, this.#audio, this.#audio.size);
				this.#stopPromise?.resolve(this.#audio);
				this.#recording = false;
				this.#chunks = [];
				this.trigger('change');
			});

			this.#initialised = true;
			this.#initPromise.resolve();
		} catch (error) {
			this.#error = error.message;
			this.#initPromise.reject();
		}
	}

	async record() {
		if (!this.#initialised) {
			await this.init();
		}

		if (this.#recording) {
			throw new Error('Wait for recorder to stop before starting again.');
		}

		this.#recordingPromise = new PendingPromise<void>();
		this.#recording = true;
		this.trigger('change');

		// Safari requiere un intervalo de 1000ms
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		setTimeout(() => {
			this.#mediaRecorder.start(isSafari ? 1000 : undefined);
			this.#recordingPromise.resolve();
		}, 10);

		return this.#recordingPromise;
	}

	async stop(): Promise<Blob> {
		if (!this.#recording) {
			throw new Error('Recorder is not currently recording.');
		}

		this.#stopPromise = new PendingPromise<Blob>();

		// Detener la grabación
		this.#mediaRecorder.stop();

		// Liberar la transmisión de audio
		this.#stream.getTracks().forEach(track => track.stop());

		return this.#stopPromise;
	}
}
