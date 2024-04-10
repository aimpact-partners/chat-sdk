// AudioItem
import { Item } from '@beyond-js/reactive/entities';
import { UserProvider } from './provider';
import { PendingPromise } from '@beyond-js/kernel/core';
import firebaseAuth from 'firebase/auth';
import { IChatUser } from './interface';

export /*bundle*/ class User extends Item<IChatUser> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber', 'token'];
	#logged;
	declare token;

	#promiseInit: PendingPromise<boolean>;
	#firebaseUser: firebaseAuth.User;
	get logged() {
		return this.#logged;
	}

	get firebaseToken() {
		return this.#firebaseUser ? this.#firebaseUser.getIdToken() : null;
	}

	/**
	 * todo: @carlos implement http request to get user data
	 * @param specs
	 */
	constructor(specs) {
		//@ts-ignore
		super({ id: specs.id, db: 'chat-api', storeName: 'User', provider: UserProvider });

		// this.initialize(specs);
	}

	initialize = async specs => {
		super.initialise();

		if (this.#promiseInit) return this.#promiseInit;
		this.#promiseInit = new PendingPromise();
		await this.isReady;

		await this.set(specs);
		// await this.login(this.firebaseToken);
		this.#promiseInit.resolve();
		this.loaded = true;

		this.trigger('user.initialized');
	};

	setFirebaseUser = async user => {
		this.#firebaseUser = user;
	};

	async login(firebaseToken) {
		await this.isReady;
		if (this.#logged) return;

		const specs = { ...this.getProperties(), id: this.id, firebaseToken };

		const response = await this.provider.load(specs);

		if (!response.status) {
			throw new Error(response.error);
		}
		await this.set(response.data, true);

		// this.localUpdate(response.data.user);
		this.#logged = true;
		return true;
	}
}
