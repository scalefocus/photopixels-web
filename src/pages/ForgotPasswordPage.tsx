import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import { storage } from 'utils/utils';
import { isEmail } from 'utils/validate';

import { forgotPassword } from '../api/api';
import AppIcon from '../assets/AppIcon.png';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');

	const navigate = useNavigate();

	const forgotPasswordMutation = useMutation({
		mutationFn: forgotPassword,
		onSuccess: () => {
			storage.setEmail(email);
			toast.success('Password reset code sent to your email.');
			navigate('/reset-password');
		},
		onError: () => toast.error('Something went wrong!'),
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		forgotPasswordMutation.mutate({ email });
	};

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
					Please enter your email address
				</Typography>
				<form onSubmit={handleSubmit}>
					<TextField
						variant="outlined"
						margin="normal"
						fullWidth
						label="Email Address"
						type="email"
						autoComplete="email"
						autoFocus
						value={email}
						sx={{ width: '396px' }}
						onChange={(event) => setEmail(event.target.value)}
					/>

					<Button
						disabled={forgotPasswordMutation.isPending || !isEmail(email)}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 2, mb: 2 }}
					>
						{forgotPasswordMutation.isPending ? 'Sending...' : 'Submit'}
					</Button>
				</form>
				<NavLink to="/login">
					<Typography
						align="center"
						color="primary"
						fontSize={14}
						fontWeight={600}
					>
						Back to Login Page
					</Typography>
				</NavLink>
			</Box>
		</Container>
	);
}
