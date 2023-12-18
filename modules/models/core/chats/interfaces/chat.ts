export /*bundle */ interface IChatProperties {
	name: string;
	userId: string;
	language: {
		default: string;
	};
	knowledgeBoxId?: string;
}
export /*bundle */ interface IChat {
	id: string;
	name: string;
	userId: string;
	category: string;
	system: string;
	parent: string;
	knowledgeBoxId: string;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
	metadata: {};
}
