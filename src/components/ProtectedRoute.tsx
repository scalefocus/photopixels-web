import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { storage } from '../utils/utils';

const ProtectedRoute = ({ children }: PropsWithChildren<unknown>) => {
	const token = storage.getToken();

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
