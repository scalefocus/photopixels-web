import { ChangePassword } from '../components/Users/ChangePassword';
import { DeleteAccount } from '../components/Users/DeleteAccount';
import { VideoConversionToggle } from '../components/Users/VideoConversionToggle';
import MainLayout from '../layout/MainLayout';

const SettingsPage = () => {
	return (
		<MainLayout title="Settings">
			<ChangePassword />
			<DeleteAccount />
			<VideoConversionToggle />
		</MainLayout>
	);
};

export default SettingsPage;
