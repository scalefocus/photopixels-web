# Development Guide

This guide covers development workflows, coding standards, best practices, and contribution guidelines for the PhotoPixels Web application.

## Development Workflow

### Branch Strategy

We follow a Git Flow-inspired branching model:

```
main (production)
  ↓
develop (integration)
  ↓
feature/* (new features)
bugfix/* (bug fixes)
hotfix/* (production fixes)
```

#### Branch Types

| Branch Type | Naming                      | Purpose                   | Base Branch |
| ----------- | --------------------------- | ------------------------- | ----------- |
| `main`      | `main`                      | Production-ready code     | -           |
| `develop`   | `develop`                   | Integration branch        | `main`      |
| `feature/*` | `feature/add-video-support` | New features              | `develop`   |
| `bugfix/*`  | `bugfix/fix-upload-error`   | Bug fixes                 | `develop`   |
| `hotfix/*`  | `hotfix/security-patch`     | Critical production fixes | `main`      |

### Creating a New Feature

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-new-feature

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature description"

# 4. Push to remote
git push origin feature/my-new-feature

# 5. Create Pull Request on GitHub
# Target: develop branch
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

#### Examples

```bash
feat(gallery): add infinite scroll to image gallery
fix(upload): resolve file size validation issue
docs(readme): update installation instructions
refactor(api): simplify axios interceptor logic
test(preview): add tests for zoom functionality
chore(deps): update react-query to v5.8.3
```

## Code Style & Standards

### TypeScript Guidelines

#### Always Define Types

```tsx
// ❌ Bad - Using any
const handleData = (data: any) => {
	console.log(data);
};

// ✅ Good - Explicit types
interface MediaData {
	id: string;
	url: string;
	type: 'image' | 'video';
}

const handleData = (data: MediaData) => {
	console.log(data);
};
```

#### Use Interfaces for Props

```tsx
// ✅ Always define interface for component props
interface PreviewProps {
	isOpen: boolean;
	media: {
		id: string;
		dateCreated: string;
		mediaType?: 'image' | 'video';
		isFavorite?: boolean;
	};
	onClose: () => void;
	handlePrev: () => void;
	handleNext: () => void;
	disablePrevButton: boolean;
	disableNextButton: boolean;
}

const Preview = ({
	isOpen,
	media,
	onClose,
	handlePrev,
	handleNext,
	disablePrevButton,
	disableNextButton,
}: PreviewProps) => {
	// Component implementation
};
```

#### Avoid Type Assertions

```tsx
// ❌ Avoid type assertions when possible
const value = someValue as string;

// ✅ Better - Use type guards
if (typeof someValue === 'string') {
	const value = someValue;
}
```

#### Use Enums or Union Types

```tsx
// ✅ Define user roles as enum
export enum UserRoles {
	ADMIN = 'admin',
	USER = 'user',
}

// Or union type
type MediaType = 'image' | 'video';
```

### React Best Practices

#### Component Structure

Organize components consistently:

```tsx
// 1. Imports - External libraries first
import { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

// 2. Imports - Internal modules
import { getPhoto } from 'api/api';
import { MediaItem } from 'types/types';

// 3. Type definitions
interface MyComponentProps {
	mediaId: string;
	onClose: () => void;
}

// 4. Component definition
const MyComponent = ({ mediaId, onClose }: MyComponentProps) => {
	// 5. Hooks - State
	const [isOpen, setIsOpen] = useState(false);

	// 6. Hooks - Queries
	const { data, isLoading } = useQuery({
		queryKey: ['photo', mediaId],
		queryFn: () => getPhoto(mediaId),
	});

	// 7. Hooks - Effects
	useEffect(() => {
		// Side effects
	}, [mediaId]);

	// 8. Event handlers
	const handleClick = () => {
		setIsOpen(true);
	};

	// 9. Early returns
	if (isLoading) return <Loading />;
	if (!data) return null;

	// 10. Main render
	return <Box>{/* JSX */}</Box>;
};

// 11. Export
export default MyComponent;
```

#### Custom Hooks

Extract reusable logic into custom hooks:

```tsx
// src/hooks/useMediaQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getPhoto } from 'api/api';

export const useMediaQuery = (mediaId: string) => {
	return useQuery({
		queryKey: ['getPhoto', mediaId],
		queryFn: () => getPhoto(mediaId),
		enabled: !!mediaId, // Only run if mediaId exists
	});
};

// Usage in component
const { data: url, isLoading } = useMediaQuery(media.id);
```

#### Prop Drilling - Use Context Sparingly

