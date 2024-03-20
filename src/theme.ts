import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		primary: {
			main: 'rgb(8,39,115)',
		},
		secondary: {
			main: 'rgb(20,177,231)',
		},
		text: {
			primary: '#101828',
			secondary: '#475467',
		},
	},
	typography: {
		fontFamily: 'Inter',
	},
});
