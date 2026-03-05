import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	Stack,
	Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteVideoConversationFiles, GetVideoPreviewFilesSize } from 'api/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const VideoPreviewFilesSize = () => {
	const statusQuery = useQuery({ queryKey: ['size'], queryFn: GetVideoPreviewFilesSize });
	const userSize = Number(statusQuery.data?.size);
	const userQuota = Number(statusQuery.data?.quota);
	const userUsedQuota = Number(statusQuery.data?.usedQuota);
	const userNumberOfFilesToConvert = Number(statusQuery.data?.numberOfFilesToConvert);
	const userNumberOfPreviewFiles = Number(statusQuery.data?.numberOfPreviewFiles);
	const [sizeValue, setSizeValue] = useState(userSize);
	const [quotaValue, setQuotaValue] = useState(userQuota);
	const [usedQuotaValue, setUsedQuotaValue] = useState(userUsedQuota);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [numberOfFilesToConvertValue, setNumberOfFilesToConvertValue] = useState(userNumberOfFilesToConvert);
	const [numberOfPreviewFilesValue, setNumberOfPreviewFilesValue] = useState(userNumberOfPreviewFiles);

	const [expanded, setExpanded] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		setSizeValue(userSize);
		setQuotaValue(userQuota);
		setUsedQuotaValue(userUsedQuota);
		setNumberOfFilesToConvertValue(userNumberOfFilesToConvert);
		setNumberOfPreviewFilesValue(userNumberOfPreviewFiles);
	}, [userSize, userQuota, userUsedQuota, userNumberOfFilesToConvert, userNumberOfPreviewFiles]);

	const DeletePreviewFilesMutation = useMutation({
		mutationFn: DeleteVideoConversationFiles,
		onSuccess: () => {
			toast.success('Video preview files size deleted successfully.');
			queryClient.invalidateQueries({
				queryKey: ['size'],
			});
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const handleSubmit = () => {
		setOpenDeleteDialog(false);
		DeletePreviewFilesMutation.mutate();
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
					<Typography fontWeight={600}>Delete user preview files</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Current user status:
					</Typography>
					<Stack spacing={1.5} sx={{ mb: 2 }}>
						<Box>
							<Typography color="text.secondary" display="inline">
								Quota:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(quotaValue) ? '--' : `${(quotaValue / (1024 * 1024)).toFixed(2)} MB`}
							</Typography>
						</Box>
						<Box>
							<Typography color="text.secondary" display="inline">
								Used quota:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(usedQuotaValue) ? '--' : `${(usedQuotaValue / (1024 * 1024)).toFixed(2)} MB`}
							</Typography>
						</Box>
						<Box>
							<Typography color="text.secondary" display="inline">
								Video preview files size:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(sizeValue) ? '--' : `${(sizeValue / (1024 * 1024)).toFixed(2)} MB`}
							</Typography>
						</Box>
						<Box>
							<Typography color="text.secondary" display="inline">
								Number of preview files:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(numberOfPreviewFilesValue) ? '--' : numberOfPreviewFilesValue}
							</Typography>
						</Box>
						<Box>
							<Typography color="text.secondary" display="inline">
								Total number of files to convert:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(numberOfFilesToConvertValue) ? '--' : numberOfFilesToConvertValue}
							</Typography>
						</Box>
						<Box>
							<Typography color="text.secondary" display="inline">
								Persetage of converted files:{' '}
							</Typography>
							<Typography display="inline" fontWeight={600}>
								{isNaN(numberOfFilesToConvertValue) || numberOfFilesToConvertValue === 0
									? '--'
									: `${((numberOfPreviewFilesValue / numberOfFilesToConvertValue) * 100).toFixed(2)}%`}
							</Typography>
						</Box>
					</Stack>
					<Stack spacing={2} direction="row" sx={{ mt: 2 }}>
						<Button
							disabled={DeletePreviewFilesMutation.isPending}
							variant="contained"
							color="error"
							sx={{ mt: 2 }}
							startIcon={<DeleteIcon />}
							onClick={() => setOpenDeleteDialog(true)}
						>
							Delete preview files
						</Button>
					</Stack>
					<Dialog
                            open={openDeleteDialog}
                            onClose={() => setOpenDeleteDialog(false)}
                            aria-labelledby="delete-dialog-title"
                            aria-describedby="delete-dialog-description"
                        >
                            <DialogTitle
                                id="delete-dialog-title"
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <DeleteIcon color="error" sx={{ fontSize: 32 }} />
                                Confirm deletion?
                            </DialogTitle>

                            <Typography id="delete-dialog-description" sx={{ px: 3, pb: 1, color: 'text.secondary' }}>
                                Warning: This action will delete all video preview files.
                            </Typography>

                            <DialogActions>
                                <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    color="error"
                                    variant="contained"
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
