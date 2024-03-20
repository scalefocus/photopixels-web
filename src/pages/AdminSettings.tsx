import { ServerStatus } from 'components/ServerStatus';

import MainLayout from '../layout/MainLayout';

const AdminSettingsPage = () => {
	return (
		<MainLayout title="Settings">
			<ServerStatus />
		</MainLayout>
	);
};

export default AdminSettingsPage;
