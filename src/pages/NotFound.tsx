import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';

export default function NotFound() {
	return (
		<Container component="main" maxWidth="xs">
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				style={{ minHeight: '100vh' }}
			>
				<h2>Page not found!</h2>
				<p>
					Go to the <NavLink to="/">Homepage</NavLink>.
				</p>
			</Box>
		</Container>
	);
}
