<?php
/**
 * Customize the WordPress admin menu for Helix
 * This removes unwanted menu items and keeps only the ones you want
 */

add_action('admin_menu', function () {
    // Only customize menu when on Helix page
    if (!isset($_GET['page']) || $_GET['page'] !== 'helix') {
        return;
    }
    
    // Remove all default WordPress admin menus
    remove_menu_page('index.php');                    // Dashboard
    remove_menu_page('edit.php');                     // Posts
    remove_menu_page('upload.php');                   // Media
    remove_menu_page('edit.php?post_type=page');      // Pages
    remove_menu_page('edit-comments.php');            // Comments
    remove_menu_page('themes.php');                   // Appearance
    remove_menu_page('plugins.php');                  // Plugins
    remove_menu_page('users.php');                    // Users
    remove_menu_page('tools.php');                    // Tools
    remove_menu_page('options-general.php');          // Settings

    // Remove all admin menu separators
    remove_all_admin_menu_separators();
}, 999); // High priority to run after other plugins

function remove_all_admin_menu_separators() {
    global $menu;
    if (is_array($menu)) {
        foreach ($menu as $key => $item) {
            // Check if menu item is a separator
            if ( false !== strpos( $item[4], 'wp-menu-separator' ) ) {
                unset( $menu[ $key ] );
            }
        }
    }
}

/**
 * Add custom menu items
 */


// Add WordPress Admin menu item conditionally
add_action('admin_menu', function () {
    // Reset to Helix mode when accessing Helix page (do this before checking the option)
    if (isset($_GET['page']) && $_GET['page'] === 'helix') {
        update_option('helix_use_default_admin', false);
    }
    
    // Only show the "WordPress Admin" link when in Helix mode.
    $use_default_admin = get_option('helix_use_default_admin', false);
    if ($use_default_admin) {
        return;
    }

    // Add a menu item to go back to default WordPress admin
    add_menu_page(
        'WordPress Admin',           // Page title
        'WordPress Admin',           // Menu title
        'read',                      // Capability
        'wordpress-admin',           // Menu slug
        'wordpress_admin_callback',  // Callback function
        'dashicons-wordpress',       // Icon
        2                           // Position (after main Helix menu)
    );
}, 1000); // Higher priority to run after menu removal

// Add custom Helix menu items (only when on Helix page)
add_action('admin_menu', function () {
    // Only add when on Helix page
    if (!isset($_GET['page']) || $_GET['page'] !== 'helix') {
        return;
    }
    
    // Example: Add a Posts menu item
    add_menu_page(
        'Helix Posts',
        'Posts',
        'edit_posts',
        'helix-posts',
        'helix_posts_callback',
        'dashicons-admin-post',
        3
    );
    
    // Example: Add a Users menu item
    add_menu_page(
        'Helix Users',
        'Users',
        'list_users',
        'helix-users',
        'helix_users_callback',
        'dashicons-admin-users',
        4
    );
    
}, 1001); // Even higher priority to run after WordPress Admin menu

// Callback functions for custom menu items
function wordpress_admin_callback() {
    // Set the option to use default WordPress admin
    update_option('helix_use_default_admin', true);
    
    // Show a clean message and let the user navigate naturally
    ?>
    <div style="text-align: center; padding: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2>✓ Switched to WordPress Admin</h2>
        <p>You can now navigate to any WordPress admin page normally.</p>
        <p><a href="<?php echo admin_url('index.php'); ?>" class="button button-primary">Go to Dashboard</a></p>
        <p><a href="<?php echo admin_url('edit.php'); ?>" class="button">Posts</a> 
           <a href="<?php echo admin_url('users.php'); ?>" class="button">Users</a> 
           <a href="<?php echo admin_url('options-general.php'); ?>" class="button">Settings</a></p>
    </div>
    <?php
}

function helix_posts_callback() {
    echo '<div id="helix-posts-root"></div>';
}

function helix_users_callback() {
    echo '<div id="helix-users-root"></div>';
}
 