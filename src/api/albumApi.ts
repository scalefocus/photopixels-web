import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axios";
import { Album, AlbumsResponse } from "models/Album";

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

export const getAlbums = () =>
    useQuery({
        queryKey: ['getAlbums'],
        queryFn: async (): Promise<Album[]> => {
            const res = await axiosClient.get<AlbumsResponse>('album');
            return res.data.albums;
        },
    });

export const useDeleteAlbum = () =>
    useMutation({
        mutationFn: async (id: string) => {
            await axiosClient.delete(`album/${id}`);
        },
    });