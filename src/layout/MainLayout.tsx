import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { PropsWithChildren, useState } from 'react';

import Nav from './Nav';

interface MainLayoutProps extends PropsWithChildren {
	title: string;
}

const MainLayout = (props: MainLayoutProps) => {
	const [open, setOpen] = useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	return (
		<Box
			sx={{
				height: '100vh',
				display: 'flex',
				width: '100%',
			}}
		>
			<Drawer open={open} onClose={toggleDrawer(false)}>
				<Nav />
			</Drawer>
			<Box
				sx={{
					display: { xs: 'none', md: 'block' },
				}}
			>
				<Nav />
			</Box>
			<Box
				display="flex"
				flexDirection="column"
				sx={{
					width: '100%',
					p: 4,

					overflow: 'auto',
				}}
			>
				<Box
					display="flex"
					sx={{
						justifyContent: 'space-between',
						alignItems: 'flex-start',
					}}
				>
					<Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
						{props.title}
					</Typography>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={toggleDrawer(true)}
						edge="start"
						sx={{
							...(open && { display: 'none' }),
							display: { md: 'none' },
						}}
					>
						<MenuIcon />
					</IconButton>
				</Box>

				{props.children}
			</Box>
		</Box>
	);
};

export default MainLayout;
