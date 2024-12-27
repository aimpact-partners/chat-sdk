import type { Chat } from '../item';

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
	messages: any;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
	metadata: {};
}

export interface IChats {
	items: Chat[];
}
