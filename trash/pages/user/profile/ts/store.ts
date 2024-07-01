import { ReactiveModel } from '@beyond-js/reactive/model';
import { languages } from '@beyond-js/kernel/core';
import { widgets } from '@beyond-js/widgets/render';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';
export class StoreManager extends ReactiveModel<{ StoreManager }> {
	declare language: string;
	declare accessibility: string;
	properties = ['language', 'accessibility', 'audioSpeed'];
	constructor() {
		super();

		const audioSpeed = [null, undefined, 'undefined'].includes(localStorage.getItem('aimpact.audio.speed'))
			? 1
			: localStorage.getItem('aimpact.audio.speed');

		const accessibilityMode = ['dyslexia', 'normal'].includes(localStorage.getItem('aimpact.chat.accessibility'))
			? localStorage.getItem('aimpact.chat.accessibility')
			: 'normal';

		this.reactiveProps(['language', 'accessibility', 'audioSpeed']);
		this.ready = true;
		this.language = languages.current;
		this.audioSpeed = audioSpeed;
		this.accessibility = accessibilityMode;
		this.initialValues({
			accessibility: accessibilityMode,
			language: languages.current,
			audioSpeed: this.audioSpeed
		});

		globalThis.store = this;
	}

	save = () => {
		this.fetching = true;
		languages.current = this.language;

		const container = document.querySelector('html');

		AppWrapper.setSettings({
			accessibility: this.accessibility,
			audioSpeed: this.audioSpeed,
			language: this.language
		});
		AppWrapper.accessibility = this.accessibility;
		AppWrapper.audioSpeed = this.audioSpeed;
		AppWrapper.language = this.language;
		container.setAttribute('data-accessibility-mode', this.accessibility);
		localStorage.setItem('aimpact.accessibility.mode', this.accessibility);
		localStorage.setItem('aimpact.audio.speed', this.audioSpeed);
		widgets.attributes.add('data-accessibility-mode', this.accessibility);

		window.setTimeout(() => {
			languages.current = this.language;
			this.initialValues({ language: languages.current });
			this.fetching = false;
		}, 300);
	};
}
