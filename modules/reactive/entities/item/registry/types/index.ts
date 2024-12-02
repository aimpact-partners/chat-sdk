export type RegistryData = {
	id?: string | number;
	instanceId?: string;
	properties: any[];
};

export type RegistryId = RegistryData['id'] | RegistryData['instanceId'];
export type RegistryDataValue = Omit<RegistryData, 'properties'>;
