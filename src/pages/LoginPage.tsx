import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
	Alert,
	Box,
	Button,
	Container,
	IconButton,
	InputAdornment,
	TextField,
	Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import { isEmail, isValidPassword } from 'utils/validate';

import { getStatus, login } from '../api/api';
import AppIcon from '../assets/AppIcon.png';
import { storage } from '../utils/utils';

export default function LoginPage() {
	const [state, setState] = useState({
		email: '',
		password: '',
		showPassword: false,
	});
	const navigate = useNavigate();

	const statusQuery = useQuery({ queryKey: ['status'], queryFn: getStatus });
	const noRegistration = !statusQuery.data?.registration;

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			storage.setToken(data.accessToken);
			storage.setRefreshToken(data.refreshToken);
			storage.setExpiration(data.expiresIn);
			storage.setRefreshExpiration();
			navigate('/');
		},
		onError: () => {
			toast.error(`Wrong email or password!`);
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { email, password } = state;

		if (!isEmail(email)) {
			return toast.error('Please provide a valid email address.');
		}

		if (!isValidPassword(password)) {
			return toast.error(
				'Password is required and must be at least 8 characters with at least one lowercase, one uppercase, and one non alphanumeric character.'
			);
		}

		loginMutation.mutate({ email, password });
	};

	const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setState((prevState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));

	const { email, password, showPassword } = state;

	return (
		<Container component="main" maxWidth="xs">
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				sx={{ minHeight: '100vh' }}
			>
				<Box sx={{ mb: 2 }}>
					<img src={AppIcon} height={100} alt="Logo" />
				</Box>

				<Typography variant="h5" fontWeight={700}>
					Sign in
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						name="email"
						variant="outlined"
						margin="normal"
						fullWidth
						label="Email Address"
						type="email"
						autoComplete="email"
						autoFocus
						value={email}
						onChange={handleOnChange}
					/>

					<TextField
						name="password"
						variant="outlined"
						margin="normal"
						fullWidth
						label="Password"
						type={showPassword ? 'text' : 'password'}
						autoComplete="current-password"
						value={password}
						onChange={handleOnChange}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() =>
											setState((prevState) => ({
												...prevState,
												showPassword: !prevState.showPassword,
											}))
										}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<NavLink to="/forgot-password">
						<Typography
							align="right"
							color="primary"
							fontSize={14}
							fontWeight={600}
						>
							Forgot Password?
						</Typography>
					</NavLink>

					<Button
						disabled={
							loginMutation.isPending ||
							!isValidPassword(password) ||
							!isEmail(email)
						}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 2, mb: 2 }}
					>
						Sign In
					</Button>

					{!noRegistration && (
						<NavLink to="/register">
							<Box sx={{ display: 'flex', justifyContent: 'center' }}>
								<Typography
									align="center"
									color="text.secondary"
									fontSize={14}
									display="inline"
								>
									Don&apos;t have an account?&nbsp;
								</Typography>
								<Typography
									align="center"
									color="primary"
									fontSize={14}
									fontWeight={600}
								>
									Sign Up
								</Typography>
							</Box>
						</NavLink>
					)}
				</form>
				{!statusQuery.isLoading && noRegistration && (
					<Alert sx={{ my: 2 }} severity="warning">
						New registrations have been disabled on this server!
					</Alert>
				)}
			</Box>
		</Container>
	);
}
