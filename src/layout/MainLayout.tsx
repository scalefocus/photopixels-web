import MenuIcon from '@mui/icons-material/Menu';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { PropsWithChildren, ReactNode, useState } from 'react';

import Nav from './Nav';

interface MainLayoutProps extends PropsWithChildren {
	title: string | ReactNode;
	actions?: ReactNode;
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
						alignItems: 'center',
						mb: 4,
					}}
				>
					{typeof props.title === 'string' ? (
						<Typography variant="h5" fontWeight={700}>
							{props.title}
						</Typography>
					) : (
						props.title
					)}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{props.actions}

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
				</Box>
				{props.children}
			</Box>
		</Box>
	);
};

export default MainLayout;
