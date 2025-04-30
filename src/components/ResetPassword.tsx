import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { adminResetPassword } from '../api/api';
import { IGetUser } from '../types/types';

const initialState = {
	password: '',
	confirmPassword: '',
	showPassword: false,
};

export const ResetPassword = ({ email }: { email: IGetUser['email'] }) => {
	const [expanded, setExpanded] = useState(false);
	const [state, setState] = useState(initialState);

	const resetPasswordMutation = useMutation({
		mutationFn: adminResetPassword,
		onSuccess: () => {
			toast.success('Password changed successfully.');
			setState(initialState);
		},
		onError: (error) => toast.error(`Something went wrong: ${error.message}`),
	});

	const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setState((prevState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));

	const handleOnClick = (key: keyof typeof initialState) =>
		setState((prevState) => ({ ...prevState, [key]: !prevState[key] }));

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { password, confirmPassword } = state;

		if (!password || !confirmPassword) {
			toast.error('All fields are required.');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('The new password does not match the confirmed password.');
			return;
		}

		resetPasswordMutation.mutate({ password, email });
	};
	const { password, confirmPassword, showPassword } = state;

	return (
		<Box
			sx={{
				p: 2,
				border: '1px  solid rgb(0, 0, 0, 0.12)',
				borderRadius: '10px',
				maxWidth: '700px',
				mt: 4,
			}}
		>
			<Accordion
				defaultExpanded={false}
				expanded={expanded}
				onChange={() => setExpanded(!expanded)}
				sx={{ boxShadow: 'none' }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight={600}>Reset Password</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Please set a new password for this user? The user will get an email
						notification.
					</Typography>
					<form onSubmit={handleSubmit}>
						<TextField
							data-testid="textField-new-password"
							name="password"
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
							data-testid="textField-confirm-new-password"
							name="confirmPassword"
							margin="normal"
							fullWidth
							label="Confirm New Password"
							type={showPassword ? 'text' : 'password'}
							value={confirmPassword}
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
						<Stack spacing={2} direction="row" sx={{ mt: 2 }}>
							<Button
								data-testid="button-reset-password-cancel"
								disabled={resetPasswordMutation.isPending}
								type="submit"
								variant="outlined"
								sx={{ mt: 2 }}
								onClick={(event) => {
									event.preventDefault();
									setExpanded(false);
									setState(initialState);
								}}
							>
								Cancel
							</Button>
							<Button
								data-testid="button-reset-password"
								disabled={resetPasswordMutation.isPending}
								type="submit"
								variant="contained"
								sx={{ mt: 2 }}
							>
								Reset Password
							</Button>
						</Stack>
					</form>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
