import { RegistryData } from './registry/types/index';
import { ReactiveModel, ReactiveProps, SetPropertiesResult } from '@aimpact/ailearn-sdk/reactive/model';
import { IItemProps, IEntityProvider } from './types';
import { RegistryFactory } from './registry/factory';
import { Registry } from './registry';

export /*bundle*/ class Item<P extends IEntityProvider = IEntityProvider> extends ReactiveModel<RegistryData> {
	#factory: RegistryFactory<RegistryData>;
	declare id: RegistryData['id'];
	#entity: string;
	get entity() {
		return this.#entity;
	}
	#registry: Registry;

	#fetched: boolean;
	get fetched() {
		return this.#fetched;
	}

	#found: boolean = false;
	get found() {
		return this.#found;
	}
	protected _provider: P;

	get provider() {
		return this._provider;
	}
	get registry() {
		return this.#registry;
	}

	#draft: boolean;
	get draft() {
		return this.#draft;
	}

	constructor({ entity, provider, properties, ...args }: Partial<IItemProps<P>> = {}) {
		super({ ...args, properties } as ReactiveProps<RegistryData>);
		if (!entity) throw new Error('Entity is required');
		this.id = args.id;
		if (provider && typeof provider !== 'function') {
			throw new Error(`Provider must be a class/constructor in object ${entity}`);
		}

		this.#entity = entity;

		this.onSet = this.onSet.bind(this);
		/**
		 * This event is triggered when the set method is executed.
		 */
		this.on('set.executed', this.onSet);

		if (provider) {
			this._provider = new provider(this);
		}

		this.#factory = RegistryFactory.getInstance(entity);

		this.initialize(args);
	}
	/**
	 *
	 * @param param0
	 */
	protected initialize({ ...args }) {
		const registry = this.#factory.get(this.id, args as Partial<RegistryData>);
		this.#registry = registry;

		const propertyValues = this.#registry.getValues();

		this.setInitialValues(propertyValues);
		// this.#registry.on('change', this.registryListener.bind(this));

		this.properties.forEach((property: keyof RegistryData) => {
			// TODO: capability to support object type properties.
			if (typeof property === 'string') {
				this.on(`${property}.changed`, () => {
					this.#registry.setValues({ [property]: this.getProperty(property) } as Partial<RegistryData>);
				});
			}
		});
	}

	private registryListener(values) {
		super.set(this.#registry.getValues());
	}

	set(values: any): SetPropertiesResult {
		const response = super.set(values);
		return response;
	}

	onSet() {
		this.#registry?.setValues(this.getProperties());
	}

	protected _load(args: any) {}
	// Define optional methods with a default implementation that gives a warning message
	async load?(args?: any) {
		if (!this.provider || typeof this.provider.load !== 'function') {
			throw new Error(
				`DataProvider is not defined or does not implement the load() method in object ${this.constructor.name}`
			);
		}

		try {
			const data = await this.provider.load(args);

			if (!data) {
				this.#found = false;
				throw new Error('DataProvider.load() did not return an item.');
			}
			this.#found = true;
			this.#fetched = true;

			this.set(data);

			this.triggerEvent('load', { ...this.getProperties() });
			this.trigger('change');
			return data;
		} finally {
			this.#fetched = true;
		}
	}

	async publish?(data?: any) {
		data = data ? data : this.getProperties();

		this.set({ ...this.getProperties(), ...data });

		super.save();
		if (this.provider && typeof this.provider.publish === 'function') {
			const updated = await this.provider.publish(data);

			if (!updated.status) {
				throw new Error('Error saving item');
			}
			this.set(updated.data);
			return updated.data;
		}
		return this.getProperties();
	}

	async delete?(id) {
		try {
			id = id ?? this.id;
			if (!this.provider || typeof this.provider.delete !== 'function') {
				throw new Error('DataProvider is not defined or does not implement the delete() method.');
			}
			this.processing = true;
			return this.provider.delete(id);
		} catch (e) {
			console.error(e);
		}
	}
}