```tsx
// ❌ Avoid excessive prop drilling
<Parent>
	<Child1 user={user}>
		<Child2 user={user}>
			<Child3 user={user} />
		</Child2>
	</Child1>
</Parent>;

// ✅ Use Context for deeply nested data
const UserContext = createContext<User | null>(null);

<UserProvider value={user}>
	<Parent>
		<Child1>
			<Child2>
				<Child3 /> {/* Uses useContext(UserContext) */}
			</Child2>
		</Child1>
	</Parent>
</UserProvider>;
```

#### Conditional Rendering

```tsx
// ✅ Use short-circuit evaluation
{
	isLoading && <Loading />;
}
{
	error && <ErrorMessage error={error} />;
}
{
	data && <DataDisplay data={data} />;
}

// ✅ Use ternary for if/else
{
	isAuthenticated ? <Dashboard /> : <Login />;
}

// ❌ Avoid complex nested ternaries
{
	isLoading ? <Loading /> : error ? <Error /> : data ? <Data /> : null;
}

// ✅ Better - Use early returns or separate variable
if (isLoading) return <Loading />;
if (error) return <Error />;
if (!data) return null;
return <Data />;
```

### MUI (Material-UI) Guidelines

#### Use the `sx` Prop

```tsx
// ✅ Preferred - sx prop for component-specific styles
<Box
	sx={{
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		p: 2, // padding: theme.spacing(2)
		gap: 1, // gap: theme.spacing(1)
		backgroundColor: 'primary.main',
		color: 'text.secondary',
		borderRadius: 1,
	}}
>
	Content
</Box>
```

#### Theme Values

```tsx
// ✅ Use theme values instead of hardcoded
sx={{
  color: 'primary.main',      // ✅ Not '#1976d2'
  backgroundColor: 'grey.100', // ✅ Not '#f5f5f5'
  p: 2,                        // ✅ Not padding: '16px'
}}
```

#### Responsive Design

```tsx
<Box
  sx={{
    width: {
      xs: '100%',        // Mobile
      sm: '80%',         // Tablet
      md: '60%',         // Desktop
    },
    fontSize: {
      xs: '0.875rem',
      md: '1rem',
    },
  }}
>
```

### File Naming Conventions

- **Components**: PascalCase - `ImageGallery.tsx`, `Preview.tsx`
- **Utilities**: camelCase - `utils.ts`, `validate.ts`
- **Types**: camelCase - `types.ts`, `albumTypes.ts`
- **Constants**: camelCase - `constants.ts`
- **Hooks**: camelCase with 'use' prefix - `useAuth.ts`, `useMediaQuery.ts`

### Folder Organization

```
src/components/
├── ImageGallery.tsx          # Simple component
├── Preview.tsx               # Simple component
└── Albums/                   # Feature folder for related components
    ├── AlbumsGallery.tsx
    ├── CreateAlbum.tsx
    └── AddToAlbumDialog.tsx
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Preview.test.tsx
```

### Writing Tests

#### Component Tests

```tsx
// src/components/__tests__/Preview.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Preview from '../Preview';

const mockProps = {
	isOpen: true,
	media: {
		id: '123',
		dateCreated: '2025-01-01',
		mediaType: 'image' as const,
		isFavorite: false,
	},
	onClose: jest.fn(),
	handlePrev: jest.fn(),
	handleNext: jest.fn(),
	disablePrevButton: false,
	disableNextButton: false,
};

const queryClient = new QueryClient();

const renderWithQuery = (component: React.ReactElement) => {
	return render(
		<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
	);
};

describe('Preview Component', () => {
	it('should render the preview dialog when open', () => {
		renderWithQuery(<Preview {...mockProps} />);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('should call onClose when close button is clicked', () => {
		renderWithQuery(<Preview {...mockProps} />);
		const closeButton = screen.getByTitle('Close Preview');
		fireEvent.click(closeButton);
		expect(mockProps.onClose).toHaveBeenCalled();
	});

	it('should handle zoom functionality', () => {
		renderWithQuery(<Preview {...mockProps} />);
		const zoomButton = screen.getByTitle('Zoom In');
		fireEvent.click(zoomButton);
		// Assert zoom state changed
	});
});
```

#### API Tests

```tsx
// src/api/__tests__/api.test.ts
import axios from 'axios';
import { getPhoto, uploadImage } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Functions', () => {
	it('should fetch photo by ID', async () => {
		const mockUrl = 'https://example.com/photo.jpg';
		mockedAxios.get.mockResolvedValue({ data: mockUrl });

		const result = await getPhoto('123');

		expect(result).toBe(mockUrl);
		expect(mockedAxios.get).toHaveBeenCalledWith(
			expect.stringContaining('media/123')
		);
	});
});
```

