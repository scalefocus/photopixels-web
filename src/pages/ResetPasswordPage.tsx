import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
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
import { useNavigate } from 'react-router-dom';
import { isEmail, isValidPassword } from 'utils/validate';

import { resetPassword } from '../api/api';
import AppIcon from '../assets/AppIcon.png';
import { storage } from '../utils/utils';

export default function ResetPasswordPage() {
	const [state, setState] = useState({
		code: '',
		password: '',
		showPassword: false,
		confirmPassword: '',
		showConfirmPassword: false,
	});
	const navigate = useNavigate();

	const loginMutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			toast.success('Your password changed. Please login.');
			navigate('/');
		},
		onError: () => toast.error('Something went wrong'),
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const email = storage.getEmail();
		const { code, password, confirmPassword } = state;

		if (!code) {
			return toast.error('Code is required.');
		}

		if (!email || !isEmail(email)) {
			return toast.error('Please provide a valid email address.');
		}

		if (!isValidPassword(password)) {
			return toast.error(
				'Password is required and must be at least 8 characters with at least one lowercase, one uppercase, and one non alphanumeric character.'
			);
		}

		if (password !== confirmPassword) {
			return toast.error('The password does not match the confirmed password.');
		}

		loginMutation.mutate({ code, email, password });
	};

	const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setState((prevState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));

	const handleOnClick = (key: keyof typeof state) =>
		setState((prevState) => ({ ...prevState, [key]: !prevState[key] }));

	const { code, password, showPassword, confirmPassword, showConfirmPassword } =
		state;

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

				<Typography color="text.secondary" sx={{ mb: 2 }}>
					Please enter the verification code that was sent to your email addres
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						name="code"
						variant="outlined"
						margin="normal"
						fullWidth
						label="Verification Code"
						type="text"
						value={code}
						onChange={handleOnChange}
					/>

					<TextField
						name="password"
						variant="outlined"
						margin="normal"
						fullWidth
						label="New Password"
						type={showPassword ? 'text' : 'password'}
						value={password}
						onChange={handleOnChange}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() => handleOnClick('showPassword')}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<TextField
						name="confirmPassword"
						variant="outlined"
						margin="normal"
						fullWidth
						label="Confirm New Password"
						type={showConfirmPassword ? 'text' : 'password'}
						value={confirmPassword}
						onChange={handleOnChange}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={() => handleOnClick('showConfirmPassword')}
										edge="end"
									>
										{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<Button
						disabled={
							loginMutation.isPending ||
							!code ||
							!isValidPassword(password) ||
							!isValidPassword(confirmPassword)
						}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 2, mb: 2 }}
					>
						{loginMutation.isPending ? 'Sending...' : 'Submit'}
					</Button>
				</form>
			</Box>
		</Container>
	);
}
