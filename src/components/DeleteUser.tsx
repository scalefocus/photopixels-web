import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Stack,
	Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { deleteUser } from '../api/api';
import { IGetUser } from '../types/types';

export const DeleteUser = ({ id }: { id: IGetUser['id'] }) => {
	const [expanded, setExpanded] = useState(false);
	const navigate = useNavigate();

	const deleteUserMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			toast.success('Account Deleted.');
            navigate('/users');
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleDelete = () => {
		deleteUserMutation.mutate({ id });
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
			<Accordion
				defaultExpanded={false}
				expanded={expanded}
				onChange={() => setExpanded(!expanded)}
				sx={{ boxShadow: 'none' }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight={600}>Delete User</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Are you sure you want to delete this user account?{' '}
					</Typography>

					<Stack spacing={2} direction="row">
						<Button
							data-testid="button-delete-user-cancel"
							disabled={deleteUserMutation.isPending}
							type="submit"
							variant="outlined"
							sx={{ mt: 2 }}
							onClick={() => setExpanded(false)}
						>
							Cancel
						</Button>
						<Button
							data-testid="button-delete-user"							disabled={deleteUserMutation.isPending}
							type="submit"
							variant="contained"
							color="error"
							sx={{ mt: 2 }}
							onClick={handleDelete}
							startIcon={<DeleteIcon />}
						>
							Delete User
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
