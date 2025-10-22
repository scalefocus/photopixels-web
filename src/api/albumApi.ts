import { useMutation, useQuery } from "@tanstack/react-query";
import { Album, AlbumsResponse } from "models/Album";
import { IGetObjects } from "types/types";

import axiosClient from "./axios";

export async function addAlbum({
    name,
    isSystem
}: {
    name: string;
    isSystem: boolean;
}): Promise<Album> {
    const res = await axiosClient.post('album', {
        name,
        isSystem
    });

    return res.data;
}

export const getAlbums = () =>
    useQuery({
        queryKey: ['getAlbums'],
        queryFn: async (): Promise<Album[]> => {
            const res = await axiosClient.get<AlbumsResponse>('album');
            return res.data.albums;
        },
    });

export const deleteAlbum = () =>
    useMutation({
        mutationFn: async (id: string) => {
            await axiosClient.delete(`album/${id}`);
        },
    });

export async function addObjectsToAlbum(params: { albumId: string; objectIds: string[] }) {
    const { albumId, objectIds } = params;
    const { data } = await axiosClient.post(
        `album/${encodeURIComponent(albumId)}/objects`, objectIds
    );
    return data;
}

export const getAlbumItems = async ({ albumId }: { albumId: string; }): Promise<IGetObjects> => {
    const res = await axiosClient.get(`/album/${albumId}/100`);
    return res.data;
};

export const getAlbumById = async ({ albumId }: { albumId: string; }): Promise<Album> => {
    const res = await axiosClient.get(`/album/${albumId}`);
    return res.data;
};

export async function updateAlbum({ id, name }: {
    id: string
    name: string;
}): Promise<void> {
    const res = await axiosClient.put('album', { id, name });
    return res.data;
}

export async function bulkRemoveObjectsFromAlbum(params: { albumId: string; objectIds: string[] }) {
  const { albumId, objectIds } = params;
  const { data } = await axiosClient.post(
    `/albums/${encodeURIComponent(albumId)}/objects:bulk-delete`,
    objectIds
  );
  return data;
}