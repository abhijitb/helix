import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import TwoFA from './pages/TwoFA';

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={ <Dashboard /> } />
				<Route path="/settings" element={ <Settings /> } />
				<Route path="/2fa" element={ <TwoFA /> } />
			</Routes>
		</Router>
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
	if ( postsRoot ) {
		const root = createRoot( postsRoot );
		root.render( <Dashboard /> ); // For now, render Dashboard
	}

	// Users page
	const usersRoot = document.getElementById( 'helix-users-root' );
	if ( usersRoot ) {
		const root = createRoot( usersRoot );
		root.render( <Dashboard /> ); // For now, render Dashboard
	}
} );
