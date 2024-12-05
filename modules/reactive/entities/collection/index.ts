import { Item, ItemId, IEntityProvider, RegistryFactory } from '@aimpact/reactive/entities/item';
import { ReactiveModel } from '@aimpact/reactive/model';
import { ICollectionOptions, ICollectionProvider, ILoadSpecs } from './types';

export /*bundle*/ class Collection<T extends Item, P extends IEntityProvider = IEntityProvider> extends ReactiveModel<
	Collection<T, P>
> {
	#entity: string;
	get entity(): string {
		return this.#entity;
	}
	#provider: P;

	get provider(): P {
		return this.#provider;
	}

	#item: ICollectionOptions<T, P>['item'];
	get Item(): ICollectionOptions<T, P>['item'] {
		return this.#item;
	}

	#map: Map<ItemId, T> = new Map();
	get map(): Map<ItemId, T> {
		return this.#map;
	}
	get items(): T[] {
		return [...this.#map.values()];
	}
	#filters;
	#registry: RegistryFactory<T>;
	constructor({ entity, provider, item }: ICollectionOptions<T, P>) {
		super();
		this.#entity = entity;
		if (provider && typeof provider !== 'function') {
			throw new Error('DataProvider must be a class/constructor');
		}
		if (provider) {
			this.#provider = new provider(this);
		}
		this.#registry = RegistryFactory.getInstance(entity);
		this.#registry.on('new.registry', this.onNewRegistry.bind(this));
		this.#item = item;
	}

	/**
	 * Loads and processes data from an external source via the `DataProvider`.
	 * This method uses the configured `provider` to fetch data and apply the specified filters.
	 * Filtering parameters are defined in the `args` argument, and the specific filtering logic
	 * is implemented by the `DataProvider`.
	 *
	 * ### Parameters:
	 * - `args.where` (optional): Object defining search filters with the following structure:
	 *   - `{ property: { operator: value } }`
	 *   - Supported operators include:
	 *     - `equals`: Exact match with the property value.
	 *     - `not`: Value different from the specified value.
	 *     - `in`: The property value matches one of the values in the array.
	 *     - `notIn`: The property value does not match any of the values in the array.
	 *     - `contains`: The property value contains the specified substring.
	 *     - `startsWith`: The property value starts with the specified substring.
	 *     - `endsWith`: The property value ends with the specified substring.
	 *     - `gt` (greater than): The property value is greater than the specified value.
	 *     - `gte` (greater than or equal): The property value is greater than or equal to the specified value.
	 *     - `lt` (less than): The property value is less than the specified value.
	 *     - `lte` (less than or equal): The property value is less than or equal to the specified value.
	 *
	 * - `args.orderBy` (optional): Object to define the sorting of results. Example:
	 *   - `{ property: "asc" | "desc" }` where `"asc"` is ascending order and `"desc"` is descending order.
	 *
	 * - `args.skip` and `args.take` (optional): Parameters for in-memory pagination.
	 *   - `skip`: Number of items to skip from the beginning.
	 *   - `take`: Number of items to load after skipping the defined number in `skip`.
	 *
	 * ### Exceptions:
	 * - Throws an error if the `DataProvider` is not defined or does not implement the `load` method.
	 * - Throws an error if `DataProvider.load()` does not return an array.
	 *
	 * @param {Object} args - Object containing filtering and configuration parameters.
	 * @returns {Promise<void>} - A promise that resolves when data loading and processing are complete.
	 * @throws {Error} - If data cannot be loaded or processed.
	 */

	async load(args: ILoadSpecs<T>): Promise<void> {
		this.#filters = args?.where ? args.where : {};

		if (!this.#provider || typeof this.#provider.load !== 'function') {
			throw new Error('DataProvider is not defined or does not implement the load() method.');
		}

		try {
			const data = await this.#provider.list(args);

			if (Array.isArray(data)) {
				this.#map.clear();
				data.forEach(item => {
					const instance = new this.#item(item);
					this.#map.set(item.id, instance);
				});
			} else {
				throw new Error('DataProvider.load() did not return an array of items.');
			}

			this.triggerEvent('load', { items: this.#map });
		} catch (error) {
			console.error('Error loading data:', error);
			throw error;
		}
	}

	/**
	 * Validates a new registry against the collection's filters and, if it matches,
	 * creates a new item with the registry data and adds it to the data map.
	 *
	 * @param {object} registry - The new registry data to be checked and potentially added.
	 */
	onNewRegistry(registry: Record<string, any>): void {
		// Check if the registry matches the filters
		if (this.matchesFilters(registry)) {
			// Create a new item instance with the registry data
			const newItem = new this.#item(registry);

			// Add the new item to the map, using its id as the key
			this.#map.set(registry.id, newItem);

			// Optionally trigger an event to notify that a new item was added
			this.triggerEvent('change.items', { item: newItem });
			this.triggerEvent('change');
		}
	}
	/**
	 * Validates if a registry matches the stored filters, including support for AND and OR logical operators.
	 * The #filters object contains filtering criteria that are evaluated here.
	 *
	 * @param {object} registry - The data of the registry to be checked.
	 * @returns {boolean} - Returns true if the registry matches all filter criteria; otherwise, false.
	 */
	private matchesFilters(registry: Record<string, any>): boolean {
		const filters = this.#filters?.where;
		if (!filters) return true; // If no filters are set, assume it matches

		// Helper function to evaluate a single condition
		const evaluateCondition = (property: string, criteria: Record<string, any>): boolean => {
			const registryValue = registry[property];
			return Object.entries(criteria).every(([operator, value]) => {
				switch (operator) {
					case 'equals':
						return registryValue === value;
					case 'not':
						return registryValue !== value;
					case 'in':
						return Array.isArray(value) && value.includes(registryValue);
					case 'notIn':
						return !Array.isArray(value) || !value.includes(registryValue);
					case 'contains':
						return typeof registryValue === 'string' && registryValue.includes(value);
					case 'startsWith':
						return typeof registryValue === 'string' && registryValue.startsWith(value);
					case 'endsWith':
						return typeof registryValue === 'string' && registryValue.endsWith(value);
					case 'gt':
						return registryValue > value;
					case 'gte':
						return registryValue >= value;
					case 'lt':
						return registryValue < value;
					case 'lte':
						return registryValue <= value;
					default:
						console.warn(`Unknown filter operator: ${operator}`);
						return false;
				}
			});
		};

		// General function to evaluate conditions with logical operators
		const evaluateConditions = (conditions: Record<string, any>[], logic: 'every' | 'some'): boolean =>
			conditions[logic](condition =>
				Object.entries(condition).every(([property, criteria]) => evaluateCondition(property, criteria))
			);

		// Evaluate AND conditions
		if (filters.AND && !evaluateConditions(filters.AND, 'every')) return false;

		// Evaluate OR conditions
		if (filters.OR && !evaluateConditions(filters.OR, 'some')) return false;

		// Evaluate direct conditions (outside of AND/OR)
		return Object.entries(filters)
			.filter(([key]) => key !== 'AND' && key !== 'OR')
			.every(([property, criteria]) => evaluateCondition(property, criteria));
	}
}
