import { Events } from '@beyond-js/kernel/core';
import config from '@aimpact/chat-sdk/config';

export /*bundle*/
class VoiceLab extends Events {
	#apiKey = config.params.elevenlabs.key;
	#voiceId = config.params.elevenlabs.id;
	#url = `https://api.elevenlabs.io/v1/text-to-speech/${this.#voiceId}/stream`;

	#headers = {
		'Content-Type': 'application/json',
		'xi-api-key': this.#apiKey
	};

	#audio;
	get audio() {
		return this.#audio;
	}

	stop() {
		if (!this.#audio) return;
		this.#audio.pause();
	}

	#blob;
	get blob() {
		return this.#blob;
	}

	async play(text: string) {
		if (!text) {
			console.warn('No hay texto para interpretar');
			return;
		}

		console.warn('call API');

		const response = await fetch(this.#url, {
			method: 'POST',
			headers: this.#headers,
			body: JSON.stringify({
				text,
				voice_id: this.#voiceId,
				voice_settings: {
					stability: 0,
					similarity_boost: 0
				}
			})
		});

		const mediaSource = new MediaSource();
		const audioURL = URL.createObjectURL(mediaSource);
		this.#audio = new Audio(audioURL);

		mediaSource.addEventListener('sourceopen', async () => {
			const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
			const reader = response.body.getReader();
			const pump = async () => {
				const { value, done } = await reader.read();
				if (done) return mediaSource.endOfStream();

				sourceBuffer.appendBuffer(value);
				pump();
			};
			pump();
		});

		this.#audio.play();
	}
}
