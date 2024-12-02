import { ReactiveModel, ModelProperties } from '@aimpact/chat-sdk/reactive/model';
import { v4 as uuidv4 } from 'uuid';
import { RegistryData } from './types';
import { IRecordProps } from '../types';

export class Registry extends ReactiveModel<IRecordProps> {
	#id: RegistryData['id'];
	#instanceId: RegistryData['id'];
	#isDeleted: boolean = false;

	#draft: boolean = false;
	get draft() {
		return this.#draft;
	}
	set draft(value: boolean) {
		if (value === this.#draft) return;
		this.#draft = value;
		this.triggerEvent();
	}

	get id() {
		return this.#id || this.#values.id;
	}

	get instanceId() {
		return this.#instanceId;
	}

	#values: RegistryData;
	get values(): RegistryData {
		return this.#values;
	}

	get deleted(): boolean {
		return this.#isDeleted;
	}

	set deleted(value: boolean) {
		if (value === this.#isDeleted) return;
		this.#isDeleted = value;
		this.triggerEvent();
	}
	#entity: string;

	constructor(entity, { properties, ...data }: Partial<RegistryData> = { id: undefined } as RegistryData) {
		super({ properties: properties || [] });

		this.#entity = entity;
		const { id } = data;
		this.#instanceId = data?.instanceId ? data.instanceId : uuidv4();

		this.#id = id;
		this.#draft = !id;
		this.#values = { ...data, id: this.#id } as RegistryData;
		this.setValues(this.#values);
	}

	private updateValue<K extends keyof RegistryData>(key: K, value: RegistryData[K]): void {
		this.#values[key] = value;
	}

	setValues(data: Partial<RegistryData>): boolean {
		if (!data) return false;

		let updated = false;
		let draft = this.#draft;

		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const property = key as keyof RegistryData;
				const value = data[property] as RegistryData[typeof property];
				if (value === this.#values[property]) continue;

				this.updateValue(property, value);
				updated = true;
			}
		}

		if (updated) {
			this.trigger('change', { values: this.#values });
			if (this.id && draft) {
				this.trigger('record.published', { ...this.#values });
			} else {
				this.trigger('record.updated', { ...this.#values });
			}
		}
		return updated;
	}

	getValues(): ModelProperties<RegistryData> {
		return { ...this.#values };
	}
}
