import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
	Alert,
	Box,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	InputAdornment,
	Snackbar,
	TextField,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { createUser } from '../api/api';
import { SelectRole } from '../components/SelectRole';
import MainLayout from '../layout/MainLayout';
import { IRegistrationError, UserRoles } from '../types/types';

const CreateUserPage = () => {
	const [role, setRole] = useState(UserRoles.USER);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<Array<string> | null>(null);
	const [showMessage, setShowMessage] = useState(false);

	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const createUserMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			setShowMessage(true),
				setRole(UserRoles.USER),
				setName(''),
				setEmail(''),
				setPassword('');
		},
		onError: (err: IRegistrationError) => {
			const { errors } = err.response.data;
			setError(Object.values(errors));
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		createUserMutation.mutate({ name, email, password, role });
	};

	return (
		<MainLayout title="Create A New User">
			<Box
				sx={{
					display: 'flex',
					direction: 'row',
					justifyContent: 'space-between',
					maxWidth: '700px',
				}}
			>
				<Snackbar
					open={showMessage}
					autoHideDuration={3000}
					onClose={() => setShowMessage(false)}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				>
					<Alert severity="success" sx={{ width: '100%' }}>
						User Created.
					</Alert>
				</Snackbar>
				<form onSubmit={handleSubmit}>
					<FormControl>
						<FormLabel>Select a Role</FormLabel>
						<SelectRole role={role} setRole={setRole} />
					</FormControl>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="name"
						label="Name"
						name="name"
						type="text"
						autoFocus
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						type="email"
						label="Email Address"
						name="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type={showPassword ? 'text' : 'password'}
						id="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="toggle password visibility"
										onClick={handleClickShowPassword}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
						helperText="Passwords must be at least 8 characters with at least one lowercase, one uppercase, and one non alphanumeric character.
						"
					/>

					<Button
						disabled={createUserMutation.isPending}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 2, mb: 2 }}
					>
						Create User
					</Button>
					{createUserMutation.isError && (
						<Alert icon={false} sx={{ my: 2 }} severity="error">
							{error?.map((e: string, index: number) => (
								<li key={index}>{e}</li>
							))}{' '}
						</Alert>
					)}
				</form>
			</Box>
		</MainLayout>
	);
};

export default CreateUserPage;
