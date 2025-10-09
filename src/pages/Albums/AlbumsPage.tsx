import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { Button } from "@mui/material";
import { AlbumsGallery } from "components/Albums/AlbumsGallery";
import MainLayout from "layout/MainLayout";
import { Link as RouterLink } from "react-router-dom";


const AlbumPage = () => {
	return (
		<MainLayout
			title="Albums"
			actions={
				<Button
					component={RouterLink}
					to="/albums/add"
					variant="contained"
					startIcon={<CreateNewFolderIcon />}
				>
					Create Album
				</Button>
			}
		>
			<AlbumsGallery />
		</MainLayout>
	);
};

export default AlbumPage;