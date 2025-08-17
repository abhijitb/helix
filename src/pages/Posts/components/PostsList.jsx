import React from 'react';
import PostRow from './PostRow';
import './PostsList.css';

/**
 * Posts List Component - Displays posts in a table format
 */
export default function PostsList( {
	posts,
	loading,
	pagination,
	onPageChange,
	onDelete,
	onStatusChange,
} ) {
	if ( loading ) {
		return (
			<div className="helix-loading">
				<div className="helix-loading-spinner"></div>
				<p>Loading posts...</p>
			</div>
		);
	}

	if ( posts.length === 0 ) {
		return (
			<div className="helix-empty-state">
				<h3>No posts found</h3>
				<p>Try adjusting your filters or create a new post.</p>
			</div>
		);
	}

	return (
		<div className="helix-posts-list">
			<div className="helix-posts-table-container">
				<table className="helix-posts-table">
					<thead>
						<tr>
							<th className="helix-posts-table__checkbox">
								<input type="checkbox" />
							</th>
							<th className="helix-posts-table__title">Title</th>
							<th className="helix-posts-table__author">
								Author
							</th>
							<th className="helix-posts-table__categories">
								Categories
							</th>
							<th className="helix-posts-table__tags">Tags</th>
							<th className="helix-posts-table__status">
								Status
							</th>
							<th className="helix-posts-table__date">Date</th>
							<th className="helix-posts-table__actions">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{ posts.map( ( post ) => (
							<PostRow
								key={ post.id }
								post={ post }
								onDelete={ onDelete }
								onStatusChange={ onStatusChange }
							/>
						) ) }
					</tbody>
				</table>
			</div>

			{ pagination.totalPages > 1 && (
				<div className="helix-pagination">
					<div className="helix-pagination__info">
						Showing{ ' ' }
						{ ( pagination.page - 1 ) * pagination.perPage + 1 } to{ ' ' }
						{ Math.min(
							pagination.page * pagination.perPage,
							pagination.total
						) }{ ' ' }
						of { pagination.total } posts
					</div>
					<div className="helix-pagination__controls">
						<button
							className="helix-button helix-button--secondary"
							disabled={ pagination.page === 1 }
							onClick={ () =>
								onPageChange( pagination.page - 1 )
							}
						>
							Previous
						</button>
						<span className="helix-pagination__current">
							Page { pagination.page } of{ ' ' }
							{ pagination.totalPages }
						</span>
						<button
							className="helix-button helix-button--secondary"
							disabled={
								pagination.page === pagination.totalPages
							}
							onClick={ () =>
								onPageChange( pagination.page + 1 )
							}
						>
							Next
						</button>
					</div>
				</div>
			) }
		</div>
	);
}
