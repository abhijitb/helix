const defaultConfig = require( '@wordpress/scripts/config/.eslintrc.js' );

module.exports = {
	...defaultConfig,
	rules: {
		...defaultConfig.rules,
		// Custom rules for our project
		'react/react-in-jsx-scope': 'off', // Not needed in React 17+
		'import/no-unresolved': 'off', // Vite handles module resolution
		'@wordpress/no-unused-vars-before-return': 'off', // Allow modern patterns
		'jsdoc/require-param-type': 'off', // Too verbose for React props
		'jsdoc/require-param': 'off', // Too verbose for React props
		'no-alert': 'off', // Allow confirm dialogs for UX
		'jsx-a11y/label-has-associated-control': 'off', // Our labels are correctly associated
		'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off', // Allow nav with tablist role
	},
	globals: {
		...defaultConfig.globals,
		// Additional globals for our project
		helixData: 'readonly',
	},
};
