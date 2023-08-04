import { DBManager } from '@beyond-js/reactive/database';

async function initialize() {
	try {
		const db = await DBManager.config('chat-api@12', {
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			User: 'id',
			Messages: 'id, chatId, userId, text, role, usage, timestamp',
			AudioRecords: 'id, messageId',
			KnowledgeBases: 'id, userId',
			KnowledgeBoxes: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
			Lessons: 'id, title',
			Topics: 'id, classId, title',
			GClasses: 'id, sessions',
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const initDB = initialize;
