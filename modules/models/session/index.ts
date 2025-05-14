import type { User } from '@aimpact/chat-sdk/users';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Auth } from './auth';

interface ISession {
	logged: boolean;
}

class SessionManager extends ReactiveModel<ISession> {
	#id;
	get id() {
		return this.#id;
	}

	get user(): User {
		return this.#auth.user;
	}
	get userId() {
		return this.#auth.currentUser ? this.#auth.currentUser.uid : null;
	}

	get logged() {
		return !!this.#auth?.user;
	}

	#initialized: boolean = false;
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
		this.#id = Math.random().toString(36).substring(2, 15);
		this.#promise = new PendingPromise();
	}

	settings(settings) {
		this.#initialized = true;
		this.#auth = new Auth(this, settings);
		this.#auth.on('ready', this.listenReady.bind(this));
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
