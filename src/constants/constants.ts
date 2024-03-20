import { UserRoles } from '../types/types';

declare global {
	interface Window {
		BASE_URL: string;
	}
}

const resolveBaseUrl = () => {
	const baseUrl =
		window.BASE_URL !== '%%BASEURL%%'
			? window.BASE_URL
			: process.env.REACT_APP_SERVER;

	if (baseUrl?.endsWith('/')) {
		return baseUrl;
	}

	return baseUrl + '/';
};

export const BASE_URL = resolveBaseUrl();

export const USER_ROLES_OPTIONS: Record<UserRoles, string> = {
	[UserRoles.ADMIN]: 'Admin',
	[UserRoles.USER]: 'User',
};

export const NUMBER_OF_OBJECTS_PER_PAGE = 30;
