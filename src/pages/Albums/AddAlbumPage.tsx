import MainLayout from '../../layout/MainLayout';
import { ImageGallery } from 'components/ImageGallery';
import UploadImage from 'components/UploadImage';
import { CreateAlbum } from 'components/Albums/CreateAlbum';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteAlbum } from 'api/albumApi';
import toast from 'react-hot-toast';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
			onError: (err: any) => {
				toast.error(`Error deleting album: ${err?.message ?? 'Error'}`);
			},
		});
	};

	return (
		<MainLayout title="">
			{hasAlbumId && (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, }} >
					<Typography variant="h5" sx={{ fontWeight: 700 }}>
						{hasAlbumId ? 'View Album' : 'Create Album'}
					</Typography>
					{hasAlbumId && (
						<Tooltip title="Delete album">
							<span>
								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon />}
									onClick={handleDelete}
									disabled={delAlbumMutation.isPending}
								>
									Delete
								</Button>
							</span>
						</Tooltip>
					)}
				</Box>
			)}
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