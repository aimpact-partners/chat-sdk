import { auth, googleProvider } from './firebase/config';
import { User } from '@aimpact/chat-sdk/core';
import { onAuthStateChanged, UserCredential } from 'firebase/auth';
import { ReactiveModel } from '@beyond-js/reactive/model';

import { PendingPromise } from '@beyond-js/kernel/core';
import { Auth } from './auth';

interface ISession {
	logged: boolean;
}

class SessionManager extends ReactiveModel<ISession> {
	declare triggerEvent: (event: string) => void;
	#user: User;
	get user() {
		return this.#user;
	}
	get userId() {
		return auth.currentUser ? auth.currentUser.uid : null;
	}

	get logged() {
		return !!this.user;
	}

	#promise;
	get isReady() {
		return this.#promise;
	}

	declare ready;
	#auth: Auth = new Auth();
	get auth() {
		return this.#auth;
	}
	constructor() {
		super();
		this.#promise = new PendingPromise();

		onAuthStateChanged(auth, this.listener);
	}

	listener = async user => {
		if (user) {
			await this.setUser(user);
		}
		this.ready = true;
		this.#promise.resolve(this.ready);
	};

	async updateUser(data) {
		if (!data) return;
		if (this.#user && this.#user.id === data.uid) return;
		const firebaseToken = await data.getIdToken();
		const user = new User({ id: data.uid });
		await user.isReady;

		/* TODO Review */
		await user.set(data);
		this.#user = user;
	}
	setUser = async data => {
		if (!data && this.#user) {
			this.#user = undefined;
			this.#auth.signOut();
		}
		if (data) {
			await this.updateUser(data);
		}

		this.ready = true;
		this.triggerEvent('change');
		this.#promise.resolve(this.ready);
	};

	async signInWithGoogle() {
		try {
			const response = await this.#auth.signInWithGoogle();

			if (!response.status) return false;
			this.#user = response.user;

			return response;
		} catch (e) {
			console.log(e);
			return { status: false, error: 'CANNOT' };
		}
	}
}

export /*bundle*/ const sessionWrapper = new SessionManager();
globalThis.s = sessionWrapper;
