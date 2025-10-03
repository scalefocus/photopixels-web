import MainLayout from '../../layout/MainLayout';
import { ImageGallery } from 'components/ImageGallery';
import UploadImage from 'components/UploadImage';
import { CreateAlbum } from 'components/Albums/CreateAlbum';
import { useParams } from 'react-router-dom';

const AddAlbumPage = () => {
	const { albumId } = useParams<{ albumId?: string }>();
	const hasAlbumId = Boolean(albumId);

	return (
		<MainLayout title={hasAlbumId ? 'View Album' : 'Create Album'}>
			<CreateAlbum />
			{hasAlbumId && (
				<>
					<UploadImage />
					<ImageGallery albumId={albumId}  />
				</>
			)}
		</MainLayout>
	);
};

export default AddAlbumPage;