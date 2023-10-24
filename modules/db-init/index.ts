import { DBManager } from '@beyond-js/reactive/database';

async function initialize() {
	try {
		const db = await DBManager.config('chat-api@19', {
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			Conversations: 'id, name, userId, system',
			User: 'id',
			Messages: 'id, conversationId, chatId, userId, text, role, usage, timestamp',
			AudioRecords: 'id, messageId',
			KnowledgeBoxes: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
			Lessons: 'id, curriculumObjective, userId',
			Topics: 'id, lessonId, title',
			Sessions: 'id, lessonId, classRoomId',
			GClasses: 'id, sessions',
			Projects: 'id, project',
			PromptCategories: 'id',
			Prompts: 'id',
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const initDB = initialize;
