import type { Chat } from '../item';
export interface IMessage {
	id?;
	chat?: { id: string } | Chat;
	chatId?: string;
	content?: string;
	role?: 'user' | 'system';
	audio?: Blob;
	timestamp?: number;
	language?: string;
	format?: 'audio' | 'text';
	usage?: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}

export interface IMessageSpecs {
	chatId: string;
	systemId?: string;
	id: string;
	timestamp?: number;
	role: string;
	content?: string;
	multipart?: boolean;
	audio?: Blob;
}

/**
 * Represents the optional specs needed to create a new message
 * @param id - The id of the message
 * @param chat - The chat the message belongs to
 */
export interface IMessageConstructorSpecs extends IMessage {
	id?: string;
	chat?: Chat;
}
