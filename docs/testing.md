# Testing Guide

This guide covers testing strategies, best practices, and examples for the PhotoPixels Web application.

## Testing Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - React component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Preview.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run tests without watch mode (CI)
npm test -- --watchAll=false
```

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage --watchAll=false

# View coverage in browser
# Open: coverage/lcov-report/index.html
```

**Coverage Thresholds:**

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Test Structure

### Component Tests

```typescript
// src/components/__tests__/Preview.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Preview from '../Preview';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Mock data
const mockProps = {
  isOpen: true,
  media: {
    id: '123',
    dateCreated: '2025-01-01T00:00:00Z',
    mediaType: 'image' as const,
    isFavorite: false,
  },
  onClose: jest.fn(),
  handlePrev: jest.fn(),
  handleNext: jest.fn(),
  disablePrevButton: false,
  disableNextButton: false,
};

describe('Preview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    renderWithQuery(<Preview {...mockProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderWithQuery(<Preview {...mockProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    renderWithQuery(<Preview {...mockProps} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle previous button click', () => {
    renderWithQuery(<Preview {...mockProps} />);
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);
    expect(mockProps.handlePrev).toHaveBeenCalledTimes(1);
  });

  it('should disable previous button when disablePrevButton is true', () => {
    renderWithQuery(<Preview {...mockProps} disablePrevButton={true} />);
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should display formatted date', () => {
    renderWithQuery(<Preview {...mockProps} />);
    expect(screen.getByText(/date created/i)).toBeInTheDocument();
  });

  it('should show zoom button for images', () => {
    renderWithQuery(<Preview {...mockProps} />);
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
  });

  it('should not show zoom button for videos', () => {
    renderWithQuery(<Preview {...mockProps} media={{ ...mockProps.media, mediaType: 'video' }} />);
    expect(screen.queryByRole('button', { name: /zoom in/i })).not.toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
	it('should initialize with no user', () => {
		const { result } = renderHook(() => useAuth());
		expect(result.current.user).toBeNull();
		expect(result.current.isAuthenticated).toBe(false);
	});

	it('should login user', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.login('test@example.com', 'password');
		});

		expect(result.current.isAuthenticated).toBe(true);
		expect(result.current.user).not.toBeNull();
	});

	it('should logout user', async () => {
		const { result } = renderHook(() => useAuth());

		await act(async () => {
			await result.current.login('test@example.com', 'password');
			await result.current.logout();
		});

		expect(result.current.isAuthenticated).toBe(false);
		expect(result.current.user).toBeNull();
	});
});
```

### API Tests

```typescript
// src/api/__tests__/api.test.ts
import axios from 'axios';
import { getPhoto, uploadImage, deleteMedia } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Functions', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getPhoto', () => {
		it('should fetch photo and return blob URL', async () => {
			const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });
			mockedAxios.get.mockResolvedValue({ data: mockBlob });

			const result = await getPhoto('123');

			expect(result).toMatch(/^blob:/);
			expect(mockedAxios.get).toHaveBeenCalledWith(
				expect.stringContaining('media/123'),
				expect.objectContaining({ responseType: 'blob' })
			);
		});

		it('should handle errors', async () => {
			mockedAxios.get.mockRejectedValue(new Error('Network error'));

			await expect(getPhoto('123')).rejects.toThrow('Network error');
		});
	});

	describe('uploadImage', () => {
		it('should upload image with FormData', async () => {
			const mockResponse = { id: '123', url: 'http://example.com/image.jpg' };
			mockedAxios.post.mockResolvedValue({ data: mockResponse });

			const formData = new FormData();
			formData.append('file', new File([''], 'test.jpg'));

			const result = await uploadImage(formData);

			expect(result).toEqual(mockResponse);
			expect(mockedAxios.post).toHaveBeenCalledWith(
				expect.stringContaining('media'),
				formData,
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'multipart/form-data',
					}),
				})
			);
		});
	});

	describe('deleteMedia', () => {
		it('should delete media by ID', async () => {
			mockedAxios.delete.mockResolvedValue({});

			await deleteMedia('123');

			expect(mockedAxios.delete).toHaveBeenCalledWith(
				expect.stringContaining('media/123')
			);
		});
	});
});
```

### Integration Tests

```typescript
// src/pages/__tests__/LoginPage.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../LoginPage';
import * as api from '../../api/api';

jest.mock('../../api/api');

const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Integration', () => {
  it('should login user successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', token: 'abc123' };
    (api.login as jest.Mock).mockResolvedValue(mockUser);

    renderLoginPage();

    // Fill in form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Wait for success
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error message on failed login', async () => {
    (api.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    renderLoginPage();

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

## Mocking

### Mock API Calls

```typescript
// Mock axios
jest.mock('axios');

