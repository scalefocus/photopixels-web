export type PredicateFn<T> = (value: T) => boolean;

// Taken from https://emailregex.com
export const EMAIL_REGEX =
	// eslint-disable-next-line no-useless-escape
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const isEmail: PredicateFn<string> = (value) => EMAIL_REGEX.test(value);

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

export const isValidPassword: PredicateFn<string> = (value) =>
	PASSWORD_REGEX.test(value);
