import { ReactiveModel } from '@beyond-js/reactive/model';

import { ISDKSettings } from './types';
import { ENDPOINTS } from './endpoints';

class SDKInitializer extends ReactiveModel<SDKInitializer> {
	#api: string;

	#project: string;
	get project() {
		return this.#project;
	}

	#environment: 'development' | 'testing' | 'quality' | 'production';
	get environment() {
		return this.#environment;
	}

	#endpoints = ENDPOINTS;

	get api() {
		return this.#api;
	}

	#userModel: any;
	get userModel() {
		return this.#userModel;
	}

	set userModel(value) {
		this.#userModel = value;
		this.triggerEvent();
	}

	async initialize({ environment, userModel, api, project }: ISDKSettings) {
		this.#environment = environment;
		this.#userModel = userModel;
		this.#api = api;
		this.#project = project;
		// const model = new this.#userModel();
	}
}

export /*bundle*/ const sdkConfig = new SDKInitializer();
