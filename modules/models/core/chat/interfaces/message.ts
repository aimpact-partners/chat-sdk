export interface IMessage {
	chat: { id: string };
	chatId?: string;
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
