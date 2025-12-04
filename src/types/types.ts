import { USER_ROLES_OPTIONS } from '../constants/constants';

export type User = {
	userId: string;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
};

export interface IUser {
	claims: {
		email: string;
		fullName: string;
		id: string;
		role: string;
		amr: string;
	};
	email: string;
	quota: number;
	usedQuota: number;
}

export interface IGetUser {
	id: string;
	name: string;
	email: string;
	username: string;
	dateCreated: string;
	quota: number;
	usedQuota: number;
	role: keyof typeof USER_ROLES_OPTIONS;
}

export interface IRegistrationError {
	response: {
		data: {
			errors: Array<string>;
		};
	};
}
export interface IUploadError {
	response: {
		data: {
			status: number;
			title: string;
		};
	};
}

export enum UserRoles {
	ADMIN,
	USER,
}

export interface IThumbnail {
	id: string;
	dateCreated: string;
	mediaType?: string;
	isFavorite?: boolean;
}

export interface IGetObjects {
	lastId: string;
	properties: IThumbnail[];
}

export interface ICommonError {
	response: {
		data: {
			errors: Array<string>;
		};
	};
}

export interface IUserSetting {
	userId: string;
	settings: IUserSettings
}

export interface IUserSettings {
	allowVideoConversion: boolean
}