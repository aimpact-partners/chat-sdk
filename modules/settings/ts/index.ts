import { User } from '@aimpact/chat-sdk/users';
import { ReactiveModel } from '@aimpact/reactive/model';

class ChatSDKSettings extends ReactiveModel<ChatSDKSettings> {
	#userModel = User;
	get userModel() {
		return this.#userModel;
	}

	set userModel(value) {
		this.#userModel = value;
		this.triggerEvent();
	}
}

export /*bundle*/ const SDKSettings = new ChatSDKSettings();
