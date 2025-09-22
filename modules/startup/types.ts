// import type { User } from '@aimpact/chat-sdk/users';
export /*bundle*/ type Environment = 'development' | 'testing' | 'quality' | 'production';
// export type UserConstructor = new (specs: any) => User;

export /*bundle*/ interface ISDKSettings {
	environment: Environment;
	localdb?: boolean;
	pkg: string;
	userModel: any;
	api: string;
	project?: string;
}
