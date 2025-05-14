import type { Chat } from '../item';
export interface IMessage {
	id?;
	chat?: { id: string } | Chat;
	chatId?: string;
	content?: string;
	role?: 'user' | 'system';
	audio?: Blob;
	streaming: boolean;
	timestamp?: number;
	actions?: any[];
	error: any;
	language?: string;
	format?: 'audio' | 'text';
	userId: string;
	type: 'message' | 'answer';
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
	chat?: Chat;
	timestamp?: number;
	role?: 'user' | 'system';
	content?: string;
	multipart?: boolean;
	audio?: Blob;
	streaming: boolean;
	type: 'message' | 'answer';
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
