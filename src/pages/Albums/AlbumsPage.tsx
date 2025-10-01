import { Box, Button, Typography } from "@mui/material";
import { AlbumsList } from "components/Albums/AlbumsList";
import MainLayout from "layout/MainLayout";
import { Link as RouterLink } from "react-router-dom";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';


const AlbumPage = () => {
	return (
		<MainLayout title="Albums">
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: { xs: 1, md: 2 },
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 700 }}>
					Albums
				</Typography>
				<Button
					component={RouterLink}
					to="/albums/add"
					variant="contained"
					startIcon={<CreateNewFolderIcon />}
				>
					Create Album
				</Button>
			</Box>

			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					gap: "10px",
					mb: { xs: 1, md: 4 },
				}}
			>
				<AlbumsList />
			</Box>
		</MainLayout>
	);
};

export default AlbumPage;