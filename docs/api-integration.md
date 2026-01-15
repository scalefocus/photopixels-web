# API Integration Guide

This document describes how the PhotoPixels Web application integrates with the backend API, including API structure, data fetching patterns, and best practices.

## API Architecture

### Base URL Configuration

The API base URL is configured through environment variables with runtime flexibility:

```typescript
// src/constants/constants.ts
declare global {
	interface Window {
		BASE_URL: string;
	}
}

const resolveBaseUrl = () => {
	// Priority: Docker runtime injection > Build-time env variable
	const baseUrl =
		window.BASE_URL !== '%%BASEURL%%'
			? window.BASE_URL
			: process.env.REACT_APP_SERVER;

	// Ensure trailing slash
	return baseUrl?.endsWith('/') ? baseUrl : baseUrl + '/';
};

export const BASE_URL = resolveBaseUrl();
```

## Axios Configuration

### Axios Instance Setup

```typescript
// src/api/axios.ts
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '../constants/constants';
import { storage } from '../utils/utils';

const axiosClient = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Request Interceptor - Add authentication token
axiosClient.interceptors.request.use(
	(config) => {
		const token = storage.getToken();
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response Interceptor - Handle errors globally
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Unauthorized - clear auth and redirect to login
			storage.clearToken();
			window.location.href = '/login';
		} else if (error.response?.status >= 500) {
			toast.error('Server error. Please try again later.');
		} else if (error.response?.data?.message) {
			toast.error(error.response.data.message);
		}
		return Promise.reject(error);
	}
);

export default axiosClient;
```

### Interceptor Features

**Request Interceptor:**

- Automatically adds JWT token to Authorization header
- Retrieves token from localStorage
- No manual token management needed in API calls

**Response Interceptor:**

- Handles 401 (Unauthorized) globally
- Shows error toasts for server errors
- Centralizes error handling logic

## API Functions

### Authentication API

```typescript
// src/api/api.ts

// Login
export async function login({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<User> {
	const response = await axios.post(BASE_URL + 'user/login', {
		email,
		password,
	});
	return response.data;
}

// Register
export async function register(userData: RegisterData): Promise<User> {
	const response = await axios.post(BASE_URL + 'user/register', userData);
	return response.data;
}

// Get current user
export async function getCurrentUser(): Promise<IGetUser> {
	const response = await axiosClient.get('user/current');
	return response.data;
}

// Logout
export async function logout(): Promise<void> {
	await axiosClient.post('user/logout');
	storage.clearToken();
}
```

### Media API

```typescript
// Get media with pagination
export async function getMedia(page: number): Promise<IGetObjects> {
	const response = await axiosClient.get(
		`media?page=${page}&take=${NUMBER_OF_OBJECTS_PER_PAGE}`
	);
	return response.data;
}

// Get single photo URL
export async function getPhoto(id: string): Promise<string> {
	const response = await axiosClient.get(`media/${id}`, {
		responseType: 'blob',
	});
	return URL.createObjectURL(response.data);
}

// Upload media
export async function uploadImage(
	formData: FormData
): Promise<UploadImageResponse> {
	const response = await axiosClient.post('media', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
}

// Delete media
export async function deleteMedia(id: string): Promise<void> {
	await axiosClient.delete(`media/${id}`);
}

// Toggle favorite
export async function toggleFavorite(
	id: string,
	isFavorite: boolean
): Promise<void> {
	await axiosClient.patch(`media/${id}/favorite`, { isFavorite });
}

// Get favorites
export async function getFavorites(page: number): Promise<IGetObjects> {
	const response = await axiosClient.get(
		`media/favorites?page=${page}&take=${NUMBER_OF_OBJECTS_PER_PAGE}`
	);
	return response.data;
}

// Get trash
export async function getTrash(page: number): Promise<IGetObjects> {
	const response = await axiosClient.get(
		`media/trash?page=${page}&take=${NUMBER_OF_OBJECTS_PER_PAGE}`
	);
	return response.data;
}
```

### Album API

