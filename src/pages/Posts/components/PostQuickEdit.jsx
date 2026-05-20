import React, { useState, useEffect, useRef } from 'react';
import './PostQuickEdit.css';

const API_BASE =
	window.helixData?.wpRestUrl || window.location.origin + '/wp-json/wp/v2/';

/**
 * Quick Edit Modal Component
 * Inline editing of post title, slug, excerpt, categories, and tags.
 */
export default function PostQuickEdit( { post, onClose, onSaved } ) {
	const [ title, setTitle ] = useState( '' );
	const [ slug, setSlug ] = useState( '' );
	const [ excerpt, setExcerpt ] = useState( '' );
	const [ selectedCategories, setSelectedCategories ] = useState( [] );
	const [ tagsInput, setTagsInput ] = useState( '' );
	const [ categories, setCategories ] = useState( [] );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const modalRef = useRef( null );

	// Populate form from post data
	useEffect( () => {
		if ( post ) {
			setTitle( post.title?.rendered || '' );
			setSlug( post.slug || '' );
			setExcerpt(
				post.excerpt?.rendered
					? post.excerpt.rendered.replace( /<[^>]*>/g, '' )
					: ''
			);
			// Extract existing category IDs from embedded terms
			const catIds =
				post._embedded?.[ 'wp:term' ]?.[ 0 ]?.map(
					( term ) => term.id
				) || [];
			setSelectedCategories( catIds );

			// Extract existing tag names
			const tagNames =
				post._embedded?.[ 'wp:term' ]?.[ 1 ]?.map(
					( tag ) => tag.name
				) || [];
			setTagsInput( tagNames.join( ', ' ) );
		}
	}, [ post ] );

	// Fetch all categories for checkboxes
	useEffect( () => {
		const fetchCategories = async () => {
			try {
				const response = await fetch(
					`${ API_BASE }categories?per_page=100`
				);
				if ( response.ok ) {
					const data = await response.json();
					setCategories( data );
				}
			} catch ( err ) {
				// Silently fail - categories list is non-critical
			}
		};
		fetchCategories();
	}, [] );

	// Close on Escape key
	useEffect( () => {
		const handleKeyDown = ( e ) => {
			if ( e.key === 'Escape' ) {
				onClose();
			}
		};
		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ onClose ] );

	// Close on backdrop click
	const handleBackdropClick = ( e ) => {
		if ( modalRef.current && ! modalRef.current.contains( e.target ) ) {
			onClose();
		}
	};

	// Toggle a category selection
	const handleCategoryToggle = ( catId ) => {
		setSelectedCategories( ( prev ) =>
			prev.includes( catId )
				? prev.filter( ( id ) => id !== catId )
				: [ ...prev, catId ]
		);
	};

	// Save changes via REST API
	const handleSave = async () => {
		setSaving( true );
		setError( null );

		try {
			const body = {
				title,
				slug,
				excerpt,
				categories: selectedCategories,
				tags:
					post._embedded?.[ 'wp:term' ]?.[ 1 ]?.map(
						( tag ) => tag.id
					) || [],
			};

			const response = await fetch( `${ API_BASE }posts/${ post.id }`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.helixData?.nonce || '',
				},
				body: JSON.stringify( body ),
			} );

			if ( ! response.ok ) {
				const errData = await response.json().catch( () => ( {} ) );
				throw new Error(
					errData.message ||
						`Failed to update post (status ${ response.status })`
				);
			}

			onSaved();
		} catch ( err ) {
			setError( err.message );
		} finally {
			setSaving( false );
		}
	};

	return (
		<div
			className="helix-quick-edit-overlay"
			onMouseDown={ handleBackdropClick }
			role="presentation"
		>
			<div className="helix-quick-edit-modal" ref={ modalRef }>
				<div className="helix-quick-edit-modal__header">
					<h2>Quick Edit: { post.title?.rendered }</h2>
					<button
						className="helix-quick-edit-modal__close"
						onClick={ onClose }
						title="Close"
					>
						×
					</button>
				</div>

				<div className="helix-quick-edit-modal__body">
					{ error && (
						<div className="helix-quick-edit-error">{ error }</div>
					) }

					<div className="helix-quick-edit-field">
						<label htmlFor="qe-title">Title</label>
						<input
							id="qe-title"
							type="text"
							className="helix-input"
							value={ title }
							onChange={ ( e ) => setTitle( e.target.value ) }
						/>
					</div>

					<div className="helix-quick-edit-field">
						<label htmlFor="qe-slug">Slug</label>
						<input
							id="qe-slug"
							type="text"
							className="helix-input"
							value={ slug }
							onChange={ ( e ) => setSlug( e.target.value ) }
						/>
					</div>

					<div className="helix-quick-edit-field">
						<label htmlFor="qe-excerpt">Excerpt</label>
						<textarea
							id="qe-excerpt"
							className="helix-input helix-textarea"
							rows={ 4 }
							value={ excerpt }
							onChange={ ( e ) => setExcerpt( e.target.value ) }
						/>
					</div>

					<div className="helix-quick-edit-field">
						<label>Categories</label>
						<div className="helix-quick-edit-categories">
							{ categories.map( ( cat ) => (
								<label
									key={ cat.id }
									className="helix-quick-edit-category-label"
								>
									<input
										type="checkbox"
										checked={ selectedCategories.includes(
											cat.id
										) }
										onChange={ () =>
											handleCategoryToggle( cat.id )
										}
									/>{ ' ' }
									{ cat.name }
								</label>
							) ) }
						</div>
					</div>

					<div className="helix-quick-edit-field">
						<label htmlFor="qe-tags">Tags</label>
						<input
							id="qe-tags"
							type="text"
							className="helix-input"
							value={ tagsInput }
							onChange={ ( e ) => setTagsInput( e.target.value ) }
							placeholder="Comma-separated tag names"
						/>
						<p className="helix-quick-edit-hint">
							Tag editing via the quick editor is limited. Use the
							full editor for advanced tag management.
						</p>
					</div>
				</div>

				<div className="helix-quick-edit-modal__footer">
					<button
						className="helix-button helix-button--secondary"
						onClick={ onClose }
						disabled={ saving }
					>
						Cancel
					</button>
					<button
						className="helix-button helix-button--primary"
						onClick={ handleSave }
						disabled={ saving || ! title.trim() }
					>
						{ saving ? 'Saving...' : 'Save Changes' }
					</button>
				</div>
			</div>
		</div>
	);
}
