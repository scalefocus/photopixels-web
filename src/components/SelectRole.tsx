import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { USER_ROLES_OPTIONS } from '../constants/constants';
import { UserRoles } from '../types/types';

export interface SelectRoleProps {
	role: UserRoles;
	setRole: React.Dispatch<React.SetStateAction<UserRoles>>;
}

export const SelectRole = ({ role, setRole }: SelectRoleProps) => {
	return (
		<RadioGroup
			row
			value={role}
			onChange={(event) => setRole(+event?.target.value)}
		>
			{Object.entries(USER_ROLES_OPTIONS).map(([value, label]) => (
				<FormControlLabel
					key={value}
					value={value}
					control={<Radio />}
					label={label}
				/>
			))}
		</RadioGroup>
	);
};
