import { CircularProgress, Container } from '@mui/material';

const Loading = () => {
	return (
		<Container
			sx={{
				width: '100%',
				height: '100%',
				margin: 'auto',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<CircularProgress color="inherit" />
		</Container>
	);
};

export default Loading;