## Code Quality

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint -- --fix
```

### ESLint Configuration

The project uses ESLint with React App configuration. Key rules:

- No unused variables
- No console.log in production
- Consistent import order
- React Hooks rules

### Formatting

```bash
# Format all files
npm run format

# Format specific files
npx prettier --write src/components/Preview.tsx
```

### Prettier Configuration

Create `.prettierrc`:

```json
{
	"semi": true,
	"trailingComma": "es5",
	"singleQuote": true,
	"printWidth": 80,
	"tabWidth": 2,
	"useTabs": true
}
```

## Debugging

### Browser DevTools

1. **Console Logging**

```tsx
console.log('Debug info:', { media, isOpen });
console.table(mediaArray);
```

2. **React DevTools**

   - Install React Developer Tools extension
   - Inspect component props and state
   - Profile component performance

3. **Network Tab**
   - Monitor API requests
   - Check request/response headers
   - Inspect payload data

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "chrome",
			"request": "launch",
			"name": "Launch Chrome against localhost",
			"url": "http://localhost:3000",
			"webRoot": "${workspaceFolder}/src",
			"sourceMapPathOverrides": {
				"webpack:///src/*": "${webRoot}/*"
			}
		}
	]
}
```

### React Query DevTools

Already included in development:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
	<App />
	<ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>;
```

## Common Development Tasks

### Adding a New Page

1. Create page component:

```tsx
// src/pages/NewPage.tsx
const NewPage = () => {
	return (
		<DashboardLayout>
			<h1>New Page</h1>
		</DashboardLayout>
	);
};

export default NewPage;
```

2. Add route:

```tsx
// src/pages/App.tsx
import NewPage from './NewPage';

<Route path="/new-page" element={<NewPage />} />;
```

3. Add navigation:

```tsx
// src/layout/Nav.tsx
<ListItem button component={Link} to="/new-page">
	<ListItemIcon>
		<Icon />
	</ListItemIcon>
	<ListItemText primary="New Page" />
</ListItem>
```

### Adding a New API Endpoint

1. Add API function:

```tsx
// src/api/api.ts
export async function getNewData(id: string): Promise<NewDataType> {
	const response = await axiosClient.get(`/new-endpoint/${id}`);
	return response.data;
}
```

2. Create a custom hook (optional):

```tsx
// src/hooks/useNewData.ts
export const useNewData = (id: string) => {
	return useQuery({
		queryKey: ['newData', id],
		queryFn: () => getNewData(id),
	});
};
```

3. Use in component:

```tsx
const { data, isLoading, error } = useNewData('123');
```

### Adding a New Component

```tsx
// src/components/MyNewComponent.tsx
import { Box } from '@mui/material';

interface MyNewComponentProps {
	title: string;
	onAction: () => void;
}

const MyNewComponent = ({ title, onAction }: MyNewComponentProps) => {
	return (
		<Box>
			<h2>{title}</h2>
			<button onClick={onAction}>Action</button>
		</Box>
	);
};

export default MyNewComponent;
```

### Environment-Specific Code

```tsx
// Different behavior based on environment
if (process.env.NODE_ENV === 'development') {
	console.log('Debug information');
}

// Use environment variables
const apiUrl = process.env.REACT_APP_SERVER;
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const AlbumsPage = lazy(() => import('./pages/Albums/AlbumsPage'));

<Suspense fallback={<Loading />}>
	<Route path="/albums" element={<AlbumsPage />} />
</Suspense>;
```

### Memoization

```tsx
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
const sortedData = useMemo(() => {
	return data.sort((a, b) => a.date - b.date);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
	console.log('Clicked');
}, []);

// Memoize component
const MemoizedComponent = memo(MyComponent);
```

### Image Optimization

```tsx
// Use Intersection Observer for lazy loading
import { useInView } from 'react-intersection-observer';

const ImageThumbnail = ({ src }) => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	return <div ref={ref}>{inView && <img src={src} alt="thumbnail" />}</div>;
};
```

## Best Practices Summary

### DO ✅

- Use TypeScript for type safety
- Define interfaces for all props
- Use React Query for server state
- Follow component structure guidelines
- Write meaningful commit messages
- Test critical functionality
- Use MUI theme values
- Handle loading and error states
- Use environment variables for configuration

### DON'T ❌

- Use `any` type
- Mutate state directly
- Forget to clean up effects
- Hardcode API URLs
- Leave console.logs in production code
- Ignore TypeScript errors
- Bypass linting rules
- Commit sensitive data
- Use inline styles when MUI sx is available

## Getting Help

- Check existing components for patterns
- Review the [Architecture Documentation](./architecture.md)
- Consult [MUI Documentation](https://mui.com/)
- Read [React Query Docs](https://tanstack.com/query/latest)
- Ask in team chat or create a GitHub issue
