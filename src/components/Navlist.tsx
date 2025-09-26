import { Folder } from '@mui/icons-material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import AuthContext from '../context/authContext';
import { storage } from '../utils/utils';

const NAVIGATION_ITEMS: Array<{
	to: string | null;
	label: string;
	icon: React.ReactNode;
	adminOnly: boolean;
}> = [
	{
		to: '/',
		label: 'Gallery',
		icon: <AnalyticsIcon color="primary" />,
		adminOnly: false,
	},
	{
		to: '/favorites',
		label: 'Favorites',
		icon: <FavoriteIcon color="primary" />,
		adminOnly: false,
	},
		{
		to: '/albums',
		label: 'Albums',
		icon: <Folder color="primary" />,
		adminOnly: false,
	},
	{
		to: '/trash',
		label: 'Trash',
		icon: <DeleteOutlineIcon color="primary" />,
		adminOnly: false,
	},
		{
		to: '/settings',
		label: 'Settings',
		icon: <ManageAccountsIcon color="primary" />,
		adminOnly: false,
	},
	{
		to: '/users',
		label: 'Users',
		icon: <GroupIcon color="primary" />,
		adminOnly: true,
	},
	{
		to: '/create-user',
		label: 'Create User',
		icon: <PersonAddIcon color="primary" />,
		adminOnly: true,
	},
	{
		to: '/admin-settings',
		label: 'Admin Settings',
		icon: <SettingsIcon color="primary" />,
		adminOnly: true,
	},
	{
		to: null,
		label: 'Logout',
		icon: <LogoutIcon color="primary" />,
		adminOnly: false,
	},
];

export interface NavListProps {
	isAdmin: boolean;
}

export default function NavList({ isAdmin }: NavListProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { setUser } = useContext(AuthContext);

	const handleLogout = () => {
		storage.clearTokens();
		setUser(null);
		navigate('/login');
	};

	return (
		<Box sx={{ width: '100%' }}>
			<List component="nav" sx={{ color: 'text.secondary' }}>
				{NAVIGATION_ITEMS.map((item) => {
					const { icon, label, to, adminOnly } = item;
					if (adminOnly && !isAdmin) {
						return null;
					} else {
						return (
							<ListItemButton
								key={label}
								selected={location.pathname === item.to}
								{...(to
									? {
											component: NavLink,
											to,
									  }
									: { onClick: () => handleLogout() })}
							>
								<ListItemIcon>{icon}</ListItemIcon>
								<ListItemText primary={label} />
							</ListItemButton>
						);
					}
				})}
			</List>
		</Box>
	);
}
