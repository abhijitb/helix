<?php
add_action('current_screen', function ($current_screen) {
    // Don't redirect if not in admin
    if (!is_admin()) return;
    
    // Don't redirect AJAX requests
    if (wp_doing_ajax()) return;
    
    // Don't redirect REST API requests
    if (defined('REST_REQUEST') && REST_REQUEST) return;
    
    // Don't redirect cron jobs
    if (defined('DOING_CRON') && DOING_CRON) return;
    
    // Check if we're already on the helix page or wordpress admin page
    if ( in_array( $current_screen->id, array( 'toplevel_page_helix', 'toplevel_page_wordpress-admin' ), true ) ) {
        return;
    }
    
    // Check if user wants to use default WordPress admin
    $use_default_admin = get_option('helix_use_default_admin', false);
    if ($use_default_admin) {
        return;
    }
    
    // Don't redirect critical WordPress admin functions
    global $pagenow;
    $critical_pages = [
        'admin-ajax.php',
        'admin-post.php',
        'async-upload.php',
        'update.php',
        'update-core.php',
        'upgrade.php',
    ];
    
    if (in_array($pagenow, $critical_pages)) return;
    
    // Capture the current admin URL to pass to Helix for routing
    $current_url = $_SERVER['REQUEST_URI'];
    $query_separator = strpos($current_url, '?') !== false ? '&' : '?';
    
    // Build the redirect URL with the original path for React routing
    $redirect_url = admin_url('admin.php?page=helix' . $query_separator . 'helix_route=' . urlencode($current_url));
    
    // Redirect all other admin pages to Helix
    wp_redirect($redirect_url);
    exit;
});
