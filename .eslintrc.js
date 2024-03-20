module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'prettier',
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'react', 'simple-import-sort', 'import'],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'import/extensions': 'off',
		'simple-import-sort/imports': 'error',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/imports-first': 'error',
		'import/no-extraneous-dependencies': 'off',
		'import/no-named-as-default': 'error',
		'import/prefer-default-export': 'off',
		'no-console': 'error',
		'no-nested-ternary': 'error',
	},
	settings: { react: { version: 'detect' } },
};
