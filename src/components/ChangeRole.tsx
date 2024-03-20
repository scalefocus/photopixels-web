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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { changeRole } from '../api/api';
import { USER_ROLES_OPTIONS } from '../constants/constants';
import { IGetUser } from '../types/types';
import { SelectRole } from './SelectRole';

export interface ChangeRoleProps {
	id: IGetUser['id'];
	role: keyof typeof USER_ROLES_OPTIONS;
}

export const ChangeRole = ({ id, role }: ChangeRoleProps) => {
	const [newRole, setNewRole] = useState(role);
	const [expanded, setExpanded] = useState(false);
	const queryClient = useQueryClient();

	const changeRoleMutation = useMutation({
		mutationFn: changeRole,
		onSuccess: () => {
			toast.success('User role changed successfully.');
			queryClient.invalidateQueries({
				queryKey: ['getUser', id],
			});
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleSubmit = () => {
		changeRoleMutation.mutate({ id, role: newRole });
	};
	const handleCancel = () => {
		setNewRole(role);
		setExpanded(false);
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
					<Typography fontWeight={600}>Change User Role</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 1 }}>
						Please set a new role for the user
					</Typography>
					<SelectRole role={newRole} setRole={setNewRole} />
					<Stack spacing={2} direction="row" sx={{ mt: 2 }}>
						<Button
							disabled={changeRoleMutation.isPending}
							variant="outlined"
							sx={{ mt: 2 }}
							onClick={handleCancel}
						>
							Cancel
						</Button>
						<Button
							disabled={changeRoleMutation.isPending}
							variant="contained"
							sx={{ mt: 2 }}
							onClick={handleSubmit}
						>
							Change User Role
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
