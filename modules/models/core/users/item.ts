// AudioItem
import { Item } from '@beyond-js/reactive/entities';
import { UserProvider } from '@aimpact/chat-api/provider';

interface IUser {
	id: string;
	displayName: string;
	email: string;
	photoURL: string;
	phoneNumber: string;
}

export /*bundle*/ class User extends Item<IUser> {
	protected properties = ['displayName', 'id', 'email', 'photoURL', 'phoneNumber', 'token'];
	declare provider;
	#logged;
	declare isReady;
	declare set;
	declare displayName;
	declare id;
	declare email;
	declare photoURL;
	declare phoneNumber;
	declare token;
	get logged() {
		return this.#logged;
	}
	constructor(specs) {
		super({ id: specs.id, db: 'chat-api', storeName: 'User', provider: UserProvider });
		//this.init(specs);
	}

	async init(specs) {
		await this.isReady;
		await this.set(specs);
		console.log(100, this.token);
	}
	/* 
	async login(data) {
		await this.isReady;
		if (this.#logged) return;
		await this.set(data.user);
		await this.provider.updateUser({ ...this.getProperties(), id: this.id });
		this.#logged = true;
		return true;
	} */
}
