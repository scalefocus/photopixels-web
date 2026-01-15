# Architecture Overview

This document describes the architecture, design patterns, and technical structure of the PhotoPixels Web application.

## High-Level Architecture

PhotoPixels Web is a Single Page Application (SPA) built with React and TypeScript that communicates with a RESTful backend API.

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Nginx Server   │      │  PhotoPixels API │
│  (Production)   │─────▶│   (Backend)      │
└─────────────────┘      └──────────────────┘
         │
         │
┌─────────────────┐
│  React App      │
│  (Static Files) │
└─────────────────┘
```

## Project Structure

```
photopixels-web/
├── public/                      # Static assets served as-is
│   ├── index.html               # HTML entry point
│   ├── favicon.ico              # App icon
│   ├── manifest.json            # PWA manifest
│   └── robots.txt               # SEO robots file
│
├── src/
│   ├── api/                     # API integration layer
│   │   ├── api.ts               # API functions
│   │   ├── albumApi.ts          # Album-specific API
│   │   └── axios.ts             # Axios instance configuration
│   │
│   ├── assets/                  # Application assets (images, icons)
│   │   └── AppIcon.png
│   │
│   ├── components/              # Reusable React components
│   │   ├── Preview.tsx          # Media preview modal
│   │   ├── ImageGallery.tsx    # Image grid display
│   │   ├── UploadImage.tsx     # File upload component
│   │   ├── Users.tsx            # User management
│   │   └── Albums/              # Album-related components
│   │       ├── AlbumsGallery.tsx
│   │       ├── CreateAlbum.tsx
│   │       └── AddToAlbumDialog.tsx
│   │
│   ├── constants/               # Application constants
│   │   └── constants.ts         # BASE_URL, roles, pagination
│   │
│   ├── context/                 # React Context providers
│   │   └── authContext.tsx      # Authentication context
│   │
│   ├── layout/                  # Layout components
│   │   ├── MainLayout.tsx       # Public layout (login, register)
│   │   ├── DashboardLayout.tsx  # Authenticated layout
│   │   └── Nav.tsx              # Navigation component
│   │
│   ├── models/                  # TypeScript data models
│   │   ├── Album.ts
│   │   └── UploadImageResponse.ts
│   │
│   ├── pages/                   # Page-level components
│   │   ├── App.tsx              # Main app component with routing
│   │   ├── LoginPage.tsx        # Login page
│   │   ├── RegisterPage.tsx     # Registration page
│   │   ├── OverviewPage.tsx     # Main gallery page
│   │   ├── FavoritesPage.tsx    # Favorites gallery
│   │   ├── TrashPage.tsx        # Trash/deleted items
│   │   ├── SettingsPage.tsx     # User settings
│   │   ├── AdminSettings.tsx    # Admin settings
│   │   ├── UsersPage.tsx        # User management
│   │   └── Albums/
│   │       ├── AlbumsPage.tsx
│   │       └── AddAlbumPage.tsx
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── types.ts             # Shared types and interfaces
│   │
│   ├── utils/                   # Utility functions
│   │   ├── utils.ts             # General utilities
│   │   └── validate.ts          # Validation functions
│   │
│   ├── index.tsx                # Application entry point
│   ├── theme.ts                 # MUI theme configuration
│   └── setupTests.ts            # Test configuration
│
├── docker/                      # Docker configuration
│   └── nginx.conf               # Nginx server configuration
│
├── .github/                     # GitHub configuration
│   └── workflows/
│       └── ci-main.yml          # CI/CD pipeline
│
├── Dockerfile                   # Docker image definition
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project readme
```

## Design Patterns & Architecture

### Component Architecture

The application follows a **component-based architecture** with clear separation of concerns:

#### 1. Page Components

Located in `src/pages/`, these are route-level components that:

- Define the page structure and layout
- Fetch and manage page-level data
- Compose multiple smaller components
- Handle page-specific logic

**Example:**

```tsx
// src/pages/OverviewPage.tsx
const OverviewPage = () => {
	// Page-level data fetching
	const { data, isLoading } = useGetMedia();

	return (
		<DashboardLayout>
			<ImageGallery media={data} isLoading={isLoading} />
		</DashboardLayout>
	);
};
```

#### 2. Layout Components

Located in `src/layout/`, these provide consistent page structure:

- `MainLayout.tsx` - For public pages (login, register)
- `DashboardLayout.tsx` - For authenticated pages (with navigation)
- `Nav.tsx` - Navigation sidebar/header

#### 3. Presentational Components

Located in `src/components/`, these are reusable UI components:

- Focus on how things look
- Receive data via props
- Emit events via callbacks
- No direct API calls (with exceptions)

**Example:**

```tsx
// src/components/ImageThumbnail.tsx
interface ImageThumbnailProps {
	media: MediaItem;
	onClick: (id: string) => void;
}

const ImageThumbnail = ({ media, onClick }: ImageThumbnailProps) => {
	return (
		<Card onClick={() => onClick(media.id)}>
			<CardMedia image={media.thumbnailUrl} />
		</Card>
	);
};
```

### State Management Strategy

#### 1. Server State - React Query

Used for all server data (API responses):

```tsx
import { useQuery } from '@tanstack/react-query';
import { getPhoto } from 'api/api';

const { data: url, isLoading } = useQuery({
	queryKey: ['getPhoto', media.id],
	queryFn: () => getPhoto(media.id),
});
```

**Benefits:**

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

#### 2. Local State - useState

For component-local UI state:

```tsx
const [zoom, setZoom] = useState(false);
const [selectedImage, setSelectedImage] = useState<string | null>(null);
```

#### 3. Global State - React Context

For authentication and user data:

```tsx
// src/context/authContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider');
	return context;
};
```

### Data Flow

```
User Action
    ↓
