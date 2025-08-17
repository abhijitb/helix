import React, { useState, useEffect } from 'react';
import './PostFilters.css';

/**
 * Post Filters Component - Search and filtering controls
 */
export default function PostFilters( { filters, onFilterChange } ) {
	const [ authors, setAuthors ] = useState( [] );
	// eslint-disable-next-line no-unused-vars
	const [ categories, setCategories ] = useState( [] );
	const [ localFilters, setLocalFilters ] = useState( filters );

	useEffect( () => {
		fetchAuthors();
		fetchCategories();
	}, [] );

	useEffect( () => {
		setLocalFilters( filters );
	}, [ filters ] );

	/**
	 * Fetch authors for filter dropdown
	 */
	const fetchAuthors = async () => {
		try {
			const response = await fetch(
				`${
					window.helixData?.wpRestUrl ||
					window.location.origin + '/wp-json/wp/v2/'
				}users?per_page=100`
			);
			if ( response.ok ) {
				const authorsData = await response.json();
				setAuthors( authorsData );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error fetching authors:', error );
		}
	};

	/**
	 * Fetch categories for filter dropdown
	 */
	const fetchCategories = async () => {
		try {
			const response = await fetch(
				`${
					window.helixData?.wpRestUrl ||
					window.location.origin + '/wp-json/wp/v2/'
				}categories?per_page=100`
			);
			if ( response.ok ) {
				const categoriesData = await response.json();
				setCategories( categoriesData );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error fetching categories:', error );
		}
	};

	/**
	 * Handle filter input changes
	 */
	const handleFilterChange = ( key, value ) => {
		const newFilters = { ...localFilters, [ key ]: value };
		setLocalFilters( newFilters );
	};

	/**
	 * Apply filters
	 */
	const handleApplyFilters = () => {
		onFilterChange( localFilters );
	};

	/**
	 * Clear all filters
	 */
	const handleClearFilters = () => {
		const clearedFilters = {
			search: '',
			status: 'all',
			author: 'all',
			dateRange: 'all',
		};
		setLocalFilters( clearedFilters );
		onFilterChange( clearedFilters );
	};

	/**
	 * Check if any filters are active
	 */
	const hasActiveFilters = () => {
		return (
			localFilters.search ||
			localFilters.status !== 'all' ||
			localFilters.author !== 'all' ||
			localFilters.dateRange !== 'all'
		);
	};

	return (
		<div className="helix-post-filters">
			<div className="helix-post-filters__row">
				<div className="helix-post-filters__search">
					<label className="helix-filter-label">Search Posts</label>
					<input
						type="text"
						placeholder="Search posts..."
						value={ localFilters.search }
						onChange={ ( e ) =>
							handleFilterChange( 'search', e.target.value )
						}
						className="helix-input"
					/>
				</div>

				<div className="helix-post-filters__controls">
					<div className="helix-filter-group">
						<label className="helix-filter-label">Status</label>
						<select
							value={ localFilters.status }
							onChange={ ( e ) =>
								handleFilterChange( 'status', e.target.value )
							}
							className="helix-select"
						>
							<option value="all">All Statuses</option>
							<option value="publish">Published</option>
							<option value="draft">Draft</option>
							<option value="pending">Pending</option>
							<option value="private">Private</option>
							<option value="future">Scheduled</option>
						</select>
					</div>

					<div className="helix-filter-group">
						<label className="helix-filter-label">Author</label>
						<select
							value={ localFilters.author }
							onChange={ ( e ) =>
								handleFilterChange( 'author', e.target.value )
							}
							className="helix-select"
						>
							<option value="all">All Authors</option>
							{ authors.map( ( author ) => (
								<option key={ author.id } value={ author.id }>
									{ author.name }
								</option>
							) ) }
						</select>
					</div>

					<div className="helix-filter-group">
						<label className="helix-filter-label">Date Range</label>
						<select
							value={ localFilters.dateRange }
							onChange={ ( e ) =>
								handleFilterChange(
									'dateRange',
									e.target.value
								)
							}
							className="helix-select"
						>
							<option value="all">All Dates</option>
							<option value="today">Today</option>
							<option value="yesterday">Yesterday</option>
							<option value="week">This Week</option>
							<option value="month">This Month</option>
							<option value="quarter">This Quarter</option>
							<option value="year">This Year</option>
						</select>
					</div>
				</div>
			</div>

			<div className="helix-post-filters__actions">
				<button
					className="helix-button helix-button--primary"
					onClick={ handleApplyFilters }
				>
					Apply Filters
				</button>
				{ hasActiveFilters() && (
					<button
						className="helix-button helix-button--secondary"
						onClick={ handleClearFilters }
					>
						Clear Filters
					</button>
				) }
			</div>
		</div>
	);
}
