/**
 * Posts API Utility Functions
 * Centralized API calls for posts management
 */

const API_BASE =
	window.helixData?.wpRestUrl || window.location.origin + '/wp-json/wp/v2/';

/**
 * Fetch posts with filters and pagination
 */
export const fetchPosts = async ( params = {} ) => {
	const queryParams = new URLSearchParams( {
		page: 1,
		per_page: 20,
		...params,
	} );

	// Remove 'all' values as they're not valid API parameters
	[ 'status', 'author', 'dateRange' ].forEach( ( key ) => {
		if ( params[ key ] === 'all' ) {
			queryParams.delete( key );
		}
	} );

	try {
		const response = await fetch( `${ API_BASE }posts?${ queryParams }` );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		const posts = await response.json();
		const total = response.headers.get( 'X-WP-Total' );
		const totalPages = response.headers.get( 'X-WP-TotalPages' );

		return {
			posts,
			pagination: {
				total: parseInt( total ) || 0,
				totalPages: parseInt( totalPages ) || 0,
			},
		};
	} catch ( error ) {
		throw error;
	}
};

/**
 * Fetch a single post by ID
 */
export const fetchPost = async ( postId ) => {
	try {
		const response = await fetch( `${ API_BASE }posts/${ postId }` );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Create a new post
 */
export const createPost = async ( postData ) => {
	try {
		const response = await fetch( `${ API_BASE }posts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.helixData?.nonce || '',
			},
			body: JSON.stringify( postData ),
		} );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Update an existing post
 */
export const updatePost = async ( postId, postData ) => {
	try {
		const response = await fetch( `${ API_BASE }posts/${ postId }`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': window.helixData?.nonce || '',
			},
			body: JSON.stringify( postData ),
		} );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Delete a post
 */
export const deletePost = async ( postId ) => {
	try {
		const response = await fetch( `${ API_BASE }posts/${ postId }`, {
			method: 'DELETE',
			headers: {
				'X-WP-Nonce': window.helixData?.nonce || '',
			},
		} );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return true;
	} catch ( error ) {
		throw error;
	}
};

/**
 * Fetch authors for filter dropdown
 */
export const fetchAuthors = async () => {
	try {
		const response = await fetch( `${ API_BASE }users?per_page=100` );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Fetch categories for filter dropdown
 */
export const fetchCategories = async () => {
	try {
		const response = await fetch( `${ API_BASE }categories?per_page=100` );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};

/**
 * Fetch tags for filter dropdown
 */
export const fetchTags = async () => {
	try {
		const response = await fetch( `${ API_BASE }tags?per_page=100` );

		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}

		return await response.json();
	} catch ( error ) {
		throw error;
	}
};
