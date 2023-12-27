import { DBManager } from '@beyond-js/reactive/database';

async function initialize() {
	try {
		const db = await DBManager.config('chat-api@23', {
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			Conversations: 'id, name, userId, system',
			User: 'id',
			Messages: 'id,  chatId, userId, text, role, usage, timestamp',
			KnowledgeBoxes: 'id, userId',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Documents: 'id, knowledgeBaseId',
			Topics: 'id,  title',
			Sessions: 'id,  classRoomId',
			Classrooms: 'id, name',
			Projects: 'id, project',
			PromptCategories: 'id',
			Assignments: 'id, name',
			Prompts: 'id',
			Activities: 'id',
			StudentsHome: 'id',
			Modules: 'id'
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}

export /*bundle */ const initDB = initialize;
