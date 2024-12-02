// AudioItem
import { Item } from '@aimpact/chat-sdk/reactive/entities/item';
import { UserProvider } from './provider';
import { PendingPromise } from '@beyond-js/kernel/core';
import firebaseAuth from 'firebase/auth';
import { IChatUser } from './interface';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
export /*bundle*/ class User extends Item<User> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber', 'token'];
	#logged;
	declare token;

	#promiseInit: PendingPromise<boolean>;
	#firebaseUser: firebaseAuth.User;
	get logged() {
		return this.#logged;
	}

	#firebaseProvider: any;
	get firebaseToken() {
		return this.#firebaseProvider?.getCurrentToken();
	}

	/**
	 * todo: @carlos implement http request to get user data
	 * @param specs
	 */
	constructor(specs) {
		//@ts-ignore
		super({ id: specs.id, entity: 'User', provider: UserProvider, properties: specs.properties ?? [] });

		// this.initialize(specs);
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

		const specs = { ...this.getProperties(), id: this.id, firebaseToken };

		const response = await this.provider.load(specs);

		if (!response.status) {
			throw new Error(response.error as string);
		}
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
