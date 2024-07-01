import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { View } from './views';
import { StoreManager } from './store';

export /*bundle*/
class Controller extends PageReactWidgetController {
	#store: StoreManager;

	createStore() {
		this.#store = new StoreManager();
		return this.#store;
	}
	get Widget() {
		return View;
	}

	show() {
		this.#store.load(this.uri.qs.get('id'));
	}
}
