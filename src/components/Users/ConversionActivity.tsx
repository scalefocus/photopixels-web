import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';

interface ConversionActivityProps {
	status?: 'idle' | 'processing' | 'paused' | 'completed';
	userNumberOfFilesToConvert?: number;
	userNumberOfPreviewFiles?: number;
	progress?: number;
	onPause?: () => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export const ConversionActivity = ({
	status = 'idle',
	userNumberOfFilesToConvert = 0,
	userNumberOfPreviewFiles = 0,
	progress = 0,
	onPause,
	onCancel,
	isLoading = false,
}: ConversionActivityProps) => {
	const isPaused = status === 'paused';
	const isProcessing = status === 'processing';
	const isCompleted = status === 'completed';

	const getStatusLabel = () => {
		if (isProcessing) return 'Processing';
		``;
		if (isPaused) return 'Paused';
		if (isCompleted) return 'Completed';
		return 'Idle';
	};

	const getStatusColor = () => {
		if (isCompleted) return 'success.main';
		if (isPaused) return 'warning.main';
		return 'text.secondary';
	};

	return (
		<Box sx={{ pt: 3, pb: 3, borderBottom: '1px solid rgb(0, 0, 0, 0.12)' }}>
			<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
				Conversation Activity
			</Typography>

			<Typography variant="body2" sx={{ mb: 0.5 }}>
				<Typography component="span" fontWeight={600}>
					Status:{' '}
				</Typography>
				<Typography component="span" color={getStatusColor()}>
					{getStatusLabel()}
				</Typography>
			</Typography>
			{isProcessing && (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{userNumberOfPreviewFiles} out of {userNumberOfFilesToConvert} video
					{userNumberOfFilesToConvert !== 1 ? 's are ' : 'is '} in queue
				</Typography>
			)}

			{isCompleted && (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Processed {userNumberOfPreviewFiles} video file
					{userNumberOfPreviewFiles !== 1 ? 's ' : ' '}
				</Typography>
			)}

			{(isCompleted || isProcessing) && (
				<Box sx={{ mb: 2 }}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							mb: 1,
						}}
					>
						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{
								flex: 1,
								height: 8,
								borderRadius: 4,
								backgroundColor: 'rgba(0, 0, 0, 0.12)',
								'& .MuiLinearProgress-bar': {
									borderRadius: 4,
									backgroundColor: 'primary.main',
								},
							}}
						/>
						<Typography
							variant="body2"
							fontWeight={600}
							sx={{ ml: 2, minWidth: '45px' }}
						>
							{progress}%
						</Typography>
					</Box>
				</Box>
			)}
			<Stack direction="row" spacing={2}>
				{false && (<Button
					variant="outlined"
					onClick={onPause}
					disabled={!isProcessing || isLoading}
				>
					{isPaused ? 'Resume' : 'Pause'}
				</Button>
				)}
				{isProcessing && (<Button
					variant="outlined"
					color="error"
					onClick={onCancel}
					//disabled={(!isProcessing && !isPaused) || isLoading}
				>
					Cancel
				</Button>
				)}
			</Stack>
		</Box>
	);
};
