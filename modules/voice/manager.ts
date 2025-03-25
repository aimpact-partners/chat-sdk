import { routing } from '@beyond-js/kernel/routing';
export /*bundle*/ class VoiceManager {
	private list: SpeechSynthesisVoice[] = [];
	private loaded: boolean = false;
	private onReady: (() => void)[] = [];
	private defaults: Map<string, string> = new Map();

	constructor() {
		this.init();
		this.loadDefaults();
	}

	private loadDefaults() {
		const saved = localStorage.getItem('voice.defaults');
		if (saved) {
			try {
				const defaults = JSON.parse(saved);
				Object.entries(defaults).forEach(([lang, name]) => {
					this.defaults.set(lang, name as string);
				});
			} catch (e) {
				console.error('Error loading defaults:', e);
			}
		}
	}

	private saveDefaults() {
		const defaults = Object.fromEntries(this.defaults);
		localStorage.setItem('voice.defaults', JSON.stringify(defaults));
	}

	setDefault(lang: string, name: string) {
		this.defaults.set(lang, name);
		this.saveDefaults();
	}

	setDefaults(defaults: Record<string, string>) {
		Object.entries(defaults).forEach(([lang, name]) => {
			this.defaults.set(lang, name);
		});
		this.saveDefaults();
	}

	private init() {
		const load = () => {
			const available = speechSynthesis.getVoices();
			if (available.length) {
				this.list = available;
				this.loaded = true;
				this.onReady.forEach(cb => cb());
				this.onReady = [];
			}
		};

		speechSynthesis.onvoiceschanged = load;
		load();

		globalThis.document.addEventListener('onBack', this.onBack.bind(this));
	}

	#onBackCallback: () => void | undefined;
	get onBackCallback() {
		return this.#onBackCallback;
	}
	set onBackCallback(callback) {
		this.#onBackCallback = callback;
	}

	onBack() {
		if (!this.onBackCallback) {
			routing.back();
			return;
		}
	}
	async ready(): Promise<void> {
		if (this.loaded) return;
		return new Promise(resolve => this.onReady.push(resolve));
	}

	get all(): SpeechSynthesisVoice[] {
		return this.list;
	}

	byLang(lang: string): SpeechSynthesisVoice[] {
		return this.list.filter(v => v.lang.startsWith(lang)).sort((a, b) => a.name.localeCompare(b.name));
	}

	byName(name: string): SpeechSynthesisVoice | undefined {
		return this.list.find(v => v.name === name);
	}

	getVoice(lang: string): SpeechSynthesisVoice | undefined {
		// Check if there's a custom default for this language
		const customName = this.defaults.get(lang);
		if (customName) {
			const custom = this.byName(customName);
			if (custom) return custom;
		}

		// If no custom or it doesn't exist anymore, fall back to default logic
		const available = this.byLang(lang);
		// Prioridades por calidad
		const priorities = [
			(voice: SpeechSynthesisVoice) => voice.name.includes('Google'),
			(voice: SpeechSynthesisVoice) => voice.name.includes('Microsoft'),
			(_: SpeechSynthesisVoice) => true // fallback
		];

		for (const criterion of priorities) {
			const voice = available.find(criterion);
			if (voice) return voice;
		}

		return undefined;
	}

	// Alias for backward compatibility
	getDefault(lang: string): SpeechSynthesisVoice | undefined {
		return this.getVoice(lang);
	}
}

// Export singleton instance
export /*bundle*/ const voiceManager = new VoiceManager();
