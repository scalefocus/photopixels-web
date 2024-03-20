import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
	Alert,
	Box,
	Button,
	InputAdornment,
	Paper,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getUsers } from '../api/api';
import { USER_ROLES_OPTIONS } from '../constants/constants';
import { IGetUser } from '../types/types';
import { formatBytes } from '../utils/utils';
import Loading from './Loading';

export default function Users() {
	const { data: users, isLoading } = getUsers();
	const [filter, setFilter] = useState('');
	const location = useLocation();
	const [showMessage, setShowMessage] = useState(
		location.state?.showMessage ?? false
	);

	const navigate = useNavigate();
	const handleClick = (userID: IGetUser['id']) => {
		navigate('/edit', { state: { userID } });
	};

	const filteredUsers = users?.filter((user) => {
		if (
			user.name.toLowerCase().includes(filter.toLowerCase()) ||
			user.email.toLowerCase().includes(filter.toLowerCase())
		) {
			return user;
		} else return null;
	});

	const StyledTableCell = styled(TableCell)(() => ({
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: '#F9FAFB',
		},
	}));

	const headers = ['Name', 'Email', 'Role', 'Quota', 'Used Quota', ''];

	return (
		<>
			<Snackbar
				open={showMessage}
				autoHideDuration={3000}
				onClose={() => setShowMessage(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert severity="success" sx={{ width: '100%' }}>
					{location.state?.message}
				</Alert>
			</Snackbar>
			{!isLoading ? (
				<Box>
					<TextField
						size="small"
						placeholder="Search Users"
						value={filter}
						onChange={(event) => setFilter(event.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ mb: 2, width: '30%' }}
					/>

					<Box
						sx={{
							border: '1px  solid rgb(0, 0, 0, 0.12)',
							borderRadius: '10px',
							maxWidth: '100%',
							maxHeight: '100%',
							overflow: 'hidden',
						}}
					>
						<TableContainer
							component={Paper}
							sx={{ boxShadow: 'none', maxHeight: '100%' }}
						>
							<Table stickyHeader sx={{ minWidth: 850 }}>
								<TableHead sx={{ bgcolor: '#F9FAFB' }}>
									<TableRow style={{ backgroundColor: '#F9FAFB' }}>
										{headers?.map((header, index) => (
											<StyledTableCell key={index}>{header}</StyledTableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredUsers?.map((user) => (
										<TableRow
											key={user.id}
											sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											hover
										>
											<TableCell component="th" scope="row">
												{user.name}
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>{USER_ROLES_OPTIONS[user.role]}</TableCell>
											<TableCell>{formatBytes(user.quota, 2)} GB</TableCell>
											<TableCell>
												{formatBytes(user.usedQuota, 2)} GB (
												{((user.usedQuota / user.quota) * 100).toFixed()}%)
											</TableCell>
											<TableCell align="center">
												<Button
													onClick={() => handleClick(user.id)}
													startIcon={<EditIcon />}
													variant="outlined"
												>
													Edit User
												</Button>
											</TableCell>
										</TableRow>
									))}
									{filteredUsers?.length === 0 && (
										<TableCell colSpan={6} align="center">
											<Typography
												align="center"
												width="100%"
												sx={{ margin: 'auto', p: 2 }}
											>
												No User found matching the criteria
											</Typography>
										</TableCell>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Box>
			) : (
				<Loading />
			)}
		</>
	);
}
