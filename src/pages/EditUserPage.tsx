import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { getUser } from '../api/api';
import { ChangeQuota } from '../components/ChangeQuota';
import { ChangeRole } from '../components/ChangeRole';
import { DeleteUser } from '../components/DeleteUser';
import Loading from '../components/Loading';
import { Quota } from '../components/Quota';
import { ResetPassword } from '../components/ResetPassword';
import { USER_ROLES_OPTIONS } from '../constants/constants';
import MainLayout from '../layout/MainLayout';

const EditUserPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { userID } = location.state;
	const { data: userInfo, isLoading, isError, error } = getUser({ id: userID });

	return (
		<MainLayout title="Edit User">
			{isLoading && <Loading />}
			{isError && (
				<Alert icon={false} sx={{ my: 2 }} severity="error">
					{error.message}
				</Alert>
			)}
			{userInfo && (
				<Box
					sx={{
						maxWidth: '700px',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							direction: 'row',
							justifyContent: 'space-between',
							maxWidth: '700px',
						}}
					>
						<Typography sx={{ fontSize: '1.3rem', fontWeight: 'medium' }}>
							{userInfo.name}
						</Typography>
						<Button
							onClick={() => navigate('/users')}
							startIcon={<ArrowBackIosIcon />}
							variant="outlined"
						>
							Back
						</Button>
					</Box>

					<Typography sx={{ color: 'text.secondary', mb: 2 }}>
						{USER_ROLES_OPTIONS[userInfo.role]}
					</Typography>
					<Quota />
					<ChangeQuota id={userID} quota={userInfo.quota} />
					<ChangeRole id={userID} role={userInfo.role} />
					<ResetPassword email={userInfo.email} />
					<DeleteUser id={userID} />
				</Box>
			)}
		</MainLayout>
	);
};

export default EditUserPage;
