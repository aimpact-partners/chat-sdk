import { auth } from './firebase/config';
import { SDKSettings } from '@aimpact/chat-sdk/settings';
import type { User } from '@aimpact/chat-sdk/users';
import { onAuthStateChanged } from 'firebase/auth';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Auth } from './auth';

interface ISession {
	logged: boolean;
}

class SessionManager extends ReactiveModel<ISession> {
	declare triggerEvent: (event: string) => void;

	get user(): User {
		return this.#auth.user;
	}
	get userId() {
		return auth.currentUser ? auth.currentUser.uid : null;
	}

	get logged() {
		return !!this.#auth.user;
	}

	#promise: PendingPromise<boolean>;
	get isReady() {
		return this.#promise;
	}

	declare ready;
	#auth: Auth;
	get auth() {
		return this.#auth;
	}
	constructor() {
		super();
		this.#promise = new PendingPromise();

		this.#auth = new Auth(this);
		this.#auth.on('login', () => this.trigger('login'));
		this.#auth.on('ready', this.listenReady.bind(this));
	}

	listenReady() {
		this.ready = true;
		this.#promise.resolve(this.ready);
		this.triggerEvent('change');
	}

	async signInWithGoogle() {
		try {
			const response = await this.#auth.signInWithGoogle();
			// console.log(-5, 'response', response);
			if (!response?.status) return false;

			this.triggerEvent('login');

			return response;
		} catch (e) {
			console.error(e);
			return { status: false, error: 'CANNOT' };
		}
	}

	async registerWithEmail({ email, password, username }) {
		try {
			const response = await this.#auth.registerWithEmail(email, password, username);
			if (!response.status) return { status: false, error: response.error };

			return response;
		} catch (e) {
			return { status: false, error: 'CANNOT' };
		}
	}

	async logout() {
		try {
			await this.#auth.signOut();

			globalThis.localStorage.clear();
			this.triggerEvent('logout');

			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
}

export /*bundle*/ const sessionWrapper = new SessionManager();
globalThis.s = sessionWrapper;
