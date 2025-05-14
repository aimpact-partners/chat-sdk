export function getChatContainerClass(isReader: boolean): string {
	return `chat-control__container${isReader ? ' chat-control__container--reader' : ''}`;
}
