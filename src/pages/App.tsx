import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';
import { DashboardLayout } from '../layout/DashboardLayout';
import AdminSettingsPage from './AdminSettings';
import AddAlbumPage from './Albums/AddAlbumPage';
import AlbumsPage from './Albums/AlbumsPage';
import CreateUserPage from './CreateUserPage';
import EditUserPage from './EditUserPage';
import FavoritesPage from './FavoritesPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import LoginPage from './LoginPage';
import NotFound from './NotFound';
import OverviewPage from './OverviewPage';
import RegisterPage from './RegisterPage';
import ResetPasswordPage from './ResetPasswordPage';
import SettingsPage from './SettingsPage';
import TrashPage from './TrashPage';
import UsersPage from './UsersPage';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<DashboardLayout />}>
					<Route
						index
						element={
							<ProtectedRoute>
								<OverviewPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/settings"
						element={
							<ProtectedRoute>
								<SettingsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/users"
						element={
							<ProtectedRoute>
								<UsersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/create-user"
						element={
							<ProtectedRoute>
								<CreateUserPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/edit"
						element={
							<ProtectedRoute>
								<EditUserPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin-settings"
						element={
							<ProtectedRoute>
								<AdminSettingsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/trash"
						element={
							<ProtectedRoute>
								<TrashPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/favorites"
						element={
							<ProtectedRoute>
								<FavoritesPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/albums"
						element={
							<ProtectedRoute>
								<AlbumsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/albums/add"
						element={
							<ProtectedRoute>
								<AddAlbumPage />
							</ProtectedRoute>
						}
					/>
				</Route>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route path="/*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}
