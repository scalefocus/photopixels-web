import { ChangePassword } from '../components/ChangePassword';
import { DeleteAccount } from '../components/DeleteAccount';
import MainLayout from '../layout/MainLayout';

const SettingsPage = () => {
	return (
		<MainLayout title="Settings">
			<ChangePassword />
			<DeleteAccount />
		</MainLayout>
	);
};

export default SettingsPage;
