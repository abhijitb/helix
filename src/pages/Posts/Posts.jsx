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
		category: 'all',
		tag: 'all',
		dateRange: 'all',
	} );
	const [ sort, setSort ] = useState( {
		field: 'date',
		order: 'desc',
	} );
	const [ pagination, setPagination ] = useState( {
		page: 1,
		perPage: 10, // Reduced for proper pagination
		total: 0,
		totalPages: 0,
	} );
	const [ selectedPosts, setSelectedPosts ] = useState( new Set() );

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
				orderby: sort.field,
				order: sort.order,
				_embed: 'true',
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
			} else {
				queryParams.set(
					'status',
					'publish,draft,pending,private,future'
				);
			}
			if ( filters.category !== 'all' ) {
				queryParams.set( 'categories', filters.category );
			}
			if ( filters.tag !== 'all' ) {
				queryParams.set( 'tags', filters.tag );
			}

			// Compute server-side date range from dateRange filter
			if ( filters.dateRange !== 'all' ) {
				const { after, before } = computeDateRange( filters.dateRange );
				if ( after ) {
					queryParams.set( 'after', after );
				}
				if ( before ) {
					queryParams.set( 'before', before );
				}
			}

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
	}, [ pagination.page, pagination.perPage, sort, filters ] );

	/**
	 * Compute after and before ISO date strings from a date range key.
	 *
	 * @param {string} dateRange - One of 'today', 'yesterday', 'week', 'month', 'quarter', 'year'
	 * @return {{after: string, before: string}} ISO date boundaries
	 */
	const computeDateRange = ( dateRange ) => {
		const now = new Date();
		let after = null;
		let before = null;

		switch ( dateRange ) {
			case 'today':
				after = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate()
				);
				break;
			case 'yesterday': {
				const yesterday = new Date( now );
				yesterday.setDate( yesterday.getDate() - 1 );
				after = new Date(
					yesterday.getFullYear(),
					yesterday.getMonth(),
					yesterday.getDate()
				);
				before = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate()
				);
				break;
			}
			case 'week': {
				const weekStart = new Date( now );
				weekStart.setDate( now.getDate() - now.getDay() );
				after = new Date(
					weekStart.getFullYear(),
					weekStart.getMonth(),
					weekStart.getDate()
				);
				break;
			}
			case 'month':
				after = new Date( now.getFullYear(), now.getMonth(), 1 );
				break;
			case 'quarter': {
				const quarterMonth = Math.floor( now.getMonth() / 3 ) * 3;
				after = new Date( now.getFullYear(), quarterMonth, 1 );
				break;
			}
			case 'year':
				after = new Date( now.getFullYear(), 0, 1 );
				break;
		}

		return {
			after: after ? after.toISOString() : null,
			before: before ? before.toISOString() : null,
		};
	};

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

	/**
	 * Handle sort changes - toggle order if same field, default to desc for new field.
	 */
	const handleSortChange = ( field ) => {
		setSort( ( prev ) => ( {
			field,
			order:
				prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
		} ) );
		setPagination( ( prev ) => ( { ...prev, page: 1 } ) );
	};

	/**
	 * Handle toggling a single post selection.
	 */
	const handleSelectPost = ( postId, checked ) => {
		setSelectedPosts( ( prev ) => {
			const next = new Set( prev );
			if ( checked ) {
				next.add( postId );
			} else {
				next.delete( postId );
			}
			return next;
		} );
	};

	/**
	 * Handle select-all toggle for the current page.
	 */
	const handleSelectAll = ( checked ) => {
		if ( checked ) {
			setSelectedPosts( new Set( posts.map( ( p ) => p.id ) ) );
		} else {
			setSelectedPosts( new Set() );
		}
	};

	/**
	 * Handle post update after quick edit save.
	 */
	const handlePostUpdate = () => {
		fetchPosts();
	};

	/**
	 * Handle bulk actions (status change or delete) on selected posts.
	 */
	const handleBulkAction = async ( action, status ) => {
		if ( selectedPosts.size === 0 ) {
			return;
		}

		const ids = Array.from( selectedPosts );
		const apiBase =
			window.helixData?.wpRestUrl ||
			window.location.origin + '/wp-json/wp/v2/';

		if ( action === 'delete' ) {
			if (
				! window.confirm(
					`Are you sure you want to delete ${ ids.length } post(s)?`
				)
			) {
				return;
			}

			const results = await Promise.allSettled(
				ids.map( ( id ) =>
					fetch( `${ apiBase }posts/${ id }`, {
						method: 'DELETE',
						headers: {
							'X-WP-Nonce': window.helixData?.nonce || '',
						},
					} )
				)
			);
			const succeeded = results.filter(
				( r ) => r.status === 'fulfilled'
			).length;
			setError(
				`Deleted ${ succeeded } of ${ ids.length } selected post(s).`
			);
		} else if ( action === 'status' && status ) {
			const results = await Promise.allSettled(
				ids.map( ( id ) =>
					fetch( `${ apiBase }posts/${ id }`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': window.helixData?.nonce || '',
						},
						body: JSON.stringify( { status } ),
					} )
				)
			);
			const succeeded = results.filter(
				( r ) => r.status === 'fulfilled'
			).length;
			setError(
				`Changed ${ succeeded } of ${ ids.length } selected post(s) to "${ status }".`
			);
		}

		setSelectedPosts( new Set() );
		fetchPosts();
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
					<button
						className="helix-button helix-button--primary"
						onClick={ () => {
							window.location.href = `${
								window.helixData?.adminUrl || '/wp-admin/'
							}post-new.php`;
						} }
					>
						Add New Post
					</button>
				</div>
			</div>

			<PostFilters
				filters={ filters }
				onFilterChange={ handleFilterChange }
			/>

			{ selectedPosts.size > 0 && (
				<div className="helix-bulk-actions">
					<span
						className="helix-bulk-actions__count"
						style={ { marginRight: '16px' } }
					>
						{ selectedPosts.size } post(s) selected
					</span>
					<select
						className="helix-select helix-bulk-actions__select"
						defaultValue=""
						onChange={ ( e ) => {
							const val = e.target.value;
							if ( val === 'delete' ) {
								handleBulkAction( 'delete' );
							} else if ( val ) {
								handleBulkAction( 'status', val );
							}
							e.target.value = '';
						} }
					>
						<option value="">Bulk Actions</option>
						<option value="publish">
							Change Status to Published
						</option>
						<option value="draft">Change Status to Draft</option>
						<option value="private">
							Change Status to Private
						</option>
						<option value="pending">
							Change Status to Pending
						</option>
						<option value="delete">Move to Trash</option>
					</select>
				</div>
			) }

			<PostsList
				posts={ posts }
				loading={ loading }
				pagination={ pagination }
				onPageChange={ handlePageChange }
				onDelete={ handlePostDelete }
				onStatusChange={ handleStatusChange }
				sort={ sort }
				onSortChange={ handleSortChange }
				selectedPosts={ selectedPosts }
				onSelectPost={ handleSelectPost }
				onSelectAll={ handleSelectAll }
				onPostUpdate={ handlePostUpdate }
			/>
		</div>
	);
}
