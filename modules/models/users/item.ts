// AudioItem
import { sdkConfig } from '@aimpact/chat-sdk/startup';
import { Item } from '@beyond-js/reactive/entities/item';
import { PendingPromise } from '@beyond-js/kernel/core';
import firebaseAuth from 'firebase/auth';
import { UserProvider } from './provider';
import { IChatUser } from './interface';
export /*bundle*/ class User extends Item<IChatUser, UserProvider> {
	#logged;

	declare id: string;
	declare displayName: string;
	declare email: string;
	declare photoURL: string;
	declare phoneNumber: string;

	declare roles: string[];
	#promiseInit: PendingPromise<boolean>;
	#firebaseUser: firebaseAuth.User;
	get logged() {
		return this.#logged;
	}

	#token: string;
	get token() {
		return sdkConfig.project === 'rvd' ? this.#token : this.firebaseToken;
	}
	set token(value) {
		if (value === this.#token) return;
		this.#token = value;
		this.trigger('token.changed');
	}

	#firebaseProvider: any;
	get firebaseToken() {
		return this.#firebaseProvider?.getCurrentToken();
	}

	constructor({ properties = [], ...specs } = { properties: [], id: undefined }) {
		//@ts-ignore
		super({
			id: specs.id,
			properties: [...properties, 'displayName', 'id', 'email', 'photoURL', 'phoneNumber'],
			entity: 'User',
			provider: UserProvider
		});

		// this.initialize(specs);
	}
	set(specs) {
		const data = super.set(specs);
		if (specs.token) this.token = specs.token;
		return { ...data, token: this.token };
	}

	getProperties() {
		const data = super.getProperties();
		return { ...data, token: this.token };
	}
	setFirebaseProvider(provider) {
		this.#firebaseProvider = provider;
	}
	initialize = async specs => {
		if (this.#promiseInit) return this.#promiseInit;
		this.#promiseInit = new PendingPromise();

		this.set(specs);
		// await this.login(this.firebaseToken);
		this.#promiseInit.resolve();
		this.loaded = true;

		this.trigger('user.initialized');
	};

	setFirebaseUser = async user => {
		this.#firebaseUser = user;
	};

	async login(firebaseToken) {
		if (this.#logged) return;

		const specs = { ...this.getProperties(), id: this.getProperty('id'), firebaseToken } as IChatUser;

		const response = await this.provider.load(specs);

		this.set(response.data);

		// this.localUpdate(response.data.user);
		this.#logged = true;
		this.trigger('login');
		return true;
	}

	static getModel(specs) {
		if (sdkConfig.userModel) return new sdkConfig.userModel(specs);
		return new User(specs);
	}
}
