import { auth } from './firebase/config';
import type { User } from '@aimpact/chat-sdk/users';
import { ReactiveModel } from '@aimpact/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Auth } from './auth';

interface ISession {
	logged: boolean;
}

class SessionManager extends ReactiveModel<ISession> {
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

	#auth: Auth;
	get auth() {
		return this.#auth;
	}

	constructor() {
		super();
		this.#promise = new PendingPromise();

		this.#auth = new Auth(this);
		this.#auth.on('ready', this.listenReady.bind(this));
		this.ready = true;
	}

	listenReady() {
		this.ready = true;
		this.#promise.resolve(this.ready);
		this.triggerEvent('change');
	}

	async logout() {
		try {
			await this.#auth.signOut();

			function clear(keepKeys) {
				const keysToKeep = new Set(keepKeys);
				Object.keys(localStorage).forEach(key => {
					if (!keysToKeep.has(key)) {
						localStorage.removeItem(key);
					}
				});
			}
			clear(['ailearn.home.tour']);
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
