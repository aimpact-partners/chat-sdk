// AudioItem
import { Item } from '@beyond-js/reactive/entities';
import { UserProvider } from '@aimpact/chat-api/provider';
import { PendingPromise } from '@beyond-js/kernel/core';
interface IUser {
	id: string;
	displayName: string;
	email: string;
	photoURL: string;
	phoneNumber: string;
}

export /*bundle*/ class User extends Item<IUser> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber', 'token', 'firebaseToken'];

	#logged;
	declare set;
	declare displayName;
	declare id;
	declare email;
	declare photoURL;
	declare phoneNumber;
	declare token;
	declare getProperties;
	#promiseInit: PendingPromise<boolean>;
	get logged() {
		return this.#logged;
	}

	constructor(specs) {
		super({ id: specs.id, db: 'chat-api', storeName: 'User', provider: UserProvider });
		this.init(specs);
	}

	init = async specs => {
		if (this.#promiseInit) return this.#promiseInit;
		this.#promiseInit = new PendingPromise();

		await this.isReady;
		await this.set(specs);

		this.#promiseInit.resolve();
	};

	async login(data) {
		await this.isReady;
		if (this.#logged) return;

		const specs = { ...this.getProperties(), id: this.id };

		const response = await this.provider.login(specs);
		if (!response.status) {
			throw new Error(response.error);
		}
		await this.set(response.data.user);
		this.localUpdate(response.data.user);
		this.#logged = true;
		return true;
	}
}
