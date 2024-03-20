import { Box, Divider, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { getUserInfo } from '../api/api';
import AppIcon from '../assets/AppIcon.png';
import NavList from '../components/Navlist';
import AuthContext from '../context/authContext';

const Nav = () => {
	const { setUser } = useContext(AuthContext);
	const { data: userInfo } = getUserInfo();

	useEffect(() => {
		if (userInfo) {
			setUser(userInfo);
		}
	}, [userInfo]);

	const isAdmin = userInfo?.claims.role === 'Admin';

	return (
		<Box
			display="flex"
			flexDirection="column"
			sx={{
				minWidth: 300,
				borderRight: '1px  solid rgb(0, 0, 0, 0.12)',
				px: 2,
				bgcolor: '#F9FAFB',
				overflow: 'auto',
			}}
			style={{ minHeight: '100vh' }}
		>
			<NavLink to="/">
				<Box sx={{ my: 2, height: 60, display: 'inline-flex' }}>
					<img src={AppIcon} alt="Logo" />
				</Box>
			</NavLink>
			<Typography sx={{ bt: 1, fontWeight: 'medium', mb: 1 }}>
				{userInfo?.claims.fullName}
			</Typography>

			{isAdmin && <Typography sx={{ mb: 1, fontSize: 14 }}>Admin</Typography>}
			<Divider />
			<NavList isAdmin={!!isAdmin} />
		</Box>
	);
};

export default Nav;
