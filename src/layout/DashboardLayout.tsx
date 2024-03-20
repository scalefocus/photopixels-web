import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
	return (
		<Box
			sx={{
				height: '100vh',
				display: 'flex',
			}}
		>
			<Outlet />
		</Box>
	);
};
