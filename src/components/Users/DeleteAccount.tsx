import DeleteIcon from '@mui/icons-material/Delete';
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
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { deleteAccount } from '../../api/api';

export const DeleteAccount = () => {
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const deleteAccountMutation = useMutation({
		mutationFn: deleteAccount,
		onSuccess: () => {
			toast.success('Account Deleted.');
			navigate('/login');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		deleteAccountMutation.mutate({ password });
	};

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
			<Accordion sx={{ boxShadow: 'none' }}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight={600}>Delete your account</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Please enter your password to delete your account
					</Typography>

					<form onSubmit={handleSubmit}>
						<TextField
							required
							fullWidth
							label="Password"
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label="toggle password visibility"
											onClick={handleClickShowPassword}
											edge="end"
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						<Button
							disabled={deleteAccountMutation.isPending}
							type="submit"
							variant="contained"
							color="error"
							sx={{ mt: 2 }}
							startIcon={<DeleteIcon />}
						>
							Delete Account
						</Button>
					</form>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
