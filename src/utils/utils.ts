export const storage = {
	getToken: (): string | null => {
		const token = window.localStorage.getItem('token');
		return token && JSON.parse(token);
	},
	setToken: (token: string) =>
		window.localStorage.setItem('token', JSON.stringify(token)),
	clearTokens: () => {
		window.localStorage.removeItem('token');
		window.localStorage.removeItem('expiration');
		window.localStorage.removeItem('refresh-token');
	},
	setExpiration: (expiresIn: number) => {
		const expiration = new Date(Date.now() + 1000 * expiresIn);
		localStorage.setItem('expiration', expiration.toString());
	},
	setRefreshExpiration: () => {
		//refresh expiration in	3 days
		const expiration = new Date(Date.now() + 259200000);
		localStorage.setItem('refresh-expiration', expiration.toString());
	},
	getExpiration: (): string | null => {
		return window.localStorage.getItem('expiration');
	},
	getRefreshExpiration: (): string | null => {
		return window.localStorage.getItem('refresh-expiration');
	},
	getRefreshToken: (): string | null => {
		const refreshToken = window.localStorage.getItem('refresh-token');
		return refreshToken && JSON.parse(refreshToken);
	},
	setRefreshToken: (token: string) =>
		window.localStorage.setItem('refresh-token', JSON.stringify(token)),
	getEmail: (): string | null => {
		const email = window.localStorage.getItem('email');
		return email && JSON.parse(email);
	},
	setEmail: (email: string) =>
		window.localStorage.setItem('email', JSON.stringify(email)),
};

export const isTokenExpired = (): boolean => {
	const storedExpiration = storage.getExpiration();
	const expiration = storedExpiration && new Date(storedExpiration);
	return expiration ? expiration.getTime() < new Date().getTime() : true;
};

export const isRefreshTokenExpired = (): boolean => {
	const storedExpiration = storage.getRefreshExpiration();
	const expiration = storedExpiration && new Date(storedExpiration);
	return expiration ? expiration.getTime() < new Date().getTime() : true;
};

export const formatBytes = (bytes: number, decimals: number) => {
	return (bytes / 1073741824).toFixed(decimals);
};

export const convertToBytes = (gigabyte: number) => {
	return Math.round(gigabyte * 1073741824);
};

export const hexToBase64 = (hexString: string) => {
	// Step 1: Convert hex to binary
	let binaryData = '';
	for (let i = 0; i < hexString.length; i += 2) {
		binaryData += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
	}
	// Step 2: Convert binary to Base64
	return btoa(binaryData);
};

export const generateImageHash = async (file: File) => {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashValue = hashArray
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
	const base64String = hexToBase64(hashValue);
	return base64String;
};
