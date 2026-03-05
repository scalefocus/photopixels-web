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
	DialogContent,
	DialogTitle,
	Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	DeleteVideoConversationFiles,
	GetVideoPreviewFilesSize,
} from 'api/api';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { ConversionActivity } from './ConversionActivity';
import { Storage } from './Storage';
import { VideoCompatibility, VideoCompatibilityRef } from './VideoCompatibility';

export const VideoConversionSettings = () => {
	const videoCompatibilityRef = useRef<VideoCompatibilityRef>(null);
	const statusQuery = useQuery({
		queryKey: ['size'],
		queryFn: GetVideoPreviewFilesSize,
	});
	const queryClient = useQueryClient();
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [isConversionEnabled, setIsConversionEnabled] = useState(false);

	// Extract data from query
	const data = statusQuery.data;
	const userSize = Number(data?.size) || 0;
	const userQuota = Number(data?.quota) || 0;
	const userUsedQuota = Number(data?.usedQuota) || 0;
	const userNumberOfFilesToConvert = Number(data?.numberOfFilesToConvert) || 0;
	const userNumberOfPreviewFiles = Number(data?.numberOfPreviewFiles) || 0;
	const userSizeOfFilesToConvert = Number(data?.sizeOfFilesToConvert) || 0;
	const toDeletePreviewFiles = Boolean(data?.toDeletePreviewFiles);

	const DeletePreviewFilesMutation = useMutation({
		mutationFn: DeleteVideoConversationFiles,
		onSuccess: () => {
			toast.success('Video preview files deleted successfully.');
			setOpenDeleteDialog(false);
			queryClient.invalidateQueries({
				queryKey: ['size'],
			});
		},
		onError: (error) => {
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	// useEffect(() => {
	// 	queryClient.invalidateQueries({
	// 		queryKey: ['size'],
	// 	});
	// }, [isConversionEnabled]);

	const handleDeleteConfirm = () => {
		DeletePreviewFilesMutation.mutate();
	};

	const handleClearTemporaryFiles = () => {
		setOpenDeleteDialog(true);
	};

	const getConversionStatus = () => {
		if (!isConversionEnabled) {
			return 'idle' as const;
		} else if (userNumberOfFilesToConvert === userNumberOfPreviewFiles) {
			return 'completed' as const;
		} else {
			return 'processing' as const;
		}
	};

	// Mock conversion activity data (would come from API in production)
	const conversionActivityData = {
		status: getConversionStatus(),
		userNumberOfFilesToConvert: userNumberOfFilesToConvert,
		userNumberOfPreviewFiles: userNumberOfPreviewFiles,
		progress:
			userNumberOfFilesToConvert > 0
				? parseInt(
						(userNumberOfPreviewFiles / userNumberOfFilesToConvert) * 100 + '',
						10
				  )
				: 0
	};

	return (
		<Box
			sx={{
				p: 3,
				border: '1px solid rgb(0, 0, 0, 0.12)',
				borderRadius: '8px',
				maxWidth: '1100px',
				mt: 3,
				backgroundColor: '#fff',
			}}
		>
			<Accordion sx={{ boxShadow: 'none' }}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight={600}>Video Compatibility</Typography>
				</AccordionSummary>
				<AccordionDetails>
					{/* Top Section: Video Compatibility */}
					<VideoCompatibility
						ref={videoCompatibilityRef}
						onConversionStatusChange={(isEnabled) =>
							setIsConversionEnabled(isEnabled)
						}
					/>

					{/* Bottom Section: Two columns */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
							gap: 3,
							mt: 3,
						}}
					>
						{/* Left Column: Conversion Activity */}
						<Box>
							<ConversionActivity
								status={conversionActivityData.status}
								userNumberOfFilesToConvert={conversionActivityData.userNumberOfFilesToConvert}
								userNumberOfPreviewFiles={conversionActivityData.userNumberOfPreviewFiles}
								progress={conversionActivityData.progress}
								isLoading={statusQuery.isLoading}
								onPause={() => {
									toast.success('Pause functionality coming soon');
								}}
								onCancel={() => {
									videoCompatibilityRef.current?.triggerDisableConfirmation();
								}}
							/>
						</Box>

						{/* Right Column: Storage */}
						<Box>
							<Storage
								userSize={userSize}
								userUsedQuota={userUsedQuota}
								quotaTotal={userQuota}
								userSizeOfFilesToConvert={userSizeOfFilesToConvert}
								onClearTemporaryFiles={handleClearTemporaryFiles}
								toDeletePreviewFiles={toDeletePreviewFiles}	
							/>
						</Box>
					</Box>

					{/* Delete Confirmation Dialog */}
					{/* Neznam dali treba */}
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

						<DialogContent>
							<Typography id="delete-dialog-description" color="text.secondary">
								Warning: This action will delete all video preview files.
							</Typography>
						</DialogContent>

						<DialogActions>
							<Button
								onClick={() => setOpenDeleteDialog(false)}
								variant="outlined"
								disabled={DeletePreviewFilesMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								onClick={handleDeleteConfirm}
								color="error"
								variant="contained"
								disabled={DeletePreviewFilesMutation.isPending}
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
