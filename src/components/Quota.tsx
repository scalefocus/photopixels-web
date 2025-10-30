import {
	Box,
	LinearProgress,
	linearProgressClasses,
	Skeleton,
	Stack,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AuthContext from 'context/authContext';
import { useContext } from 'react';

import {  formatUsedQuotaInGB } from '../utils/utils';

export const Quota = () => {
	const { user } = useContext(AuthContext);
	const quota = user?.quota || 0;
	const usedQuota = user?.usedQuota || 0;

	const percentage = (usedQuota / quota) * 100;
	const displayedUsedQuota = percentage > 0 ? Math.max(0.1, Math.round(percentage * 10) / 10).toFixed(1) : "0.0";

	const BorderLinearProgress = styled(LinearProgress)(() => ({
		height: 8,
		borderRadius: 4,
		[`&.${linearProgressClasses.colorPrimary}`]: {
			backgroundColor: 'rgb(0, 0, 0, 0.12)',
		},
		[`& .${linearProgressClasses.bar}`]: {
			borderRadius: 5,
			backgroundColor: '#47CD89',
		},
	}));

	return (
		<>
			{user ? (
				<Box
					sx={{
						py: { xs: 1, sm: 4 },
						px: { xs: 2, sm: 4 },
						border: '1px  solid rgb(0, 0, 0, 0.12)',
						borderRadius: '10px',
						height: { xs: '180px', sm: '210px' },
						width: '100%',
						maxWidth: '100%',
					}}
				>
					<Stack
						alignItems="flex-start"
						direction="row"
						justifyContent="space-between"
						spacing={3}
					>
						<Stack spacing={1}>
							<Typography
								color="text.secondary"
								gutterBottom
								sx={{ fontWeight: 600 }}
							>
								Quota
							</Typography>
							<Typography color="text.primary" fontWeight="600" variant="h4">
								{displayedUsedQuota}%
							</Typography>
						</Stack>
					</Stack>

					<Box sx={{ mt: 3 }}>
						<BorderLinearProgress
							value={+percentage}
							variant="determinate"
							color="primary"
						/>
					</Box>
					<Typography color="text.secondary" gutterBottom sx={{ mt: 3 }}>
						{formatUsedQuotaInGB(usedQuota, 2)} GB of {formatUsedQuotaInGB(quota, 2)} GB used
					</Typography>
				</Box>
			) : (
				<Box
					sx={{
						py: { xs: 1, sm: 4 },
						px: { xs: 2, sm: 4 },
						border: '1px  solid rgb(0, 0, 0, 0.12)',
						borderRadius: '10px',
						height: { xs: '180px', sm: '210px' },
						width: '100%',
						maxWidth: '100%',
					}}
				>
					<Skeleton variant="text" sx={{ fontSize: '1rem' }} />
					<Skeleton variant="text" sx={{ fontSize: '1.8rem' }} />
					<Skeleton variant="text" sx={{ fontSize: '1rem', mt: 2 }} />
					<Skeleton variant="text" sx={{ fontSize: '1rem' }} />
				</Box>
			)}
		</>
	);
};
