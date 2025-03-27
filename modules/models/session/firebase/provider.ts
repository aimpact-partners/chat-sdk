import { ReactiveModel } from '@beyond-js/reactive/model';
import {
	GoogleAuthProvider,
	User as GoogleUser,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	Auth,
	UserCredential
} from 'firebase/auth';
import { IUserData } from '../types';
import { auth } from './config';

export const googleProvider = new GoogleAuthProvider();

export class FirebaseProvider extends ReactiveModel<FirebaseProvider> {
	#executions = 0;
	#auth: Auth;
	#onAuthStateChanged: (user: IUserData) => void | undefined;
	constructor({ onAuthStateChanged: callback }) {
		super();
		this.#auth = auth;
		this.#onAuthStateChanged = callback;
		onAuthStateChanged(auth, this.onAuthStateChanged.bind(this));
	}

	private onAuthStateChanged(user: GoogleUser) {
		if (!this.#executions) {
			this.trigger('ready');
			this.#executions++;
		}
		const data = user ? this.getData(user) : null;

		this.#onAuthStateChanged(data);
	}
	async signInWithGoogle(): Promise<IUserData> {
		const response: UserCredential = await signInWithPopup(auth, googleProvider);
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

	logout() {
		return signOut(auth);
	}

	private getData(user): IUserData {
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
