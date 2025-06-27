/**
 * File: completions.ts
 */
import OpenAI from 'openai';

type FormatResponse = OpenAI.ResponseFormatText | OpenAI.ResponseFormatJSONObject | OpenAI.ResponseFormatJSONSchema;
export /*bundle*/ interface ICompletionsParams {
	messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
	model?: string;
	temperature?: number;
	format?: 'text' | 'json' | 'json_schema';
	schema?: Record<string, any>;
	store?: boolean;
	metadata?: Record<string, any>;
}

export class Completions {
	#openai: OpenAI;

	constructor(openai: OpenAI) {
		this.#openai = openai;
	}

	async execute(params: ICompletionsParams) {
		const { messages, model, temperature = 0.2, format, schema, store, metadata } = params;
		const response_format = (() => {
			let response: FormatResponse = { type: 'text' };
			if (format === 'json') response = { type: 'json_object' };
			if (format === 'json_schema')
				response = {
					type: 'json_schema',
					json_schema: {
						name: schema.name,
						description: schema.description ?? undefined,
						schema: schema.schema,
						strict: schema.stict ?? null
					}
				};
			return response;
		})();

		try {
			const response = await this.#openai.chat.completions.create({
				model,
				messages,
				temperature,
				response_format,
				store,
				metadata
			});

			return { status: true, data: response.choices[0].message.content };
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async file(params) {
		const { fileId, type, model, prompt } = params;

		const inputType = type === 'file' ? 'input_file' : 'input_image';
		const content = { type: inputType, file_id: fileId };
		// type === 'input_image' && (content.detail = 'auto');
		const response = await this.#openai.responses.create({
			model,
			input: [
				{
					role: 'user',
					content: [{ type: 'input_text', text: prompt }, content]
				}
			]
		});

		if (response.status !== 'completed') {
			return { status: false, error: response.status };
		}

		return { status: true, data: response.output_text };
	}
}

/**
 * File: file.ts
 */
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { getExtension } from './utils/get-extension';

dotenv.config();

export class File {
	#openai: OpenAI;

	constructor(openai: OpenAI) {
		this.#openai = openai;
	}

	async get(params) {
		try {
			return { status: true, data: '' };
		} catch (e) {
			return { status: false, error: e.message };
		}
	}

	async upload(params) {
		const { file } = params;

		let result: any;
		let response: any;
		try {
			const method = 'POST';
			const URL = `https://api.openai.com/v1/files`;

			const formData = new FormData();
			formData.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
			formData.append('purpose', 'user_data');

			response = await fetch(URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
				},
				body: formData
			});
			const json = await response.json();

			const extension = getExtension(file.mimetype);
			result = { ...json, fileType: extension === '.pdf' ? 'file' : 'image' };
		} catch (exc) {
			console.error('upload', exc);
			return { error: { code: 'BA100', text: `Failed to post` } };
		}

		return result;
	}
}

/**
 * File: index.ts
 */
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Completions } from './completions';
import { File } from './file';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
	console.error('process.env.OPENAI_API_KEY not found', process.env.OPENAI_API_KEY);
	throw new Error('The openAI key is missing');
}

export /*bundle*/ class OpenAIBackend {
	#openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	#completions = new Completions(this.#openai);
	get completions() {
		return this.#completions;
	}

	#file = new File(this.#openai);
	get file() {
		return this.#file;
	}
}

/**
 * File: utils\get-extension.ts
 */
export const getExtension = (mimeType: string): string | null => {
	switch (mimeType) {
		case 'audio/mpeg':
			return '.mp3';
		case 'audio/aac':
			return '.aac';
		case 'audio/wav':
			return '.wav';
		case 'audio/ogg':
			return '.ogg';
		case 'audio/webm':
			return '.webm';
		case 'audio/mp4':
			return '.m4a';
		case 'video/webm':
			return '.webm';
		case 'image/png':
			return '.png';
		case 'image/jpg':
			return '.jpg';
		case 'image/jpeg':
			return '.jpeg';
		case 'application/pdf':
			return '.pdf';
		default:
			return null;
	}
};

/**
 * File: utils\models.ts
 */
export /*bundle*/ const models = Object.freeze({
	// Language models
	GPT_4: 'gpt-4',
	GPT_4_TURBO: 'gpt-4-turbo',
	GPT_4O: 'gpt-4o',
	GPT_4O_MINI: 'gpt-4o-mini',
	GPT_3_5_TURBO: 'gpt-3.5-turbo',
	GPT_3_5_TURBO_INSTRUCT: 'gpt-3.5-turbo-instruct',
	GPT_3_5_TURBO_16K: 'gpt-3.5-turbo-16k',

	// Image generation models
	DALL_E_2: 'dall-e-2',
	DALL_E_3: 'dall-e-3',

	// Speech recognition models
	WHISPER_1: 'whisper-1',
	WHISPER_LARGE_V2: 'whisper-large-v2',
	WHISPER_LARGE_V3: 'whisper-large-v3'
});

