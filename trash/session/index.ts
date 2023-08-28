import { auth, googleProvider, facebookProvider } from './firebase/config';
import { User } from '@aimpact/chat-sdk/users';
import {
	signOut,
	onAuthStateChanged,
	signInWithRedirect,
	signInWithPopup,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPhoneNumber,
	sendPasswordResetEmail,
	verifyPasswordResetCode,
	confirmPasswordReset,
	RecaptchaVerifier,
	UserCredential,
} from 'firebase/auth';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { routing } from '@beyond-js/kernel/routing';
import { PendingPromise } from '@beyond-js/kernel/core';

interface ISession {
	logged: boolean;
}

class SessionManager extends ReactiveModel<ISession> {
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
	constructor() {
		super();
		this.#promise = new PendingPromise();
		console.log('SessionManager', onAuthStateChanged);
		onAuthStateChanged(auth, this.setUser);
	}

	setUser = async data => {
		if (!data && this.#user) {
			this.#user = undefined;
			this.signOut();
		}
		if (data) {
			if (this.#user && this.#user.id === data.uid) {
				return;
			}

			const token = await data.getIdToken();
			const user = new User({ ...data, id: data.uid, token });

			await user.isReady;
			/* TODO Review */
			await user.set(data);
			this.#user = user;
		}

		this.ready = true;
		//@ts-ignore
		this.triggerEvent('change');
		//@ts-ignore
		this.#promise.resolve(this.ready);
	};

	appLogin = async (response: UserCredential) => {
		if (response.user?.uid) {
			const { displayName, photoURL, email, phoneNumber, uid } = response.user;
			const specs = { id: uid, displayName, photoURL, email, phoneNumber };
			if (this.#user?.id === uid) {
				if (this.#user.logged) return;
				const couldLog = await this.#user.login(response);
				return;
			}

			const user = new User(specs);
			user.set(specs);
			this.#user = user;
			const couldLog = await user.login(response);
			return { status: couldLog };
		}
		return { status: false, error: 'CANNOT' };
	};

	signInWithGoogle = async () => {
		try {
			const response = await signInWithPopup(auth, googleProvider);
			//const response = await signInWithRedirect(auth, googleProvider);
			return await this.appLogin(response);
		} catch (error) {
			const errors = {
				'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL',
				'auth/popup-closed-by-user': 'POPUP_CLOSED_BY_USER',
			};

			return { status: false, error: errors[error.code] || 'CANNOT' };
		}
	};

	signInWithFacebook = async () => {
		try {
			const response = await signInWithPopup(auth, facebookProvider);
			return await this.appLogin(response);
		} catch (error) {
			console.error(error);
		}
	};

	registerWithEmail = async (email: string, password: string, userName: string) => {
		try {
			const response = await createUserWithEmailAndPassword(auth, email, password);
			const userWithDisplayName = { ...response.user, displayName: userName };

			return await this.appLogin({ ...response, user: userWithDisplayName });
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	resetPassword = async (email: string) => {
		try {
			await sendPasswordResetEmail(auth, email);
			return { status: true };
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	confirmPasswordReset = async (code: string, newPassword: string) => {
		try {
			await verifyPasswordResetCode(auth, code);
			await confirmPasswordReset(auth, code, newPassword);
			return { status: true };
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	login = async (email: string, password: string) => {
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);
			return await this.appLogin(response);
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	signInWithPhoneNumber = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
		try {
			return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
			// After this you can ask for the code and call confirmationResult.confirm(code)
		} catch (error) {
			console.error(error);
			``;
		}
	};

	signOut = async () => {
		try {
			await signOut(auth);
			routing.pushState('/');
		} catch (error) {
			console.error(error);
		}
	};
	logout = this.signOut;
}

export /*bundle*/ const sessionWrapper = new SessionManager();
globalThis.s = sessionWrapper;
