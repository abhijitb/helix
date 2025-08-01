<?php
add_action('admin_init', function () {
    $screen = get_current_screen();
    if (!is_admin() || $screen->id === 'toplevel_page_helix') return;
    wp_redirect(admin_url('admin.php?page=helix'));
    exit;
});
