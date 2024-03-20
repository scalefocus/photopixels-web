import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changeRegistration, getStatus } from 'api/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const options = ['enabled', 'disabled'];

export const ServerStatus = () => {
	const statusQuery = useQuery({ queryKey: ['status'], queryFn: getStatus });
	const serverStatus = Boolean(statusQuery.data?.registration);
	const [value, setValue] = useState(serverStatus);
	const [expanded, setExpanded] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		setValue(serverStatus);
	}, [serverStatus]);

	const changeRegistrationMutation = useMutation({
		mutationFn: changeRegistration,
		onSuccess: () => {
			toast.success('Server status changed successfully.');
			queryClient.invalidateQueries({
				queryKey: ['status'],
			});
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleSubmit = () => {
		changeRegistrationMutation.mutate({ value });
	};

	const handleCancel = () => {
		setValue(serverStatus);
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
					<Typography fontWeight={600}>Change Server Status</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" display="inline">
						Current server status:
					</Typography>
					<Typography
						color={serverStatus ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
						sx={{ mb: 2 }}
						display="inline"
						fontWeight={600}
					>
						{` new registrations ${options[serverStatus ? 0 : 1]}`}
					</Typography>

					<Typography color="text.secondary" sx={{ mb: 1, mt: 2 }}>
						Please change the server status below
					</Typography>
					<RadioGroup
						row
						value={value}
						onChange={() => setValue((value) => !value)}
					>
						{options.map((item) => (
							<FormControlLabel
								key={item}
								value={item === options[0] ? true : false}
								control={<Radio />}
								label={item}
							/>
						))}
					</RadioGroup>
					<Stack spacing={2} direction="row" sx={{ mt: 2 }}>
						<Button
							disabled={changeRegistrationMutation.isPending}
							variant="outlined"
							sx={{ mt: 2 }}
							onClick={handleCancel}
						>
							Cancel
						</Button>
						<Button
							disabled={changeRegistrationMutation.isPending}
							variant="contained"
							sx={{ mt: 2 }}
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</Stack>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
