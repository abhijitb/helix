import React, { useState, useEffect, useRef } from 'react';
import './PostRow.css';

/**
 * Individual Post Row Component
 */
export default function PostRow( { post, onDelete, onStatusChange } ) {
	const [ showActions, setShowActions ] = useState( false );
	const actionsRef = useRef( null );

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if (
				actionsRef.current &&
				! actionsRef.current.contains( event.target )
			) {
				setShowActions( false );
			}
		};

		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [] );

	/**
	 * Format date for display
	 */
	const formatDate = ( dateString ) => {
		const date = new Date( dateString );
		return date.toLocaleDateString( 'en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} );
	};

	/**
	 * Get status badge styling
	 */
	const getStatusBadge = ( status ) => {
		const statusClasses = {
			publish: 'helix-status-badge--publish',
			draft: 'helix-status-badge--draft',
			private: 'helix-status-badge--private',
			pending: 'helix-status-badge--pending',
			future: 'helix-status-badge--future',
		};

		return (
			<span
				className={ `helix-status-badge ${
					statusClasses[ status ] || ''
				}` }
			>
				{ status.charAt( 0 ).toUpperCase() + status.slice( 1 ) }
			</span>
		);
	};

	/**
	 * Handle status change
	 */
	const handleStatusChange = ( newStatus ) => {
		onStatusChange( post.id, newStatus );
		setShowActions( false );
	};

	/**
	 * Handle post deletion
	 */
	const handleDelete = () => {
		onDelete( post.id );
		setShowActions( false );
	};

	/**
	 * Handle edit post (open in new tab)
	 */
	const handleEditPost = ( postData ) => {
		// Open WordPress admin edit page in new tab
		const editUrl = `${
			window.helixData?.adminUrl || '/wp-admin/'
		}post.php?post=${ postData.id }&action=edit`;
		window.open( editUrl, '_blank' );
		setShowActions( false );
	};

	/**
	 * Handle quick edit (placeholder for future implementation)
	 */
	const handleQuickEdit = ( postData ) => {
		// TODO: Implement quick edit modal
		// eslint-disable-next-line no-console
		console.log( 'Quick edit for post:', postData.id );
		setShowActions( false );
	};

	/**
	 * Get excerpt from content
	 */
	const getExcerpt = ( content ) => {
		// Remove HTML tags and get first 100 characters
		const textContent = content.replace( /<[^>]*>/g, '' );
		return textContent.length > 100
			? textContent.substring( 0, 100 ) + '...'
			: textContent;
	};

	return (
		<tr className="helix-post-row">
			<td className="helix-post-row__checkbox">
				<input type="checkbox" />
			</td>
			<td className="helix-post-row__title">
				<div className="helix-post-title">
					<h4 className="helix-post-title__text">
						<a
							href={ post.link }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ post.title.rendered }
						</a>
					</h4>
					<p className="helix-post-title__excerpt">
						{ getExcerpt( post.content.rendered ) }
					</p>
					<div className="helix-post-quick-actions">
						<button
							className="helix-button helix-button--small helix-button--secondary"
							onClick={ () => handleEditPost( post ) }
							title="Edit Post"
						>
							Edit
						</button>
						<button
							className="helix-button helix-button--small helix-button--secondary"
							onClick={ () => window.open( post.link, '_blank' ) }
							title="View Post"
						>
							View
						</button>
						<button
							className="helix-button helix-button--small helix-button--secondary"
							onClick={ () =>
								window.open(
									`${ post.link }?preview=true`,
									'_blank'
								)
							}
							title="Preview Post"
						>
							Preview
						</button>
						{ post.status !== 'publish' && (
							<button
								className="helix-button helix-button--small helix-button--primary"
								onClick={ () =>
									handleStatusChange( 'publish' )
								}
								title="Publish Post"
							>
								Publish
							</button>
						) }
						{ post.status === 'publish' && (
							<button
								className="helix-button helix-button--small helix-button--secondary"
								onClick={ () => handleStatusChange( 'draft' ) }
								title="Move to Draft"
							>
								Draft
							</button>
						) }
					</div>
				</div>
			</td>
			<td className="helix-post-row__author">
				{ post._embedded?.author?.[ 0 ]?.name || 'Unknown' }
			</td>
			<td className="helix-post-row__categories">
				{ post._embedded?.[ 'wp:term' ]?.[ 0 ]?.map( ( term ) => (
					<span key={ term.id } className="helix-category-tag">
						{ term.name }
					</span>
				) ) || 'Uncategorized' }
			</td>
			<td className="helix-post-row__tags">
				{ post._embedded?.[ 'wp:term' ]?.[ 1 ]?.map( ( tag ) => (
					<span key={ tag.id } className="helix-tag">
						{ tag.name }
					</span>
				) ) || 'No tags' }
			</td>
			<td className="helix-post-row__status">
				{ getStatusBadge( post.status ) }
			</td>
			<td className="helix-post-row__date">
				{ formatDate( post.date ) }
			</td>
			<td className="helix-post-row__actions">
				<div className="helix-post-actions" ref={ actionsRef }>
					<button
						className="helix-button helix-button--icon"
						onClick={ () => setShowActions( ! showActions ) }
						title="More actions"
					>
						⋮
					</button>

					{ showActions && (
						<div className="helix-post-actions__dropdown">
							<button
								className="helix-dropdown-item"
								onClick={ () => handleQuickEdit( post ) }
							>
								Quick Edit
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () =>
									handleStatusChange( 'private' )
								}
								disabled={ post.status === 'private' }
							>
								Make Private
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () =>
									handleStatusChange( 'pending' )
								}
								disabled={ post.status === 'pending' }
							>
								Mark Pending
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () => {
									// eslint-disable-next-line no-undef
									if ( navigator.clipboard ) {
										// eslint-disable-next-line no-undef
										navigator.clipboard.writeText(
											post.link
										);
									} else {
										// Fallback for older browsers
										// eslint-disable-next-line no-undef
										const textArea =
											// eslint-disable-next-line no-undef
											document.createElement(
												'textarea'
											);
										textArea.value = post.link;
										// eslint-disable-next-line no-undef
										document.body.appendChild( textArea );
										textArea.select();
										// eslint-disable-next-line no-undef
										document.execCommand( 'copy' );
										// eslint-disable-next-line no-undef
										document.body.removeChild( textArea );
									}
									setShowActions( false );
								} }
							>
								Copy Link
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () =>
									handleStatusChange( 'publish' )
								}
								disabled={ post.status === 'publish' }
							>
								Publish
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () => handleStatusChange( 'draft' ) }
								disabled={ post.status === 'draft' }
							>
								Move to Draft
							</button>
							<button
								className="helix-dropdown-item"
								onClick={ () =>
									handleStatusChange( 'private' )
								}
								disabled={ post.status === 'private' }
							>
								Make Private
							</button>
							<hr className="helix-dropdown-divider" />
							<button
								className="helix-dropdown-item helix-dropdown-item--danger"
								onClick={ handleDelete }
							>
								Delete
							</button>
						</div>
					) }
				</div>
			</td>
		</tr>
	);
}
