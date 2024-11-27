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
	onAuthStateChanged,
	UserCredential,
	User as GoogleUser
} from 'firebase/auth';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { CustomError } from './error';

globalThis.totalAuthStateChanged = 0;
export class Auth extends ReactiveModel<Auth> {
	#uid: string;
	#pendingLogin;
	#user: User;
	/**
	 * Defines if the object is being initialized when the page is loaded
	 */
	#initializing = true;
	get user() {
		return this.#user;
	}

	#getUserPromise: PendingPromise<User>;
	#session;
	get session() {
		return this.#session;
	}
	constructor(session) {
		super();
		this.#session = session;

		getRedirectResult(auth).then(this.onRedirectResult.bind(this));
		onAuthStateChanged(auth, this.onAuthStateChanged.bind(this));
	}
	async onRedirectResult(data) {
		if (!data) return;
		this.onAuthStateChanged(data);
	}
	onAuthStateChanged(user) {
		if (!user) {
			this.#user = undefined;
			this.signOut();
			this.ready = true;
			this.#initializing = false;
			this.trigger('ready');
			return;
		}

		this.appLogin(user)
			.then(() => {
				this.#initializing = false;
			})
			.catch(error => {
				console.error('Error onAuthStateChanged', error);
			});
	}
	async getUserModel(specs): Promise<User> {
		if (this.#user && this.#user.id === specs.id) {
			await this.#user.set(specs);
			return this.#user;
		}
		if (this.#user) this.#user = undefined;

		this.#user = await User.getModel(specs);
		await this.#user.initialize(specs);

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

	appLogin = async (googleUser: GoogleUser) => {
		if (this.#pendingLogin) {
			return this.#pendingLogin;
		}

		if (!googleUser?.uid) {
			console.log('INVALID_USER', 'No user id found in response', googleUser);
			throw new CustomError(1001, 'INVALID_USER');
		}

		const user = await this.getUserModel({ id: googleUser.uid });
		user.set(googleUser);

		await user.setFirebaseUser(googleUser);
		this.#user = user;
		this.#uid = user.uid;
		this.#pendingLogin = new PendingPromise();

		const { displayName, photoURL, email, phoneNumber, uid } = googleUser;
		const firebaseToken = await googleUser.getIdToken();

		const specs = { id: uid, displayName, photoURL, email, phoneNumber, firebaseToken };
		// const user = new User(specs);
		const model = await this.getUserModel(specs);

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
				throw new CustomError(1002, 'LOGIN_ERROR');
			});

		return this.#pendingLogin;
	};

	login = async (email: string, password: string) => {
		const response = await signInWithEmailAndPassword(auth, email, password);
		return await this.appLogin(response.user);
	};

	async signInWithGoogle(): Promise<void> {
		try {
			const response: UserCredential = await signInWithPopup(auth, googleProvider);
			return await this.appLogin(response.user);
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

	registerWithEmail = async (email: string, password: string, username: string) => {
		const response = await createUserWithEmailAndPassword(auth, email, password);
		return await this.appLogin(response.user);
	};

	resetPassword = async (email: string) => {
		await sendPasswordResetEmail(auth, email);
		return { status: true };
	};

	confirmPasswordReset = async (code: string, newPassword: string) => {
		await verifyPasswordResetCode(auth, code);
		await confirmPasswordReset(auth, code, newPassword);
		return { status: true };
	};

	signOut = async () => {
		this.#pendingLogin = undefined;
		await signOut(auth);
	};
	logout = this.signOut;
}
