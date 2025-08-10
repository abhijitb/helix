import React, { useState, useEffect } from 'react';
import './Dashboard.css';
// Material-UI Icons
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CommentBankIcon from '@mui/icons-material/CommentBank';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Dashboard() {
	const [ dashboardData, setDashboardData ] = useState( {
		postsCount: 0,
		pagesCount: 0,
		commentsCount: 0,
		usersCount: 0,
		recentPosts: [],
		recentComments: [],
		loading: true,
	} );

	useEffect( () => {
		// Fetch dashboard data from WordPress REST API
		const fetchDashboardData = async () => {
			try {
				const [ posts, pages, comments, users ] = await Promise.all( [
					fetch(
						`${
							window.helixData?.restUrl || '/wp-json/wp/v2/'
						}posts?per_page=5`
					),
					fetch(
						`${
							window.helixData?.restUrl || '/wp-json/wp/v2/'
						}pages?per_page=5`
					),
					fetch(
						`${
							window.helixData?.restUrl || '/wp-json/wp/v2/'
						}comments?per_page=5`
					),
					fetch(
						`${
							window.helixData?.restUrl || '/wp-json/wp/v2/'
						}users?per_page=5`
					),
				] );

				const [ postsData, pagesData, commentsData, usersData ] =
					await Promise.all( [
						posts.json(),
						pages.json(),
						comments.json(),
						users.json(),
					] );

				setDashboardData( {
					postsCount:
						posts.headers.get( 'X-WP-Total' ) || postsData.length,
					pagesCount:
						pages.headers.get( 'X-WP-Total' ) || pagesData.length,
					commentsCount:
						comments.headers.get( 'X-WP-Total' ) ||
						commentsData.length,
					usersCount:
						users.headers.get( 'X-WP-Total' ) || usersData.length,
					recentPosts: postsData.slice( 0, 5 ),
					recentComments: commentsData.slice( 0, 5 ),
					loading: false,
				} );
			} catch ( error ) {
				// Error fetching dashboard data
				setDashboardData( ( prev ) => ( { ...prev, loading: false } ) );
			}
		};

		fetchDashboardData();
	}, [] );

	const StatsCard = ( {
		title,
		count,
		icon: IconComponent,
		color,
		trend,
	} ) => (
		<div className={ `helix-stats-card helix-stats-card--${ color }` }>
			<div className="helix-stats-card__icon">
				<IconComponent />
			</div>
			<div className="helix-stats-card__content">
				<div className="helix-stats-card__header">
					<h3 className="helix-stats-card__count">{ count }</h3>
					{ trend && (
						<div className="helix-stats-card__trend">
							<TrendingUpIcon className="helix-trend-icon" />
							<span>{ trend }</span>
						</div>
					) }
				</div>
				<p className="helix-stats-card__title">{ title }</p>
			</div>
		</div>
	);

	const formatDate = ( dateString ) => {
		return new Date( dateString ).toLocaleDateString( 'en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} );
	};

	if ( dashboardData.loading ) {
		return (
			<div className="helix-dashboard">
				<div className="helix-dashboard__header">
					<h1>Dashboard</h1>
				</div>
				<div className="helix-loading">
					<div className="helix-loading__spinner"></div>
					<p>Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="helix-dashboard">
			<div className="helix-dashboard__header">
				<h1>Welcome to Helix</h1>
				<p>Your modern WordPress admin experience</p>
			</div>

			{ /* Statistics Overview */ }
			<div className="helix-dashboard__stats">
				<StatsCard
					title="Posts"
					count={ dashboardData.postsCount }
					icon={ ArticleIcon }
					color="blue"
					trend="+12%"
				/>
				<StatsCard
					title="Pages"
					count={ dashboardData.pagesCount }
					icon={ DescriptionIcon }
					color="green"
					trend="+5%"
				/>
				<StatsCard
					title="Comments"
					count={ dashboardData.commentsCount }
					icon={ CommentIcon }
					color="orange"
					trend="+28%"
				/>
				<StatsCard
					title="Users"
					count={ dashboardData.usersCount }
					icon={ PeopleIcon }
					color="purple"
					trend="+3%"
				/>
			</div>

			{ /* Main Content Area */ }
			<div className="helix-dashboard__content">
				{ /* Recent Posts Widget */ }
				<div className="helix-widget">
					<div className="helix-widget__header">
						<h2>Recent Posts</h2>
						<a
							href="/wp-admin/edit.php"
							className="helix-widget__link"
						>
							View All
						</a>
					</div>
					<div className="helix-widget__content">
						{ dashboardData.recentPosts.length > 0 ? (
							<ul className="helix-posts-list">
								{ dashboardData.recentPosts.map( ( post ) => (
									<li
										key={ post.id }
										className="helix-posts-list__item"
									>
										<div className="helix-posts-list__content">
											<h3 className="helix-posts-list__title">
												<a
													href={ `/wp-admin/post.php?post=${ post.id }&action=edit` }
												>
													{ post.title.rendered ||
														'Untitled' }
												</a>
											</h3>
											<p className="helix-posts-list__date">
												{ formatDate( post.date ) }
											</p>
										</div>
										<div className="helix-posts-list__status">
											<span
												className={ `helix-status helix-status--${ post.status }` }
											>
												{ post.status }
											</span>
										</div>
									</li>
								) ) }
							</ul>
						) : (
							<p className="helix-widget__empty">
								No posts yet.{ ' ' }
								<a href="/wp-admin/post-new.php">
									Create your first post!
								</a>
							</p>
						) }
					</div>
				</div>

				{ /* Recent Comments Widget */ }
				<div className="helix-widget">
					<div className="helix-widget__header">
						<h2>Recent Comments</h2>
						<a
							href="/wp-admin/edit-comments.php"
							className="helix-widget__link"
						>
							View All
						</a>
					</div>
					<div className="helix-widget__content">
						{ dashboardData.recentComments.length > 0 ? (
							<ul className="helix-comments-list">
								{ dashboardData.recentComments.map(
									( comment ) => (
										<li
											key={ comment.id }
											className="helix-comments-list__item"
										>
											<div className="helix-comments-list__content">
												<h4 className="helix-comments-list__author">
													{ comment.author_name }
												</h4>
												<p className="helix-comments-list__excerpt">
													{ comment.content.rendered
														.replace(
															/<[^>]*>/g,
															''
														)
														.substring( 0, 100 ) }
													...
												</p>
												<p className="helix-comments-list__date">
													{ formatDate(
														comment.date
													) }
												</p>
											</div>
											<div className="helix-comments-list__status">
												<span
													className={ `helix-status helix-status--${ comment.status }` }
												>
													{ comment.status }
												</span>
											</div>
										</li>
									)
								) }
							</ul>
						) : (
							<p className="helix-widget__empty">
								No comments yet.
							</p>
						) }
					</div>
				</div>

				{ /* Quick Actions Widget */ }
				<div className="helix-widget">
					<div className="helix-widget__header">
						<h2>Quick Actions</h2>
					</div>
					<div className="helix-widget__content">
						<div className="helix-quick-actions">
							<a
								href="/wp-admin/post-new.php"
								className="helix-quick-action"
							>
								<span className="helix-quick-action__icon">
									<EditIcon />
								</span>
								<span className="helix-quick-action__text">
									Write a Post
								</span>
							</a>
							<a
								href="/wp-admin/post-new.php?post_type=page"
								className="helix-quick-action"
							>
								<span className="helix-quick-action__icon">
									<AddIcon />
								</span>
								<span className="helix-quick-action__text">
									Create a Page
								</span>
							</a>
							<a
								href="/wp-admin/upload.php"
								className="helix-quick-action"
							>
								<span className="helix-quick-action__icon">
									<CloudUploadIcon />
								</span>
								<span className="helix-quick-action__text">
									Upload Media
								</span>
							</a>
							<a
								href="/wp-admin/edit-comments.php"
								className="helix-quick-action"
							>
								<span className="helix-quick-action__icon">
									<CommentBankIcon />
								</span>
								<span className="helix-quick-action__text">
									Moderate Comments
								</span>
							</a>
						</div>
					</div>
				</div>

				{ /* WordPress News Widget */ }
				<div className="helix-widget">
					<div className="helix-widget__header">
						<h2>WordPress News</h2>
					</div>
					<div className="helix-widget__content">
						<p>
							Stay updated with the latest WordPress news and
							updates.
						</p>
						<div className="helix-news-placeholder">
							<div className="helix-news-item">
								<h4>
									WordPress 6.4 &ldquo;Shirley&rdquo; Released
								</h4>
								<p>
									The latest version includes new features and
									improvements...
								</p>
								<a
									href="https://wordpress.org/news/"
									target="_blank"
									rel="noopener noreferrer"
								>
									Read more
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
