import { auth, googleProvider } from './firebase/config';
import { PendingPromise } from '@beyond-js/kernel/core';
import { User } from '@aimpact/chat-sdk/users';
import {
	signOut,
	signInWithPopup,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	getRedirectResult,
	verifyPasswordResetCode,
	confirmPasswordReset,
	onAuthStateChanged
} from 'firebase/auth';
import { ReactiveModel } from '@beyond-js/reactive/model';

export class Auth extends ReactiveModel<Auth> {
	#uid: string;
	#pendingLogin;
	#user: User;
	get user() {
		return this.#user;
	}

	#getUserPromise: PendingPromise<User>;
	#session;
	constructor(session) {
		super();
		this.session = session;

		getRedirectResult(auth).then(this.onRedirectResult.bind(this));
		onAuthStateChanged(auth, this.onAuthStateChanged.bind(this));
	}
	async onRedirectResult(data) {
		if (!data) return;
		this.onAuthStateChanged(data);
	}
	async onAuthStateChanged(data) {
		if (!data && this.#user) {
			this.#user = undefined;
			this.signOut();
		}

		if (data) {
			if (this.#user && this.#user.id === data.uid) return;

			const user = await this.getUserModel({ id: data.uid });

			user.setFirebaseUser(data);
			// await user.login(data.accessToken);

			await this.appLogin(data);
			/* TODO Review */
			this.#user = user;
		}

		this.ready = true;
		this.trigger('ready');
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

	async getUserModel(specs): Promise<User> {
		if (this.#user && this.#user.id === specs.id) {
			await this.#user.set(specs);
			return this.#user;
		}
		if (this.#user) this.#user = undefined;

		this.#user = await User.getModel(specs);
		await this.#user.initialize(specs);

		if (this.#user.token) {
			await this.#user.load();
		}
		// this.#getUserPromise.resolve(this.#user);
		return this.#user;
	}

	appLogin = async (user: User) => {
		if (this.#pendingLogin) {
			return this.#pendingLogin;
		}

		if (!user?.uid) {
			return { status: false, error: 'INVALID_USER' };
		}

		this.#uid = user.uid;

		this.#pendingLogin = new PendingPromise();

		const { displayName, photoURL, email, phoneNumber, uid } = user;
		const firebaseToken = await user.getIdToken();

		const specs = { id: uid, displayName, photoURL, email, phoneNumber, firebaseToken };
		// const user = new User(specs);
		const model = await this.getUserModel(specs);

		const logInValidation = couldLog => {
			if (!couldLog) {
				console.error('Could not login', couldLog);
			}

			this.trigger('login');
			this.#pendingLogin.resolve({ status: true, model });
		};

		model.login(firebaseToken).then(logInValidation);
		return this.#pendingLogin;
	};

	login = async (email: string, password: string) => {
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);

			return await this.appLogin(response);
		} catch (error) {
			return { status: false, error: error.message };
		}
	};
	0;

	signInWithGoogle = async () => {
		try {
			const response = await signInWithPopup(auth, googleProvider);
			//const response = await signInWithRedirect(auth, googleProvider);
			return await this.appLogin(response.user);
		} catch (error) {
			const errors = {
				'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL',
				'auth/popup-closed-by-user': 'POPUP_CLOSED_BY_USER'
			};

			return { status: false, error: errors[error.code] || 'CANNOT' };
		}
	};

	registerWithEmail = async (email: string, password: string, username: string) => {
		try {
			const response = await createUserWithEmailAndPassword(auth, email, password);
			const userWithDisplayName = { ...response.user, displayName: username };

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

	signOut = async () => {
		try {
			this.#pendingLogin = undefined;
			await signOut(auth);
		} catch (error) {
			console.error(error);
		}
	};
	logout = this.signOut;
}
