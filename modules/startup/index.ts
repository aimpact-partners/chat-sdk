import { ReactiveModel } from '@beyond-js/reactive/model';

import { ISDKSettings } from './types';
import { ENDPOINTS } from './endpoints';

class SDKInitializer extends ReactiveModel<SDKInitializer> {
	#api: string;

	#environment: 'development' | 'testing' | 'quality' | 'production';
	get environment() {
		return this.#environment;
	}

	#endpoints = ENDPOINTS;
	get api() {
		return this.#endpoints[this.#environment];
	}

	#userModel: any;
	get userModel() {
		return this.#userModel;
	}

	set userModel(value) {
		this.#userModel = value;
		this.triggerEvent();
	}

	async initialize({ environment, userModel, localdb = true }: ISDKSettings) {
		this.#environment = environment;
		this.#userModel = userModel;
		// const model = new this.#userModel();
	}
}

export /*bundle*/ const sdkConfig = new SDKInitializer();
