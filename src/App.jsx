import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings/Settings';
import Posts from './pages/Posts/Posts';

// Main App component for the dashboard page
export default function App() {
	return <Dashboard />;
}

// Posts page component
function PostsApp() {
	return <Posts />;
}

// Users page component
function UsersApp() {
	return (
		<div className="helix-page">
			<h1>Users Management</h1>
			<p>Users management interface will be implemented here.</p>
		</div>
	);
}

// Mount components based on container element
document.addEventListener( 'DOMContentLoaded', function () {
	// Main Helix app
	const helixRoot = document.getElementById( 'helix-root' );
	if ( helixRoot ) {
		const root = createRoot( helixRoot );
		root.render( <App /> );
	}

	// Settings page
	const settingsRoot = document.getElementById( 'helix-settings-root' );
	if ( settingsRoot ) {
		const root = createRoot( settingsRoot );
		root.render( <Settings /> );
	}

	// Posts page
	const postsRoot = document.getElementById( 'helix-posts-root' );
	// eslint-disable-next-line no-console
	console.log( 'Posts root element:', postsRoot );
	if ( postsRoot ) {
		// eslint-disable-next-line no-console
		console.log( 'Creating Posts app root' );
		const root = createRoot( postsRoot );
		root.render( <PostsApp /> );
		// eslint-disable-next-line no-console
		console.log( 'Posts app rendered' );
	} else {
		// eslint-disable-next-line no-console
		console.log( 'Posts root element not found' );
	}

	// Users page
	const usersRoot = document.getElementById( 'helix-users-root' );
	if ( usersRoot ) {
		const root = createRoot( usersRoot );
		root.render( <UsersApp /> );
	}
} );
