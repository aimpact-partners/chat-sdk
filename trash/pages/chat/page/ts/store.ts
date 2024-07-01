import { ReactiveModel } from '@beyond-js/reactive/model';
import { CurrentTexts } from '@beyond-js/kernel/texts';
import { module } from 'beyond_context';
interface IStore {
	autoplay?: boolean;

	waitingResponse?: boolean;
	fetching?: boolean;
}
export class StoreManager extends ReactiveModel<IStore> implements IStore {

	#texts: CurrentTexts<StoreManager> = new CurrentTexts(module.specifier);
	get texts() {
		return this.#texts?.value;
	}
	
}
