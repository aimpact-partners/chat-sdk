import { DBManager } from '@beyond-js/reactive/database';

async function initialize() {
	try {
		const db = await DBManager.config('chat-api@13', {
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			User: 'id',
			Messages: 'id, chatId, userId, text, role, usage, timestamp',
			AudioRecords: 'id, messageId',
			KnowledgeBoxes: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
			Lessons: 'id, curriculumObjective, assessment, status, topics, userId',
			Topics: 'id, classId, title',
			Sessions: 'id, lesson, classRoomId',
			GClasses: 'id, sessions',
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const initDB = initialize;
