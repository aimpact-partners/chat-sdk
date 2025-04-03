import { PendingPromise } from '@beyond-js/kernel/core';
import { ReactiveModel } from '@beyond-js/reactive/model';

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
		if (this.#initialised && this.#stream?.active) return;
		try {
			// Check permissions first
			const hasPermission = await this.hasPermissions();
			if (!hasPermission) {
				throw new Error('Microphone permission denied');
			}

			this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			this.#initialised = true;
		} catch (error) {
			this.#error = error.message;
			throw error;
		}
	}

	async record() {
		if (this.#recording) {
			throw new Error('Wait for recorder to stop before starting again.');
		}

		// Always get a fresh stream for recording
		try {
			this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (error) {
			this.#error = error.message;
			throw error;
		}

		const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
		this.#mediaRecorder = new MediaRecorder(this.#stream, { mimeType });
		this.#chunks = [];

		this.#mediaRecorder.ondataavailable = event => {
			if (event.data.size > 0) this.#chunks.push(event.data);
		};

		this.#stopPromise = new PendingPromise<Blob>();

		this.#mediaRecorder.onstop = () => {
			this.#audio = new Blob(this.#chunks, { type: mimeType });
			this.#stopPromise.resolve(this.#audio);
			this.#recording = false;
			this.trigger('change');
		};

		this.#mediaRecorder.start(this.isSafari ? 1000 : undefined);
		this.#recording = true;
		this.trigger('change');
	}

	async stop(): Promise<Blob> {
		if (!this.#recording) {
			throw new Error('Recorder is not currently recording.');
		}

		this.#mediaRecorder.stop();

		// Limpieza segura del stream después de detener la grabación
		this.#stream.getTracks().forEach(track => track.stop());
		this.#initialised = false; // Forzar re-obtención del stream en la próxima grabación

		return this.#stopPromise;
	}
}
