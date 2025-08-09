<?php
/**
 * Customizes the WordPress admin menu for Helix.
 * This removes unwanted menu items and keeps only the ones you want
 *
 * @package Helix
 */

add_action(
	'current_screen',
	function ( $current_screen ) {
		if ( ! $current_screen || 'toplevel_page_helix' !== $current_screen->id ) {
			return;
		}

		// 1) Remove default WordPress admin menus when viewing Helix.
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

		// 2) Ensure the "WordPress Admin" return link is present on first load.
		if ( ! get_option( 'helix_use_default_admin', false ) ) {
			global $admin_page_hooks;
			if ( ! isset( $admin_page_hooks['wordpress-admin'] ) ) {
				add_menu_page(
					'WordPress Admin',
					'WordPress Admin',
					'read',
					'wordpress-admin',
					'wordpress_admin_callback',
					'dashicons-wordpress',
					2
				);
			}
		}

		// 3) Add custom Helix menu items.
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
	},
	10
);

/**
 * Ensure the "WordPress Admin" return link is present when landing on Helix, even on the first load
 * after switching modes in the same request.
 */

/**
 * Remove all admin menu separators.
 */
function remove_all_admin_menu_separators() {
	global $menu;
	if ( is_array( $menu ) ) {
		foreach ( $menu as $key => $item ) {
			// Check if menu item is a separator.
			if ( false !== strpos( $item[4], 'wp-menu-separator' ) ) {
				unset( $menu[ $key ] );
			}
		}
	}
}

/**
 * Add WordPress Admin menu item conditionally.
 */

add_action(
	'admin_menu',
	function () {
		// Only show the "WordPress Admin" link when in Helix mode.
		$use_default_admin = get_option( 'helix_use_default_admin', false );
		if ( $use_default_admin ) {
			return;
		}

		// Add a menu item to go back to default WordPress admin.
		add_menu_page(
			'WordPress Admin',           // Page title.
			'WordPress Admin',           // Menu title.
			'read',                      // Capability.
			'wordpress-admin',           // Menu slug.
			'wordpress_admin_callback',  // Callback function.
			'dashicons-wordpress',       // Icon.
			2                           // Position (after main Helix menu).
		);
	},
	1000
);

/**
 * Add custom Helix menu items (only when on Helix page).
 */
/* previous current_screen callbacks combined into the single handler above */

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
	echo '<div id="helix-posts-root"></div>';
}

/**
 * Callback function for Users menu item.
 */
function helix_users_callback() {
	echo '<div id="helix-users-root"></div>';
}
