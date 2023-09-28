export interface IMessage {
	chat: { id: string };
	chatId?: string;
	content?: string;
	role: string;
	audio: Blob;
	timestamp: number;
	type?: 'audio' | 'text';
	usage?: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}
