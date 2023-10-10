export interface IMessage {
	chat: { id: string };
	conversationId?: string;
	content?: string;
	role: string;
	audio: Blob;
	timestamp: number;
	language: string;
	type?: 'audio' | 'text';
	usage?: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}
