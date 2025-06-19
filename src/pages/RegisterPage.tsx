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
import { useMutation } from '@tanstack/react-query';
import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import { isEmail, isValidPassword } from 'utils/validate';

import { register } from '../api/api';
import AppIcon from '../assets/AppIcon.png';
import { IRegistrationError } from '../types/types';

const initialUserData = {
	name: '',
	email: '',
	password: '',
	showPassword: false,
};

export default function RegisterPage() {
	const [userData, setUserData] = useState(initialUserData);
	const [error, setError] = useState<Array<string> | null>(null);

	const navigate = useNavigate();

	const registerMutation = useMutation({
		mutationFn: register,
		onSuccess: () =>
			navigate('/login', {
				state: {
					showMessage: true,
					message: 'Registrations is successful, please login.',
				},
			}),
		onError: (err: IRegistrationError) => {
			const { errors } = err.response.data;
			setError(Object.values(errors));
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { name, email, password } = userData;

		if (!name) {
			return toast.error('Name is required.');
		}

		if (!isEmail(email)) {
			return toast.error('Please provide a valid email address.');
		}

		if (!isValidPassword(password)) {
			return toast.error(
				'Password is required and must be at least 8 characters with at least one lowercase, one uppercase, and one non alphanumeric character.'
			);
		}

		registerMutation.mutate({ name, email, password });
	};

	const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setUserData((prevState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));

	const { name, email, password, showPassword } = userData;

	return (
		<Container component="main" maxWidth="xs">
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				style={{ minHeight: '100vh' }}
			>
				<Box sx={{ mb: 2 }}>
					<img src={AppIcon} height={100} alt="Logo" />
				</Box>

				<Typography variant="h5" fontWeight={700}>
					Sign Up
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						name="name"
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="name"
						label="Username"
						type="text"
						autoFocus
						value={name}
						onChange={handleOnChange}
					/>
					<TextField
						name="email"
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						type="email"
						label="Email Address"
						value={email}
						onChange={handleOnChange}
					/>
					<TextField
						name="password"
						variant="outlined"
						margin="normal"
						required
						fullWidth
						label="Password"
						type={showPassword ? 'text' : 'password'}
						id="password"
						value={password}
						onChange={handleOnChange}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() =>
											setUserData((prevState) => ({
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
						helperText="Passwords must be at least 8 characters with at least one lowercase, one uppercase, and one non alphanumeric character.
						"
					/>
					<Button
						disabled={
							registerMutation.isPending ||
							!name ||
							!isEmail(email) ||
							!isValidPassword(password)
						}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 2, mb: 2 }}
					>
						Sign Up
					</Button>
					{registerMutation.isError && (
						<Alert icon={false} sx={{ my: 2 }} severity="error">
							{error?.map((e: string, index: number) => (
								<li key={index}>{e}</li>
							))}{' '}
						</Alert>
					)}

					<NavLink to="/login">
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Typography
								color="text.secondary"
								fontSize={14}
								align="center"
								display="inline"
							>
								Already have an account? &nbsp;
							</Typography>
							<Typography
								align="center"
								color="primary"
								fontSize={14}
								fontWeight={600}
							>
								Login
							</Typography>
						</Box>
					</NavLink>
				</form>
			</Box>
		</Container>
	);
}
