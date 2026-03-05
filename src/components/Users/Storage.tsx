import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';

interface StorageProps {
	userSize?: number;
	userUsedQuota: number;
	quotaTotal?: number;
	userSizeOfFilesToConvert?: number;
	onClearTemporaryFiles?: () => void;
	toDeletePreviewFiles?: boolean;
}

const formatBytes = (bytes: number): string => {
	if (isNaN(bytes)) return '--';

	const units = ['B', 'KB', 'MB', 'GB'];
	let size = Math.abs(bytes);
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const Storage = ({
	userSize = 0,
	userUsedQuota,
	quotaTotal = 1,
	userSizeOfFilesToConvert = 0,
	onClearTemporaryFiles,
	toDeletePreviewFiles = false
}: StorageProps) => {
	const progress = quotaTotal > 0
				? parseInt(
						(userSize / quotaTotal) * 100 + '',
						10
				  )
				: 0

	return (
		<Box sx={{ pt: 3 }}>
			<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
				Storage
			</Typography>

			<Typography variant="body2" sx={{ mb: 1.5 }}>
				<Typography component="span" fontWeight={600}>
					Converted video usage:{' '}
				</Typography>
				<Typography component="span">
					{formatBytes(userSize)} of {formatBytes(quotaTotal)}
				</Typography>
			</Typography>

			<Box sx={{ mb: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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
								backgroundColor: 'primary.main'
							}
						}}
					/>
					<Typography variant="body2" fontWeight={600} sx={{ ml: 2, minWidth: '45px' }}>
						{progress}%
					</Typography>
				</Box>
			</Box>

			<Stack spacing={1} sx={{ mb: 2 }}>
				<Box>
					<Typography variant="body2" color="text.secondary" display="inline">
						Original Videos:{' '}
					</Typography>
					<Typography variant="body2" display="inline" fontWeight={600}>
						{formatBytes(userSizeOfFilesToConvert)}
					</Typography>
				</Box>
				<Box>
					<Typography variant="body2" color="text.secondary" display="inline">
						Converted Videos:{' '}
					</Typography>
					<Typography variant="body2" display="inline" fontWeight={600}>
						{formatBytes(userSize)}
					</Typography>
				</Box>
			</Stack>

			{false && toDeletePreviewFiles && (
				<Button
					variant="outlined"
					onClick={onClearTemporaryFiles}
					startIcon={
						<Typography component="span" sx={{ mr: 0.5 }}>
							🗑️
						</Typography>
					}
				>
					Clear temporary preview files
				</Button>
			)}

			{userUsedQuota > quotaTotal && (
				<Typography variant="body2" color="error.main">
					Warning: You have exceeded your storage quota.
				</Typography>
			)}
		</Box>
	);
};