// Mock specific API function
jest.mock('../../api/api', () => ({
	getPhoto: jest.fn(),
	uploadImage: jest.fn(),
	deleteMedia: jest.fn(),
}));
```

### Mock React Query

```typescript
// Mock useQuery
jest.mock('@tanstack/react-query', () => ({
	...jest.requireActual('@tanstack/react-query'),
	useQuery: jest.fn(),
}));

// In test
(useQuery as jest.Mock).mockReturnValue({
	data: mockData,
	isLoading: false,
	error: null,
});
```

### Mock localStorage

```typescript
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});
```

### Mock window.URL

```typescript
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();
```

## Test Utilities

### Custom Render Function

```typescript
// src/test-utils.tsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
```

**Usage:**

```typescript
import { renderWithProviders, screen } from '../../test-utils';

test('my test', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Mock Data Factories

```typescript
// src/test-utils/factories.ts
export const createMockMedia = (overrides = {}) => ({
	id: '123',
	url: 'http://example.com/image.jpg',
	thumbnailUrl: 'http://example.com/thumb.jpg',
	mediaType: 'image' as const,
	dateCreated: '2025-01-01T00:00:00Z',
	isFavorite: false,
	size: 1024,
	...overrides,
});

export const createMockUser = (overrides = {}) => ({
	id: '1',
	email: 'test@example.com',
	name: 'Test User',
	role: 'user' as const,
	quota: 1000000,
	usedQuota: 500000,
	...overrides,
});
```

**Usage:**

```typescript
const mockMedia = createMockMedia({ id: '456', isFavorite: true });
```

## Testing Best Practices

### DO ✅

1. **Test user behavior, not implementation:**

```typescript
// ✅ Good - tests what user sees
expect(screen.getByText('Login')).toBeInTheDocument();

// ❌ Bad - tests implementation
expect(component.state.isLoggedIn).toBe(true);
```

2. **Use accessible queries:**

```typescript
// ✅ Preferred order
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ Avoid if possible
screen.getByTestId('submit-button');
```

3. **Wait for async operations:**

```typescript
// ✅ Good
await waitFor(() => {
	expect(screen.getByText('Success')).toBeInTheDocument();
});

// ❌ Bad - might cause flaky tests
expect(screen.getByText('Success')).toBeInTheDocument();
```

4. **Clean up after each test:**

```typescript
afterEach(() => {
	jest.clearAllMocks();
	cleanup();
});
```

5. **Use meaningful test descriptions:**

```typescript
// ✅ Good
it('should show error message when login fails', () => {});

// ❌ Bad
it('test 1', () => {});
```

### DON'T ❌

1. Don't test implementation details
2. Don't test third-party libraries
3. Don't write tests that depend on execution order
4. Don't use `setTimeout` - use `waitFor`
5. Don't test everything - focus on critical paths

## Snapshot Testing

```typescript
import { render } from '@testing-library/react';
import Component from '../Component';

it('should match snapshot', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});
```

**Update snapshots:**

```bash
npm test -- -u
```

## Code Coverage

### View Coverage

```bash
npm test -- --coverage
```

**Coverage report location:**

- Console: Terminal output
- HTML: `coverage/lcov-report/index.html`
- LCOV: `coverage/lcov.info`

### Ignore Files from Coverage

```json
// package.json
{
	"jest": {
		"coveragePathIgnorePatterns": [
			"/node_modules/",
			"/src/test-utils/",
			"/src/setupTests.ts"
		]
	}
}
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '16.x'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Debugging Tests

### Run Tests in VS Code

1. Install "Jest" extension
2. Set breakpoints
3. Click "Debug" above test
4. Or press F5

### Debug with Chrome DevTools

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome.

### Verbose Output

```bash
npm test -- --verbose
```

## Testing Checklist

For each feature:

- [ ] Unit tests for utilities/helpers
- [ ] Component render tests
- [ ] User interaction tests
- [ ] Error state tests
- [ ] Loading state tests
- [ ] Edge case tests
- [ ] Integration tests for critical flows
- [ ] Accessibility tests
- [ ] Coverage > 80%

---

**Related Documentation:**

- [Development Guide](./development-guide.md)
- [Component Guide](./component-guide.md)
- [API Integration](./api-integration.md)
