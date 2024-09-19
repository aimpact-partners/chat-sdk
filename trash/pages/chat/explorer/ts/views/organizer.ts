interface Item {
	id: string;
	autoplay: boolean;
	name: string;
	userId: string;
	system: string;
	parent: string;
	category: string;
	usage: string;
	knowledgeBoxId: string;
	metadata: any;
	children?: Item[];
}

export function organizeByParent(items: any[]): Item[] {
	const map: { [key: string]: Item } = {};

	// Create a map with the "id" as key and item as value
	const data = items.map(item => item.getProperties());
	for (const item of data) {
		map[item.id] = item;
		map[item.id].children = []; // Initialize the children property for each item
	}

	const result: Item[] = [];

	// Organize items into their parent's "children" property
	for (const item of data) {
		const parentId = item.parent;

		if ([0, '0'].includes(parentId)) {
			result.push(item); // If the parent is '0', it's a top-level item
		} else {
			const parent = map[parentId];
			if (parent) {
				parent.children.push(item); // Add the item to its parent's "children" property
			} else {
				// Handle the case where parent doesn't exist in the array
				console.warn(`Parent with ID "${parentId}" not found for item with ID "${item.id}"`);
			}
		}
	}

	return result;
}
