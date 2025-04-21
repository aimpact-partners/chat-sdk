import { ReactiveModel } from '@beyond-js/reactive/model';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	User as GoogleUser,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	Auth,
	UserCredential
} from 'firebase/auth';

import { IUserData } from '../types';

export class FirebaseProvider extends ReactiveModel<FirebaseProvider> {
	#executions = 0;
	#auth: Auth;
	get auth() {
		return this.#auth;
	}
	#app: FirebaseApp;
	get app() {
		return this.#app;
	}
	#googleProvider = new GoogleAuthProvider();
	#onAuthStateChanged?: (user: IUserData | null) => void;

	constructor(
		config: object,
		{ onAuthStateChanged: callback }: { onAuthStateChanged?: (user: IUserData | null) => void }
	) {
		super();

		// Inicializa Firebase App y Auth internamente
		this.#app = initializeApp(config);
		this.#auth = getAuth(this.#app);
		this.#onAuthStateChanged = callback;

		// Observador de sesión
		onAuthStateChanged(this.#auth, this.onAuthStateChanged.bind(this));
	}

	private onAuthStateChanged(user: GoogleUser | null) {
		if (!this.#executions) {
			this.trigger('ready');
			this.#executions++;
		}

		const data = user ? this.getData(user) : null;
		this.#onAuthStateChanged?.(data);
	}

	async signInWithGoogle(): Promise<IUserData> {
		const response: UserCredential = await signInWithPopup(this.#auth, this.#googleProvider);
		return this.getData(response.user);
	}

	async getCurrentToken(forceRefresh: boolean = false): Promise<string | null> {
		const user = this.#auth.currentUser;
		if (!user) return null;

		try {
			return await user.getIdToken(forceRefresh);
		} catch (error) {
			console.error('Error retrieving token:', error);
			return null;
		}
	}

	logout(): Promise<void> {
		return signOut(this.#auth);
	}

	private getData(user: GoogleUser): IUserData {
		return {
			id: user.uid,
			uid: user.uid,
			email: user.email ?? '',
			name: user.displayName ?? '',
			displayName: user.displayName ?? '',
			photoURL: user.photoURL ?? '',
			phoneNumber: user.phoneNumber ?? '',
			provider: user.providerData[0]?.providerId ?? 'unknown'
		};
	}
}
