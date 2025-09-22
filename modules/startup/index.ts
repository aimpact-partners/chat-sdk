import { ReactiveModel } from '@beyond-js/reactive/model';
import { ISDKSettings, Environment } from './types';

class SDKInitializer extends ReactiveModel<SDKInitializer> {
	#api: string;

	#project: string;
	get project() {
		return this.#project;
	}

	#environment: Environment;
	get environment() {
		return this.#environment;
	}

	get api() {
		return this.#api;
	}
	#pkg: string;
	get pkg() {
		return this.#pkg;
	}

	#userModel: any;
	get userModel() {
		return this.#userModel;
	}

	set userModel(value) {
		this.#userModel = value;
		this.triggerEvent();
	}

	async initialize({ environment, userModel, pkg, api, project }: ISDKSettings) {
		this.#environment = environment;
		this.#userModel = userModel;
		this.#pkg = pkg;
		this.#api = api;
		this.#project = project;
		// const model = new this.#userModel();
	}
}

export /*bundle*/ const sdkConfig = new SDKInitializer();
