import { DBManager } from '@beyond-js/reactive/database';

export async function localdb() {
	try {
		const db = await DBManager.config('chat-api@26', {
			Activities: 'id',
			Assignments: 'id, name',
			Chat: 'id, name, userId, category, usage, system, knowledgeBoxId',
			Classrooms: 'id, name',
			Conversations: 'id, name, userId, system',
			Documents: 'id, knowledgeBaseId',
			KnowledgeBoxes: 'id, userId',
			Messages: 'id,  chatId, userId, text, role, usage, timestamp',
			Modules: 'id, type, timeCreated, timeUpdated',
			Organizations: 'id',
			Projects: 'id, project',
			PromptCategories: 'id',
			Prompts: 'id',
			SharedKnowledgeBases: 'id, knowledgeBaseId, sharedWithUserId',
			Sessions: 'id,  classRoomId',
			StudentsHome: 'id',
			Topics: 'id,  title',
			User: 'id'
		});

		// For example, if you have user data to add you can use:
		// db.Chat.bulkAdd(chats);
	} catch (e) {
		console.trace('error', e);
	}
}
