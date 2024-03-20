import { Box } from '@mui/material';
import { ImageGallery } from 'components/ImageGallery';
import UploadImage from 'components/UploadImage';

import { Quota } from '../components/Quota';
import MainLayout from '../layout/MainLayout';

const OverviewPage = () => {
	return (
		<MainLayout title="Overview">
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					justifyContent: 'space-between',
					gap: '10px',
					mb: { xs: 1, md: 4 },
				}}
			>
				<Quota />
				<UploadImage />
			</Box>
			<ImageGallery />
		</MainLayout>
	);
};

export default OverviewPage;
