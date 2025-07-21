

import { FavoritesGallery } from 'components/FavoritesGallery';

import MainLayout from '../layout/MainLayout';

const FavoritesPage = () => {
	return (
		<MainLayout title="Favorites">
			<FavoritesGallery />
		</MainLayout>
	);
};

export default FavoritesPage;