```typescript
// src/api/albumApi.ts

// Get all albums
export async function getAlbums(): Promise<Album[]> {
	const response = await axiosClient.get('albums');
	return response.data;
}

// Create album
export async function createAlbum(name: string): Promise<Album> {
	const response = await axiosClient.post('albums', { name });
	return response.data;
}

// Get album by ID
export async function getAlbum(id: string): Promise<Album> {
	const response = await axiosClient.get(`albums/${id}`);
	return response.data;
}

// Add media to album
export async function addMediaToAlbum(
	albumId: string,
	mediaIds: string[]
): Promise<void> {
	await axiosClient.post(`albums/${albumId}/media`, { mediaIds });
}

// Remove media from album
export async function removeMediaFromAlbum(
	albumId: string,
	mediaId: string
): Promise<void> {
	await axiosClient.delete(`albums/${albumId}/media/${mediaId}`);
}

// Delete album
export async function deleteAlbum(id: string): Promise<void> {
	await axiosClient.delete(`albums/${id}`);
}
```

### User Management API (Admin)

```typescript
// Get all users (admin)
export async function getUsers(): Promise<IUser[]> {
	const response = await axiosClient.get('users');
	return response.data;
}

// Create user (admin)
export async function createUser(userData: CreateUserData): Promise<User> {
	const response = await axiosClient.post('users', userData);
	return response.data;
}

// Update user (admin)
export async function updateUser(
	id: string,
	userData: UpdateUserData
): Promise<User> {
	const response = await axiosClient.patch(`users/${id}`, userData);
	return response.data;
}

// Delete user (admin)
export async function deleteUser(id: string): Promise<void> {
	await axiosClient.delete(`users/${id}`);
}

// Update user quota (admin)
export async function updateQuota(id: string, quota: number): Promise<void> {
	await axiosClient.patch(`users/${id}/quota`, { quota });
}
```

## React Query Integration

### Query Client Setup

```typescript
// src/index.tsx or App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Using Queries

```typescript
// In a component
import { useQuery } from '@tanstack/react-query';
import { getPhoto } from 'api/api';

const Preview = ({ media }: PreviewProps) => {
  const { data: url, isLoading, error } = useQuery({
    queryKey: ['getPhoto', media.id],
    queryFn: () => getPhoto(media.id),
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <ErrorMessage />;

  return <img src={url} alt="preview" />;
};
```

### Using Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadImage } from 'api/api';
import toast from 'react-hot-toast';

const UploadComponent = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      toast.success('Image uploaded successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error) => {
      toast.error('Upload failed');
    },
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  return (
    <input
      type="file"
      onChange={(e) => handleUpload(e.target.files[0])}
      disabled={uploadMutation.isPending}
    />
  );
};
```

### Custom Hooks for API

Create reusable query hooks:

```typescript
// src/hooks/useMediaQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, uploadImage, deleteMedia } from 'api/api';

export const useMediaQuery = (page: number) => {
	return useQuery({
		queryKey: ['media', page],
		queryFn: () => getMedia(page),
	});
};

export const usePhotoQuery = (id: string) => {
	return useQuery({
		queryKey: ['photo', id],
		queryFn: () => getPhoto(id),
		enabled: !!id,
	});
};

export const useUploadMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: uploadImage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
		},
	});
};

export const useDeleteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteMedia,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['media'] });
		},
	});
};
```

Usage in components:

```typescript
const { data, isLoading } = useMediaQuery(1);
const uploadMutation = useUploadMutation();
const deleteMutation = useDeleteMutation();
```

## TypeScript Types

### API Response Types

```typescript
// src/types/types.ts

export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRoles;
	quota: number;
	usedQuota: number;
	token?: string;
}

export interface MediaItem {
	id: string;
	url: string;
	thumbnailUrl: string;
	mediaType: 'image' | 'video';
	dateCreated: string;
	isFavorite: boolean;
	size: number;
}

export interface IGetObjects {
	media: MediaItem[];
	totalCount: number;
	hasMore: boolean;
}

export interface Album {
	id: string;
	name: string;
	mediaCount: number;
	createdAt: string;
	thumbnail?: string;
}

export enum UserRoles {
	ADMIN = 'admin',
	USER = 'user',
}
```

## Error Handling

### API Error Types

```typescript
interface APIError {
	message: string;
	statusCode: number;
	errors?: Record<string, string[]>;
}
```

### Error Handling Patterns

```typescript
// Option 1: Try-catch
async function handleLogin(email: string, password: string) {
	try {
		const user = await login({ email, password });
		storage.setToken(user.token);
		navigate('/');
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const apiError = error.response?.data as APIError;
			toast.error(apiError.message || 'Login failed');
		}
	}
}

// Option 2: React Query (recommended)
const loginMutation = useMutation({
	mutationFn: login,
	onSuccess: (user) => {
		storage.setToken(user.token);
		navigate('/');
	},
	onError: (error: AxiosError<APIError>) => {
		toast.error(error.response?.data.message || 'Login failed');
	},
});
```

## Pagination

### Infinite Scroll with React Query

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

const ImageGallery = () => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['media'],
    queryFn: ({ pageParam = 1 }) => getMedia(pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <>
      {data?.pages.map((page) =>
        page.media.map((item) => (
          <ImageThumbnail key={item.id} media={item} />
        ))
      )}
      <div ref={ref}>{isFetchingNextPage && <Loading />}</div>
    </>
  );
};
```

## File Upload

### Upload with Progress

```typescript
const uploadWithProgress = async (
	file: File,
	onProgress: (progress: number) => void
) => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await axiosClient.post('media', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		onUploadProgress: (progressEvent) => {
			const percentCompleted = Math.round(
				(progressEvent.loaded * 100) / progressEvent.total
			);
			onProgress(percentCompleted);
		},
	});

	return response.data;
};

