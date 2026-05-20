import React, { useState, useEffect } from 'react';
import './PostFilters.css';

/**
 * Post Filters Component - Search and filtering controls
 */
export default function PostFilters( { filters, onFilterChange } ) {
	const [ authors, setAuthors ] = useState( [] );
	const [ categories, setCategories ] = useState( [] );
	const [ tags, setTags ] = useState( [] );
	const [ localFilters, setLocalFilters ] = useState( filters );
	const [ isExpanded, setIsExpanded ] = useState( false );

	useEffect( () => {
		fetchAuthors();
		fetchCategories();
		fetchTags();
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
		} catch ( error ) {}
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
		} catch ( error ) {}
	};

	/**
	 * Fetch tags for filter dropdown
	 */
	const fetchTags = async () => {
		try {
			const response = await fetch(
				`${
					window.helixData?.wpRestUrl ||
					window.location.origin + '/wp-json/wp/v2/'
				}tags?per_page=100`
			);
			if ( response.ok ) {
				const tagsData = await response.json();
				setTags( tagsData );
			}
		} catch ( error ) {}
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
			category: 'all',
			tag: 'all',
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
			localFilters.category !== 'all' ||
			localFilters.tag !== 'all' ||
			localFilters.dateRange !== 'all'
		);
	};

	return (
		<div className="helix-post-filters">
			<div
				className="helix-post-filters__header"
				style={ {
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-end',
					marginBottom: isExpanded ? '20px' : '0',
					gap: '16px',
				} }
			>
				<div
					className="helix-post-filters__search"
					style={ { flex: 1, margin: 0 } }
				>
					<label className="helix-filter-label">Search Posts</label>
					<div style={ { display: 'flex', gap: '8px' } }>
						<input
							type="text"
							placeholder="Search posts..."
							value={ localFilters.search }
							onChange={ ( e ) =>
								handleFilterChange( 'search', e.target.value )
							}
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' ) {
									handleApplyFilters();
								}
							} }
							className="helix-input"
							style={ { flex: 1 } }
						/>
						<button
							className="helix-button helix-button--primary"
							onClick={ handleApplyFilters }
						>
							Search
						</button>
					</div>
				</div>
				<button
					className="helix-button helix-button--secondary"
					onClick={ () => setIsExpanded( ! isExpanded ) }
				>
					{ isExpanded
						? 'Hide Advanced Filters'
						: 'Advanced Filters' }
				</button>
			</div>

			{ isExpanded && (
				<>
					<div
						className="helix-post-filters__row"
						style={ { marginTop: '20px' } }
					>
						<div
							className="helix-post-filters__controls"
							style={ { flex: 1 } }
						>
							<div className="helix-filter-group">
								<label className="helix-filter-label">
									Status
								</label>
								<select
									value={ localFilters.status }
									onChange={ ( e ) =>
										handleFilterChange(
											'status',
											e.target.value
										)
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
								<label className="helix-filter-label">
									Author
								</label>
								<select
									value={ localFilters.author }
									onChange={ ( e ) =>
										handleFilterChange(
											'author',
											e.target.value
										)
									}
									className="helix-select"
								>
									<option value="all">All Authors</option>
									{ authors.map( ( author ) => (
										<option
											key={ author.id }
											value={ author.id }
										>
											{ author.name }
										</option>
									) ) }
								</select>
							</div>

							<div className="helix-filter-group">
								<label className="helix-filter-label">
									Category
								</label>
								<select
									value={ localFilters.category || 'all' }
									onChange={ ( e ) =>
										handleFilterChange(
											'category',
											e.target.value
										)
									}
									className="helix-select"
								>
									<option value="all">All Categories</option>
									{ categories.map( ( cat ) => (
										<option key={ cat.id } value={ cat.id }>
											{ cat.name }
										</option>
									) ) }
								</select>
							</div>

							<div className="helix-filter-group">
								<label className="helix-filter-label">
									Tag
								</label>
								<select
									value={ localFilters.tag || 'all' }
									onChange={ ( e ) =>
										handleFilterChange(
											'tag',
											e.target.value
										)
									}
									className="helix-select"
								>
									<option value="all">All Tags</option>
									{ tags.map( ( t ) => (
										<option key={ t.id } value={ t.id }>
											{ t.name }
										</option>
									) ) }
								</select>
							</div>

							<div className="helix-filter-group">
								<label className="helix-filter-label">
									Date Range
								</label>
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
									<option value="quarter">
										This Quarter
									</option>
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
				</>
			) }
		</div>
	);
}
