import { ReactiveModel } from '@aimpact/chat-sdk/reactive/model';
import { RegistryData, RegistryId } from './types';
import { Registry } from './';
import { IRecordProps } from '../types';

/**
 * Factory for managing multiple registry instances.
 */
export /*bundle */ class RegistryFactory<T = IRecordProps> extends ReactiveModel<RegistryFactory<T>> {
	static #instances: Map<string, RegistryFactory<any>> = new Map();
	items: Map<RegistryId, Registry> = new Map();

	#name: string;

	constructor(name: string, properties: any) {
		super({ properties });
		this.#name = name;
		this.ready = true;
	}

	get(id: RegistryId, data: any): Registry {
		if (!id || !this.items.has(id)) {
			const specs = data ? { id, ...data } : { id, properties: this.properties, ...data };
			const registry = new Registry(this.#name, specs as Partial<RegistryData>);
			registry.on('record.published', registry => this.trigger('new.registry', registry));
			registry.on('record.updated', registry => this.trigger('update.registry', registry));
			id = registry.id;
			this.items.set(id, registry);
		}

		const item = this.items.get(id) as Registry;
		if (data) {
			let specs = data;
			if (!data.id) {
				delete specs.id;
			}

			item.setValues(data);
		}

		return item;
	}

	static getInstance<U extends RegistryData>(entity: string, data?: any): RegistryFactory<U> {
		if (!this.#instances.has(entity)) {
			this.#instances.set(entity, new RegistryFactory<U>(entity, data));
		}
		return this.#instances.get(entity) as RegistryFactory<U>;
	}
}