// Usage
const [progress, setProgress] = useState(0);
await uploadWithProgress(file, setProgress);
```

## Authentication Flow

```typescript
// 1. Login
const user = await login({ email, password });
storage.setToken(user.token);

// 2. Token is automatically added to all subsequent requests via interceptor

// 3. On 401 response, interceptor clears token and redirects to login

// 4. Manual logout
await logout();
storage.clearToken();
navigate('/login');
```

## API Best Practices

### DO ✅

- Use React Query for all API calls
- Create custom hooks for reusable queries
- Handle errors globally via interceptors
- Use TypeScript types for API responses
- Implement proper loading states
- Cache responses appropriately
- Use optimistic updates where appropriate
- Invalidate queries after mutations

### DON'T ❌

- Don't use `fetch` directly, use Axios instance
- Don't hardcode API URLs
- Don't ignore error handling
- Don't fetch data in useEffect (use React Query)
- Don't forget to handle loading states
- Don't store sensitive data in localStorage unencrypted
- Don't make unnecessary API calls

## Testing API Integration

```typescript
// Mock API calls in tests
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
	rest.get('/media', (req, res, ctx) => {
		return res(
			ctx.json({
				media: [
					/* mock data */
				],
				totalCount: 10,
				hasMore: false,
			})
		);
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## API Documentation

For complete API endpoint documentation, refer to the backend API documentation or use tools like Swagger/OpenAPI if available.

**Common Endpoints:**

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | `/user/login`      | User login            |
| POST   | `/user/register`   | User registration     |
| GET    | `/user/current`    | Get current user      |
| GET    | `/media`           | Get paginated media   |
| GET    | `/media/:id`       | Get media by ID       |
| POST   | `/media`           | Upload media          |
| DELETE | `/media/:id`       | Delete media          |
| GET    | `/media/favorites` | Get favorite media    |
| GET    | `/albums`          | Get all albums        |
| POST   | `/albums`          | Create album          |
| GET    | `/users`           | Get all users (admin) |

---

**Related Documentation:**

- [Development Guide](./development-guide.md)
- [Configuration Guide](./configuration.md)
- [Architecture Overview](./architecture.md)
