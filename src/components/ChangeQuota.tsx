import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { changeQuota } from '../api/api';
import { IGetUser } from '../types/types';
import { convertToBytes, formatBytes } from '../utils/utils';

export interface ChangeQuotaProps {
	id: IGetUser['id'];
	quota: number;
}

export const ChangeQuota = ({ id, quota }: ChangeQuotaProps) => {
	const currentQuota = +formatBytes(quota, 2);
	const [newQuota, setNewQuota] = useState(currentQuota);
	const [expanded, setExpanded] = useState(false);

	const queryClient = useQueryClient();

	const changeQuotaMutation = useMutation({
		mutationFn: changeQuota,
		onSuccess: () => {
			toast.success('Quota changed successfully.');
			queryClient.invalidateQueries({
				queryKey: ['getUser', id],
				refetchType: 'active',
			});
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		changeQuotaMutation.mutate({ id, quota: convertToBytes(newQuota) });
	};
	const handleCancel = () => {
		setNewQuota(currentQuota);
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
					<Typography fontWeight={600}>Change User Quota</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Please set a new quota for the user
					</Typography>

					<form onSubmit={handleSubmit}>
						<TextField
							data-testid="textField-new-quota"
							required
							fullWidth
							label="New Quota (GB)"
							type="number"
							value={newQuota}
							onChange={(event) => setNewQuota(+event.target.value)}
							InputProps={{
								inputProps: { min: 0 },
								endAdornment: (
									<InputAdornment position="end">GB</InputAdornment>
								),
							}}
						/>
						<Stack spacing={2} direction="row" sx={{ mt: 2 }}>
							<Button
								data-testid="button-new-quota-cancel"
								disabled={changeQuotaMutation.isPending}
								variant="outlined"
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button
								data-testid="button-change-new-quota"
								disabled={changeQuotaMutation.isPending}
								type="submit"
								variant="contained"
							>
								Change User Quota
							</Button>
						</Stack>
					</form>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
