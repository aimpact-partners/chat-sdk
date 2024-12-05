import { ReactiveModel } from '@aimpact/reactive/model';
import { User } from '@aimpact/chat-sdk/users';
import { PendingPromise } from '@beyond-js/kernel/core';
import { signOut } from 'firebase/auth';
import { CustomError } from './error';
import { auth } from './firebase/config';
import { FirebaseProvider } from './firebase/provider';
import { IUserData } from './types';

globalThis.totalAuthStateChanged = 0;
export class Auth extends ReactiveModel<Auth> {
	#pendingLogin;
	#user: User;

	get user() {
		return this.#user;
	}

	#session;
	#provider: FirebaseProvider;

	get session() {
		return this.#session;
	}
	constructor(session) {
		super();
		this.#session = session;
		this.#provider = new FirebaseProvider({
			onAuthStateChanged: this.onAuthStateChanged.bind(this)
		});
	}

	#setReady() {
		this.ready = true;
		this.trigger('ready');
	}

	onAuthStateChanged(user: IUserData) {
		if (!user) {
			this.#setReady();
			return;
		}
		/**
		 * this code only must be executed when the page is laoded
		 */

		if (!this.ready) {
			this.appLogin(user);
		}
	}

	appLogin = (data: IUserData) => {
		if (this.#pendingLogin) {
			return this.#pendingLogin;
		}

		if (!data?.uid) {
			console.trace('INVALID_USER', 'No user id found in response', data);
			throw new CustomError(1001, 'INVALID_USER');
		}

		// this.#provider.getCurrentToken().then(token=>{})
		this.#pendingLogin = new PendingPromise();

		// const firebaseToken = await this.#provider.getCurrentToken();
		this.#provider.getCurrentToken().then(firebaseToken => {
			const specs = { ...data, firebaseToken };
			const model = this.getUserModel(specs);
			this.#user = model;
			const logInValidation = couldLog => {
				if (!couldLog) {
					console.error('Could not login', couldLog);
				}
				this.ready = true;
				this.trigger('ready');
				this.trigger('login');
				this.#pendingLogin.resolve({ status: true, model });
			};

			model
				.login(firebaseToken)
				.then(logInValidation)
				.catch(e => {
					console.log(100, 'fallamos');
					throw new CustomError(1002, 'LOGIN_ERROR');
				});
		});

		return this.#pendingLogin;
	};

	async loginWith(provider) {
		try {
			if (provider !== 'google') {
				console.log('Provider not supported');
				return;
			}

			const userData = await this.#provider.signInWithGoogle();
			return this.appLogin(userData);
			console.log('sesion iniciada', userData);
		} catch (error: any) {
			const errorMappings = {
				'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL',
				'auth/popup-closed-by-user': 'POPUP_CLOSED_BY_USER'
			};

			// Known error, throw a custom exception
			if (error.code in errorMappings) {
				throw new CustomError(1003, errorMappings[error.code]);
			}

			// Unexpected error, rethrow for logging/debugging
			throw new Error(`Unexpected error during Google sign-in: ${error.message}`);
		}
	}
	getUserModel(specs): User {
		if (this.#user && this.#user.id === specs.id) {
			this.#user.set(specs);
			return this.#user;
		}
		if (this.#user) this.#user = undefined;
		//@ts-ignore
		this.#user = User.getModel(specs);
		this.#user.setFirebaseProvider(this.#provider);
		this.#user.initialize(specs);

		return this.#user;
	}

	async setUser(data) {
		if (!data && this.#user) {
			this.#user = undefined;
			this.signOut();
		}
		if (data) {
			if (!data) return;
			if (this.#user && this.#user.id === data.uid) return;

			// const user = new SDKSettings.userModel({ id: data.uid });
			const user = await this.getUserModel({ id: data.uid });

			user.setFirebaseUser(data);

			/* TODO Review */
			await user.set(data);
			this.#user = user;
		}

		this.ready = true;
		this.triggerEvent('change');
	}

	signOut = async () => {
		this.#pendingLogin = undefined;
		this.#user = undefined;
		await signOut(auth);
	};
	logout = this.signOut;
}
