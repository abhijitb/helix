<?php
/**
 * Remove all admin menu separators.
 */
function remove_all_admin_menu_separators() {
	global $menu;
	if ( is_array( $menu ) ) {
		foreach ( $menu as $key => $item ) {
			// Check if menu item is a separator.
			if ( isset( $item[4] ) && false !== strpos( $item[4], 'wp-menu-separator' ) ) {
				unset( $menu[ $key ] );
			}
		}
	}
}

/**
 * Add WordPress Admin menu item conditionally and clean up default admin menu pages.
 */
add_action(
	'admin_menu',
	function () {
		global $pagenow;

		// Check if we're going to the Helix page by looking at the sanitized request.
		$page_requested    = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_URL );
		$is_helix_request  = ( 'admin.php' === $pagenow && ( 'helix' === $page_requested || strpos( $page_requested, 'helix-' ) === 0 ) );
		$use_default_admin = get_option( 'helix_use_default_admin', false );

		// Always show the WordPress Admin link when navigating to Helix, or when not in default admin mode.
		if ( $is_helix_request || ! $use_default_admin ) {
			// If this is a Helix request, ensure we're in Helix mode.
			if ( $is_helix_request ) {
				update_option( 'helix_use_default_admin', false );
			}

			// Add Helix menu items.
			add_menu_page(
				'Helix Posts',
				'Posts',
				'edit_posts',
				'helix-posts',
				'helix_posts_callback',
				'dashicons-admin-post',
				3
			);

			add_menu_page(
				'Helix Users',
				'Users',
				'list_users',
				'helix-users',
				'helix_users_callback',
				'dashicons-admin-users',
				4
			);

			add_menu_page(
				'Helix Settings',
				'Settings',
				'manage_options',
				'helix-settings',
				'helix_settings_callback',
				'dashicons-admin-settings',
				5
			);

			// Add a menu item to go back to default WordPress admin.
			add_menu_page(
				'WordPress Admin',           // Page title.
				'WordPress Admin',           // Menu title.
				'read',                      // Capability.
				'wordpress-admin',           // Menu slug.
				'wordpress_admin_callback',  // Callback function.
				'dashicons-wordpress',       // Icon.
				6                           // Position (after Settings menu).
			);

			// Remove default WordPress admin menus.
			remove_menu_page( 'index.php' );                    // Dashboard.
			remove_menu_page( 'edit.php' );                     // Posts.
			remove_menu_page( 'upload.php' );                   // Media.
			remove_menu_page( 'edit.php?post_type=page' );      // Pages.
			remove_menu_page( 'edit-comments.php' );            // Comments.
			remove_menu_page( 'themes.php' );                   // Appearance.
			remove_menu_page( 'plugins.php' );                  // Plugins.
			remove_menu_page( 'users.php' );                    // Users.
			remove_menu_page( 'tools.php' );                    // Tools.
			remove_menu_page( 'options-general.php' );          // Settings.

			// Remove all admin menu separators.
			remove_all_admin_menu_separators();
		}
	},
	1000
);

/**
 * Renders a clean loading skeleton to prevent unstyled flash before React mounts.
 */
function helix_render_skeleton( string $title ) {
	echo '<div class="helix-loader-container">
		<div class="helix-loader-spinner"></div>
		<div class="helix-loader-text">Loading ' . esc_html( $title ) . '...</div>
	</div>';
}

/**
 * Callback functions for custom menu items.
 */
function wordpress_admin_callback() {
	// Set the option to use default WordPress admin.
	update_option( 'helix_use_default_admin', true );

	// Show a clean message and let the user navigate naturally.
	?>
	<div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
		<h2>✓ Switched to WordPress Admin</h2>
		<p>You can now navigate to any WordPress admin page normally.</p>
		<p><a href="<?php echo esc_url( admin_url( 'index.php' ) ); ?>" class="button button-primary">Go to Dashboard</a></p>
		<p><a href="<?php echo esc_url( admin_url( 'edit.php' ) ); ?>" class="button">Posts</a>
			<a href="<?php echo esc_url( admin_url( 'users.php' ) ); ?>" class="button">Users</a>
			<a href="<?php echo esc_url( admin_url( 'options-general.php' ) ); ?>" class="button">Settings</a>
		</p>
	</div>
	<?php
}

/**
 * Callback function for Posts menu item.
 */
function helix_posts_callback() {
	echo '<div id="helix-posts-root">';
	helix_render_skeleton( 'Posts' );
	echo '</div>';
}

/**
 * Callback function for Users menu item.
 */
function helix_users_callback() {
	echo '<div id="helix-users-root">';
	helix_render_skeleton( 'Users' );
	echo '</div>';
}

/**
 * Callback function for Settings menu item.
 */
function helix_settings_callback() {
	echo '<div id="helix-settings-root">';
	helix_render_skeleton( 'Settings' );
	echo '</div>';
}