Event Handler
    ↓
API Call (via React Query)
    ↓
Backend API
    ↓
Response → Cache Update
    ↓
Component Re-render
    ↓
UI Update
```

### API Integration Layer

All API calls are centralized in the `src/api/` folder:

#### Axios Configuration (`axios.ts`)

```typescript
const axiosClient = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Request interceptor - adds auth token
axiosClient.interceptors.request.use((config) => {
	const token = storage.getToken();
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

// Response interceptor - handles errors
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized
		}
		return Promise.reject(error);
	}
);
```

#### API Functions (`api.ts`)

```typescript
export async function getMedia(page: number): Promise<IGetObjects> {
	const response = await axiosClient.get(`media?page=${page}`);
	return response.data;
}

export async function uploadImage(
	formData: FormData
): Promise<UploadImageResponse> {
	const response = await axiosClient.post('media', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
	return response.data;
}
```

### Routing Architecture

React Router v6 is used for client-side routing:

```tsx
// src/pages/App.tsx
<BrowserRouter>
	<Routes>
		{/* Public routes */}
		<Route path="/login" element={<LoginPage />} />
		<Route path="/register" element={<RegisterPage />} />

		{/* Protected routes */}
		<Route element={<ProtectedRoute />}>
			<Route path="/" element={<OverviewPage />} />
			<Route path="/favorites" element={<FavoritesPage />} />
			<Route path="/albums" element={<AlbumsPage />} />
			<Route path="/settings" element={<SettingsPage />} />

			{/* Admin-only routes */}
			<Route path="/admin" element={<AdminSettings />} />
			<Route path="/users" element={<UsersPage />} />
		</Route>
	</Routes>
</BrowserRouter>
```

### Authentication Flow

```
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │
       │ POST /user/login
       ▼
┌──────────────┐
│ Backend API  │
└──────┬───────┘
       │
       │ Returns JWT token
       ▼
┌──────────────────┐
│ Store in         │
│ localStorage     │
└──────┬───────────┘
       │
       │ Update AuthContext
       ▼
┌──────────────────┐
│ Redirect to      │
│ Dashboard        │
└──────────────────┘
```

## Technology Stack Details

### Core Framework

- **React 18.2** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **React Scripts 5.0** - Build tooling (Create React App)

### UI & Styling

- **Material-UI (MUI) 5.14** - Component library
- **@emotion/react & @emotion/styled** - CSS-in-JS styling
- **MUI Icons** - Icon components

### Data Fetching & State

- **TanStack React Query 5.8** - Server state management
- **Axios 1.6** - HTTP client
- **React Context API** - Global client state

### Routing & Navigation

- **React Router 6.18** - Client-side routing

### User Experience

- **React Hot Toast** - Toast notifications
- **React Intersection Observer** - Lazy loading/infinite scroll

### Development Tools

- **TypeScript Compiler** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Testing Library** - Component testing
- **Jest** - Test runner

## Build & Deployment Architecture

### Development Build

```
npm start
    ↓
webpack-dev-server
    ↓
Hot Module Replacement (HMR)
    ↓
Browser @ localhost:3000
```

### Production Build

```
npm run build
    ↓
Webpack optimization
    ↓
Static files in build/
    ├── index.html
    ├── static/js/
    ├── static/css/
    └── static/media/
```

### Docker Deployment

```
Multi-stage Dockerfile
    ↓
Stage 1: Install dependencies (node:16.18-alpine)
    ↓
Stage 2: Build application (node:16.18-alpine)
    ↓
Stage 3: Serve with Nginx (nginx:latest)
    ↓
Container running on port 80
```

## Performance Optimizations

### Code Splitting

React.lazy and Suspense for route-based code splitting:

```tsx
const AlbumsPage = lazy(() => import('./pages/Albums/AlbumsPage'));

<Suspense fallback={<Loading />}>
	<Route path="/albums" element={<AlbumsPage />} />
</Suspense>;
```

### Image Optimization

- Lazy loading with Intersection Observer
- Thumbnail generation on backend
- Progressive image loading

### Caching Strategy

- React Query cache (default: 5 minutes)
- Browser cache for static assets
- Service worker (potential PWA feature)

### Bundle Optimization

- Tree shaking (automatic with Create React App)
- Minification and uglification in production
- Gzip compression via Nginx

## Security Considerations

### Authentication

- JWT tokens stored in localStorage
- Token included in Authorization header
- Automatic logout on 401 responses

### XSS Protection

- React's automatic escaping
- Sanitization of user inputs
- CSP headers (configured in Nginx)

### CSRF Protection

- Handled by backend API
- Token-based authentication (stateless)

## Browser Support

Based on `browserslist` configuration:

**Production:**

- \>0.2% market share
- Not dead browsers
- Not Opera Mini

**Development:**

- Latest Chrome
- Latest Firefox
- Latest Safari

## Extensibility Points

The architecture supports easy extension:

1. **New Pages** - Add to `src/pages/` and update routing
2. **New Components** - Add to `src/components/`
3. **New API Endpoints** - Add functions to `src/api/`
4. **New Routes** - Update `App.tsx` routing configuration
5. **Theme Customization** - Modify `src/theme.ts`

## Future Considerations

Potential architectural improvements:

- [ ] State machine for complex flows (XState)
- [ ] Progressive Web App (PWA) features
- [ ] Server-Side Rendering (Next.js migration)
- [ ] GraphQL instead of REST
- [ ] Micro-frontends for scalability
- [ ] WebSocket for real-time updates
