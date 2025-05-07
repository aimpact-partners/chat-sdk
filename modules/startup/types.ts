// import type { User } from '@aimpact/chat-sdk/users';
export type Environment = 'development' | 'testing' | 'quality' | 'production';
// export type UserConstructor = new (specs: any) => User;

export interface ISDKSettings {
	environment: Environment;
	localdb?: boolean;
	userModel: any;
	api: string;
	project?: string;
}
