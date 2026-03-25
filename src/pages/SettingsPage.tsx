import { ChangePassword } from '../components/Users/ChangePassword';
import { DeleteAccount } from '../components/Users/DeleteAccount';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { VideoConversionSettings } from '../components/Users/VideoConversionSettings';
import MainLayout from '../layout/MainLayout';

const SettingsPage = () => {
	return (
		<MainLayout title="Settings">
			<ChangePassword />
			<DeleteAccount />
			{/* <VideoConversionSettings /> */}
		</MainLayout>
	);
};

export default SettingsPage;
