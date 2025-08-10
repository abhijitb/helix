/**
 * Settings API utilities for making requests to the WordPress REST API.
 */

// Get the REST API base URL
const getAPIBase = () => {
	return window.helixData?.restUrl || '/wp-json/helix/v1/';
};

// Get the REST API nonce for authentication
const getNonce = () => {
	return window.helixData?.nonce || '';
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options  - Fetch options
 * @return {Promise<Object>} API response
 */
const apiRequest = async ( endpoint, options = {} ) => {
	const url = `${ getAPIBase() }${ endpoint }`;

	const defaultOptions = {
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': getNonce(),
		},
		credentials: 'include',
	};

	const mergedOptions = {
		...defaultOptions,
		...options,
		headers: {
			...defaultOptions.headers,
			...options.headers,
		},
	};

	try {
		const response = await fetch( url, mergedOptions );

		if ( ! response.ok ) {
			const errorData = await response.json().catch( () => ( {} ) );
			throw new Error(
				errorData.message ||
					`HTTP ${ response.status }: ${ response.statusText }`
			);
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Get all settings
 * @return {Promise<Object>} All settings organized by category
 */
export const getAllSettings = async () => {
	return apiRequest( 'settings' );
};

/**
 * Get a single setting
 * @param {string} setting - Setting key
 * @return {Promise<Object>} Setting data
 */
export const getSetting = async ( setting ) => {
	return apiRequest( `settings/${ setting }` );
};

/**
 * Update multiple settings
 * @param {Object} settings - Settings to update
 * @return {Promise<Object>} Update result
 */
export const updateSettings = async ( settings ) => {
	return apiRequest( 'settings', {
		method: 'POST',
		body: JSON.stringify( settings ),
	} );
};

/**
 * Update a single setting
 * @param {string} setting - Setting key
 * @param {any}    value   - Setting value
 * @return {Promise<Object>} Update result
 */
export const updateSetting = async ( setting, value ) => {
	return apiRequest( `settings/${ setting }`, {
		method: 'POST',
		body: JSON.stringify( { value } ),
	} );
};
