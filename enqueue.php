<?php
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_helix') return;

    wp_enqueue_script('helix-app', plugin_dir_url(__FILE__) . 'build/index.js', [], null, true);
    wp_localize_script('helix-app', 'helixData', [
        'restUrl' => esc_url_raw(rest_url('helix/v1/')),
        'nonce' => wp_create_nonce('wp_rest'),
        'user' => wp_get_current_user(),
    ]);
});
