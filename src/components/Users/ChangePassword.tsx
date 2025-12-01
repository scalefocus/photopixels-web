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
	TextField,
	Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from 'api/api';
import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';

const initialState = {
	oldPassword: '',
	showOldPassword: false,
	newPassword: '',
	showNewPassword: false,
	confirmPassword: '',
	showConfirmPassword: false,
};

export const ChangePassword = () => {
	const [state, setState] = useState(initialState);

	const changePasswordMutation = useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			toast.success('Password changed successfully.');
			setState(initialState);
		},
		onError: (error) => toast.error(`Something went wrong: ${error.message}`),
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { oldPassword, newPassword, confirmPassword } = state;

		if (!newPassword || !oldPassword || !confirmPassword) {
			toast.error('All fields are required.');
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('The new password does not match the confirmed password.');
			return;
		}

		changePasswordMutation.mutate({ oldPassword, newPassword });
	};

	const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		setState((prevState) => ({
			...prevState,
			[event.target.name]: event.target.value,
		}));

	const handleOnClick = (key: keyof typeof initialState) =>
		setState((prevState) => ({ ...prevState, [key]: !prevState[key] }));

	const {
		oldPassword,
		showOldPassword,
		newPassword,
		showNewPassword,
		confirmPassword,
		showConfirmPassword,
	} = state;

	return (
		<Box
			sx={{
				p: 2,
				border: '1px  solid rgb(0, 0, 0, 0.12)',
				borderRadius: '10px',
				maxWidth: '700px',
			}}
		>
			<Accordion sx={{ boxShadow: 'none' }}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight={600}>Change your password</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Box sx={{ width: '100%' }}>
						<form onSubmit={handleSubmit}>
							<TextField
								name="oldPassword"
								margin="normal"
								required
								fullWidth
								label="Current Password"
								type={showOldPassword ? 'text' : 'password'}
								value={oldPassword}
								onChange={handleOnChange}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={() => handleOnClick('showOldPassword')}
												edge="end"
											>
												{showOldPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								name="newPassword"
								margin="normal"
								required
								fullWidth
								label="New Password"
								type={showNewPassword ? 'text' : 'password'}
								value={newPassword}
								onChange={handleOnChange}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={() => handleOnClick('showNewPassword')}
												edge="end"
											>
												{showNewPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								name="confirmPassword"
								margin="normal"
								required
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
												{showConfirmPassword ? (
													<VisibilityOff />
												) : (
													<Visibility />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							<Button
								type="submit"
								variant="contained"
								color="primary"
								sx={{ mt: 2 }}
							>
								Change Password
							</Button>
						</form>
					</Box>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
