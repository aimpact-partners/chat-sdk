import { ReactWidgetController } from '@beyond-js/react-18-widgets/base';

import { View } from './views';
import { StoreManager } from './store';

export /*bundle*/
class Controller extends ReactWidgetController {
	#store: StoreManager;
	createStore() {
		this.#store = new StoreManager(this.attributes);
		return this.#store;
	}
	get Widget() {
		return View;
	}

	unmount() {
		super.unmount();

		this.#store?.unmount();
	}
}
