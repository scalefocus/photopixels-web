import {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useState,
} from 'react';

import { IUser } from '../types/types';

export type AuthContextType = {
	user: IUser | null;
	setUser: Dispatch<SetStateAction<IUser | null>>;
};

const defaultState: AuthContextType = {
	user: null,
	setUser: () => {},
};

const AuthContext = createContext(defaultState);

export const AuthProvider = ({ children }: PropsWithChildren<unknown>) => {
	const [user, setUser] = useState<IUser | null>(defaultState.user);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
