import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { deleteAlbum } from 'api/albumApi';
import { CreateAlbum } from 'components/Albums/CreateAlbum';
import { ImageGallery } from 'components/ImageGallery';
import UploadImage from 'components/UploadImage';
import toast from 'react-hot-toast';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import MainLayout from '../../layout/MainLayout';

const AddAlbumPage = () => {
	const { albumId } = useParams<{ albumId?: string }>();
	const hasAlbumId = Boolean(albumId);
	const navigate = useNavigate();
	const delAlbumMutation = deleteAlbum();

	const handleDelete = () => {
		if (!albumId) return;
		if (!confirm('Are you sure you want to delete this album?')) return;

		delAlbumMutation.mutate(albumId, {
			onSuccess: () => {
				toast.success('Album deleted.');
				navigate('/albums');
			},
			onError: (err) => {
				toast.error(`Error deleting album: ${err?.message ?? 'Error'}`);
			},
		});
	};

	const titleNode = (
		<IconButton
			component={RouterLink}
			to="/albums"
			aria-label="Back to albums"
			size="small"
			sx={{
				borderRadius: 1,
				p: 0,
				'& svg': { fontSize: 28 },
			}}
		>
			<ArrowBackIosNewIcon />
		</IconButton>
	);

	return (
		<MainLayout
			title={titleNode}
			actions={
				hasAlbumId ? (
					<Tooltip title="Delete album">
						<span>
							<Button
								variant="outlined"
								color="error"
								startIcon={<DeleteIcon />}
								onClick={handleDelete}
								disabled={delAlbumMutation.isPending}
							>
								Delete Album
							</Button>
						</span>
					</Tooltip>
				) : undefined
			}
		>
			<CreateAlbum />
			{hasAlbumId && (
				<>
					<UploadImage />
					<ImageGallery albumId={albumId} />
				</>
			)}
		</MainLayout>
	);
};

export default AddAlbumPage;