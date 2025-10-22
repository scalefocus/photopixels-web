export interface Album {
  id: string;
  name: string;
  isSystem: boolean;
  dateCreated: string;
}

export interface AlbumsResponse {
  albums: Album[];
}