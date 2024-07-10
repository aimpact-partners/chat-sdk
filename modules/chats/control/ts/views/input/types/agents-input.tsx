export interface IAgentsInputProps {
	isWaiting?: boolean; // This is a boolean value that determines if the chat is waiting for a response
	autoTranscribe: boolean;
	onAudioSend?: (audio: Blob) => void;
	onTextSend?: (text: string) => void;
}
