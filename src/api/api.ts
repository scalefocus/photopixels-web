import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import {
	BASE_URL,
	NUMBER_OF_OBJECTS_PER_PAGE,
	USER_ROLES_OPTIONS,
} from '../constants/constants';
import { IGetObjects, IGetUser, IUser, User } from '../types/types';
import axiosClient from './axios';

export async function getStatus(): Promise<{
	registration: true;
	serverVersion: string;
}> {
	const response = await axios.get(BASE_URL + 'status');

	return response.data;
}

export async function login({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<User> {
	const response = await axios.post(BASE_URL + 'user/login', {
		email: email,
		password: password,
	});

	return response.data;
}

export async function register({
	name,
	email,
	password,
}: {
	name: string;
	email: string;
	password: string;
}): Promise<void> {
	const res = await axios.post(
		BASE_URL + 'user/register',
		{
			name,
			email,
			password,
		},
		{
			headers: { accept: '*/*', 'Content-Type': 'application/json' },
		}
	);

	return res.data;
}

export async function createUser({
	name,
	email,
	password,
	role,
}: {
	name: string;
	email: string;
	password: string;
	role: keyof typeof USER_ROLES_OPTIONS;
}): Promise<void> {
	const res = await axiosClient.post('admin/register', {
		name,
		email,
		password,
		role,
	});

	return res.data;
}

export const getUserInfo = () =>
	useQuery({
		queryKey: ['userInfo'],
		queryFn: async (): Promise<IUser> => {
			const res = await axiosClient.get('user/info');
			return res.data;
		},
	});

export const getUsers = () =>
	useQuery({
		queryKey: ['getUsers'],
		queryFn: async (): Promise<IGetUser[]> => {
			const res = await axiosClient.get('users');
			return res.data;
		},
	});

export const getUser = ({ id }: { id: IGetUser['id'] }) =>
	useQuery({
		queryKey: ['getUser', id],
		queryFn: async (): Promise<IGetUser> => {
			const res = await axiosClient.get(`user/${id}`);
			return res.data;
		},
	});

export async function deleteAccount({
	password,
}: {
	password: string;
}): Promise<void> {
	const response = await axiosClient.delete('user', {
		data: {
			password: password,
		},
	});

	return response.data;
}

export async function changeQuota({
	id,
	quota,
}: {
	id: IGetUser['id'];
	quota: number;
}): Promise<void> {
	const response = await axiosClient.post('admin/quota', {
		id,
		quota,
	});

	return response.data;
}

export async function changeRole({
	id,
	role,
}: {
	id: IGetUser['id'];
	role: keyof typeof USER_ROLES_OPTIONS;
}): Promise<void> {
	const response = await axiosClient.post(BASE_URL + 'admin/role', {
		id,
		role,
	});

	return response.data;
}

export async function deleteUser({
	id,
}: {
	id: IGetUser['id'];
}): Promise<void> {
	const response = await axiosClient.delete(`admin/user/${id}`);

	return response.data;
}

export async function uploadImage({
	file,
	objectHash,
}: {
	file: File;
	objectHash: string;
}): Promise<void> {
	const res = await axiosClient.post(
		'object',
		{
			file,
			objectHash,
			AppleCloudId: '',
			AndroidCloudId: '',
		},
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}
	);

	return res.data;
}

export async function changePassword({
	oldPassword,
	newPassword,
}: {
	oldPassword: string;
	newPassword: string;
}): Promise<void> {
	const response = await axiosClient.post('user/changepassword', {
		oldPassword,
		newPassword,
	});

	return response.data;
}

export async function forgotPassword({
	email,
}: {
	email: string;
}): Promise<void> {
	const response = await axios.post(
		BASE_URL + 'user/forgotpassword',
		{
			email,
		},
		{
			headers: {
				accept: 'text/plain',
				'Content-Type': 'application/json',
			},
		}
	);

	return response.data;
}
export async function resetPassword({
	code,
	password,
	email,
}: {
	code: string;
	password: string;
	email: string;
}): Promise<void> {
	const response = await axios.post(
		BASE_URL + 'user/resetpassword',
		{ code, password, email },
		{
			headers: {
				accept: 'text/plain',
				'Content-Type': 'application/json',
			},
		}
	);

	return response.data;
}

export async function changeRegistration({
	value,
}: {
	value: boolean;
}): Promise<void> {
	const response = await axiosClient.post('registration', { value });

	return response.data;
}

export const fetchImageIds = async ({
	pageParam,
}: {
	pageParam: string;
}): Promise<IGetObjects> => {
	const res = await axiosClient.get('objects', {
		params: { lastId: pageParam, PageSize: NUMBER_OF_OBJECTS_PER_PAGE },
	});
	return res.data;
};

export const getThumbnail = async (id: string) => {
	const res = await axiosClient.get(`object/${id}/thumbnail`, {
		responseType: 'blob',
	});

	const data = URL.createObjectURL(res.data);

	return data;
};

export const getPhoto = async (id: string) => {
	const res = await axiosClient.get(`object/${id}`, {
		responseType: 'blob',
	});

	const data = URL.createObjectURL(res.data);

	return data;
};

export async function adminResetPassword({
	password,
	email,
}: {
	password: string;
	email: string;
}): Promise<void> {
	const response = await axiosClient.post('admin/resetpassword', {
		password,
		email,
	});

	return response.data;
}

export async function trashObjects({
	objectIds,
}: {
	objectIds: string[];
}): Promise<number> {
	const response = await axiosClient.post('object/trash', {
		ObjectIds: objectIds,
	});

	return response.data;
};

export async function downloadObjectsAsZip({
	objectIds,
}: {
	objectIds: string[];
}): Promise<{ href: string; disposition: string }> {
	const res = await axiosClient.post('/object/downloadZip', {
		ObjectIds: objectIds,
	},{
		responseType: 'blob',
	});

	const href = URL.createObjectURL(res.data);
	const disposition = res.headers['content-disposition'];

	return { href, disposition };
}

export const fetchTrashedIds = async ({
	pageParam,
}: {
	pageParam: string;
}): Promise<IGetObjects> => {
	const res = await axiosClient.get('/objects/trashed', {
		params: { lastId: pageParam, PageSize: NUMBER_OF_OBJECTS_PER_PAGE },
	});
	return res.data;
};

export async function trashRestoreObjects({
	objectIds,
}: {
	objectIds: string[];
}): Promise<number> {
	const response = await axiosClient.post('/object/trash/removeObjects', {
		ObjectIds: objectIds,
	});

	return response.data;
}

export async function trashDeletePermamnentObjects({
	objectIds,
}: {
	objectIds: string[];
}): Promise<number> {
	const response = await axiosClient.post('/object/trash/deletePermanent', {
		ObjectIds: objectIds,
	});

	return response.data;
}

export async function emptyTrash(): Promise<boolean> {
	const response = await axiosClient.delete('emptytrash');

	return response.data;
}

export async function addFavorites({
	objectIds,
}: {
	objectIds: string[];
}): Promise<number> {
	const response = await axiosClient.post('/object/addFavorites', {
		ObjectIds: objectIds,
	});

	return response.data;
}

export async function removeFavorites({
	objectIds,
}: {
	objectIds: string[];
}): Promise<number> {
	const response = await axiosClient.post('/object/removeFavorites', {
		ObjectIds: objectIds,
	});

	return response.data;
}

export const fetchFavoritesIds = async ({
	pageParam,
}: {
	pageParam: string;
}): Promise<IGetObjects> => {
	const res = await axiosClient.get('/objects/favorites', {
		params: { lastId: pageParam, PageSize: NUMBER_OF_OBJECTS_PER_PAGE },
	});
	return res.data;
};

export async function addAlbum({
	name,
	isSystem
}: {
	name: string;
	isSystem: boolean;
}): Promise<void> {
	const res = await axiosClient.post('album', {
		name,
		isSystem
	});

	return res.data;
}
