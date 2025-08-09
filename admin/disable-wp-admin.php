<?php
/**
 * Redirects classic WordPress admin requests into Helix where applicable.
 *
 * @package Helix
 */

/**
 * Check if the Helix build is ready.
 *
 * @return bool True if the build is ready, false otherwise.
 */
function helix_is_ready(): bool {
	// Ensure the built frontend exists before hijacking admin navigation.
	$plugin_base_path = plugin_dir_path( __DIR__ ); // points to helix/.
	$build_js_path    = $plugin_base_path . 'build/index.js';
	return file_exists( $build_js_path ) && is_readable( $build_js_path );
}

/**
 * Normalize a route to a relative admin route.
 *
 * @param string $url_or_path The URL or path to normalize.
 * @return string The normalized route.
 */
function helix_normalize_route( string $url_or_path ): string {
	// Convert absolute URLs to a relative admin route.
	if ( preg_match( '#^https?://#i', $url_or_path ) ) {
		$parts = wp_parse_url( $url_or_path );
		$path  = isset( $parts['path'] ) ? $parts['path'] : '/wp-admin/';
		$query = isset( $parts['query'] ) && '' !== $parts['query'] ? '?' . $parts['query'] : '';
		return $path . $query;
	}

	// Ensure it starts with /wp-admin (allow optional leading slash).
	if ( preg_match( '#^/?wp-admin#', $url_or_path ) ) {
		return str_starts_with( $url_or_path, '/' ) ? $url_or_path : '/' . $url_or_path;
	}

	return '/wp-admin/';
}

/**
 * Check if the admin should be hijacked.
 *
 * @return bool True if the admin should be hijacked, false otherwise.
 */
function helix_should_hijack_admin(): bool {
	// If user opted into default WP admin, do not hijack.
	if ( get_option( 'helix_use_default_admin', false ) ) {
		return false;
	}
	// If Helix build is unavailable, do not hijack.
	if ( ! helix_is_ready() ) {
		return false;
	}
	return true;
}

/**
 * Redirect the user to the Helix admin page after login.
 *
 * @param string $redirect_to The redirect URL.
 * @param string $requested_redirect_to The requested redirect URL.
 * @param WP_User $user The user object.
 * @return string The redirect URL.
 */
add_filter(
	'login_redirect',
	function ( $redirect_to, $requested_redirect_to, $user ) {
		// Only modify redirect for successful logins.
		if ( is_wp_error( $user ) ) {
			return $redirect_to;
		}

		// Respect plugin setting to use default WordPress admin or if Helix is not ready.
		if ( ! helix_should_hijack_admin() ) {
			return $redirect_to;
		}

		// Determine the intended post-login target.
		$intended_target = ( is_string( $requested_redirect_to ) && '' !== $requested_redirect_to )
			? $requested_redirect_to
			: $redirect_to;

		// If the target is not an admin page, do not override.
		if ( $intended_target && ! str_contains( $intended_target, 'wp-admin' ) ) {
			return $redirect_to;
		}

		// Default to the dashboard when no target provided.
		$helix_route = helix_normalize_route( $intended_target ?? '/wp-admin/' );

		// Send directly to Helix, preserving the original admin route for the React app.
		// Always use '&' because admin.php already has a query string (page=helix).
		return admin_url( 'admin.php?page=helix&helix_route=' . rawurlencode( $helix_route ) );
	},
	10,
	3
);

/**
 * Redirect the user to the Helix admin page when accessing an admin page.
 *
 * @param WP_Screen $current_screen The current screen object.
 */
add_action(
	'current_screen',
	function ( $current_screen ) {
		// Don't redirect if not in admin.
		if ( ! is_admin() ) {
			return;
		}

		// Don't redirect AJAX requests.
		if ( wp_doing_ajax() ) {
			return;
		}

		// Don't redirect REST API requests.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}

		// Don't redirect cron jobs.
		if ( defined( 'DOING_CRON' ) && DOING_CRON ) {
			return;
		}

		// Check if we're already on the helix page or WordPress admin page.
		if ( in_array( $current_screen->id, array( 'toplevel_page_helix', 'toplevel_page_wordpress-admin' ), true ) ) {
			return;
		}

		// Check if user wants to use default WordPress admin.
		$use_default_admin = get_option( 'helix_use_default_admin', false );
		if ( $use_default_admin ) {
			return;
		}

		// Don't redirect if Helix is not ready or the user opted into default admin.
		if ( ! helix_should_hijack_admin() ) {
			return;
		}

		// Don't redirect critical WordPress admin functions.
		global $pagenow;
		$critical_pages = array(
			'admin-ajax.php',
			'admin-post.php',
			'async-upload.php',
			'update.php',
			'update-core.php',
			'upgrade.php',
		);

		if ( in_array( $pagenow, $critical_pages, true ) ) {
			return;
		}

		// Capture the current admin URL to pass to Helix for routing.
		$current_url = helix_normalize_route( filter_input( INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL ) );

		// Build the redirect URL with the original path for React routing.
		// Always use '&' because admin.php already has a query string (page=helix).
		$redirect_url = admin_url( 'admin.php?page=helix&helix_route=' . rawurlencode( $current_url ) );

		// Redirect all other admin pages to Helix.
		wp_safe_redirect( $redirect_url );
		exit;
	}
);
