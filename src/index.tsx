import './index.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/authContext';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';
import { theme } from './theme';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<App />
					<Toaster />
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	</React.StrictMode>
);

reportWebVitals();
