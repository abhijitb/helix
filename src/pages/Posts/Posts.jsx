import React, { useState, useEffect, useCallback } from 'react';
import PostsList from './components/PostsList';
import PostFilters from './components/PostFilters';
import './Posts.css';

/**
 * Main Posts Management Page Component
 * Phase 1: Foundation & Core List View with Pagination
 */
export default function Posts() {
	const [ posts, setPosts ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ filters, setFilters ] = useState( {
		search: '',
		status: 'all',
		author: 'all',
		dateRange: 'all',
	} );
	const [ pagination, setPagination ] = useState( {
		page: 1,
		perPage: 10, // Reduced for proper pagination
		total: 0,
		totalPages: 0,
	} );

	/**
	 * Fetch posts from WordPress REST API
	 */
	const fetchPosts = useCallback( async () => {
		setLoading( true );
		setError( null );

		try {
			const queryParams = new URLSearchParams( {
				page: pagination.page,
				per_page: pagination.perPage,
			} );

			// Add all filter parameters to API call
			if ( filters.search ) {
				queryParams.set( 'search', filters.search );
			}
			if ( filters.author !== 'all' ) {
				queryParams.set( 'author', filters.author );
			}
			if ( filters.status !== 'all' ) {
				queryParams.set( 'status', filters.status );
			}
			// Note: date filtering will be done client-side

			// Try to get the API URL from helixData, fallback to standard WordPress REST API
			const apiUrl = `${
				window.helixData?.wpRestUrl ||
				window.location.origin + '/wp-json/wp/v2/'
			}posts?${ queryParams }`;

			// Try different authentication methods
			const headers = {
				'X-WP-Nonce': window.helixData?.nonce || '',
				Authorization: `Bearer ${ window.helixData?.nonce || '' }`,
			};

			// Add nonce as query parameter as well
			if ( window.helixData?.nonce ) {
				queryParams.set( '_wpnonce', window.helixData.nonce );
			}

			const response = await fetch( apiUrl, { headers } );

			if ( ! response.ok ) {
				const errorText = await response.text();
				throw new Error(
					`HTTP error! status: ${ response.status }, response: ${ errorText }`
				);
			}

			const postsData = await response.json();
			// Store posts for current page
			setPosts( postsData );

			// Get pagination info from API response headers
			const total = response.headers.get( 'X-WP-Total' );
			const totalPages = response.headers.get( 'X-WP-TotalPages' );

			setPagination( ( prev ) => ( {
				...prev,
				total: parseInt( total ) || postsData.length,
				totalPages:
					parseInt( totalPages ) ||
					Math.ceil(
						( parseInt( total ) || postsData.length ) / prev.perPage
					),
			} ) );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	}, [ pagination.page, pagination.perPage, filters ] );

	useEffect( () => {
		fetchPosts();
	}, [ fetchPosts ] );

	useEffect( () => {
		fetchPosts();
	}, [ filters.status, filters.author, filters.search, fetchPosts ] );

	/**
	 * Handle filter changes
	 */
	const handleFilterChange = ( newFilters ) => {
		setFilters( newFilters );
		setPagination( ( prev ) => ( { ...prev, page: 1 } ) );
	};

	/**
	 * Handle pagination changes
	 */
	const handlePageChange = ( newPage ) => {
		setPagination( ( prev ) => ( { ...prev, page: newPage } ) );
	};

	/**
	 * Handle post deletion
	 */
	const handlePostDelete = async ( postId ) => {
		if (
			! window.confirm( 'Are you sure you want to delete this post?' )
		) {
			return;
		}

		try {
			const response = await fetch(
				`${
					window.helixData?.wpRestUrl ||
					window.location.origin + '/wp-json/wp/v2/'
				}posts/${ postId }`,
				{
					method: 'DELETE',
					headers: {
						'X-WP-Nonce': window.helixData?.nonce || '',
					},
				}
			);

			if ( response.ok ) {
				// Remove post from local state
				setPosts( ( prev ) =>
					prev.filter( ( post ) => post.id !== postId )
				);
				// Refresh posts to update pagination
				fetchPosts();
			} else {
				throw new Error( 'Failed to delete post' );
			}
		} catch ( err ) {
			setError( `Error deleting post: ${ err.message }` );
		}
	};

	/**
	 * Handle post status change
	 */
	const handleStatusChange = async ( postId, newStatus ) => {
		try {
			const response = await fetch(
				`${
					window.helixData?.wpRestUrl ||
					window.location.origin + '/wp-json/wp/v2/'
				}posts/${ postId }`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': window.helixData?.nonce || '',
					},
					body: JSON.stringify( { status: newStatus } ),
				}
			);

			if ( response.ok ) {
				// Update post in local state
				setPosts( ( prev ) =>
					prev.map( ( post ) =>
						post.id === postId
							? { ...post, status: newStatus }
							: post
					)
				);
			} else {
				throw new Error( 'Failed to update post status' );
			}
		} catch ( err ) {
			setError( `Error updating post status: ${ err.message }` );
		}
	};

	if ( error ) {
		return (
			<div className="helix-page">
				<div className="helix-error">
					<h2>Error Loading Posts</h2>
					<p>{ error }</p>
					<button onClick={ fetchPosts } className="helix-button">
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="helix-page">
			<div className="helix-page-header">
				<h1>Posts Management</h1>
				<div className="helix-page-actions">
					<button className="helix-button helix-button--primary">
						Add New Post
					</button>
				</div>
			</div>

			<PostFilters
				filters={ filters }
				onFilterChange={ handleFilterChange }
			/>

			<PostsList
				posts={ posts }
				loading={ loading }
				pagination={ pagination }
				onPageChange={ handlePageChange }
				onDelete={ handlePostDelete }
				onStatusChange={ handleStatusChange }
			/>
		</div>
	);
}
