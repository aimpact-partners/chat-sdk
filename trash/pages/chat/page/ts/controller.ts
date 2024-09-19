import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { View } from './views';
import { StoreManager } from './store';

interface IUri {
	vars: Map<string, string>;
	vdir: Map<string, string>;
}

export /*bundle*/
class Controller extends PageReactWidgetController {
	#store: StoreManager;
	declare uri: IUri;
	createStore() {
		this.#store = new StoreManager();
		globalThis.store = this.#store;
		return this.#store;
	}
	get Widget() {
		return View;
	}

	show() {
		//this.#store.load(this.uri.vars.get('id'));
	}

	hide() {
		this.#store.clean();
	}
}
