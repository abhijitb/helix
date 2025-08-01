<?php
add_action('rest_api_init', function () {
    register_rest_route('helix/v1', '/settings', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return [
                'siteTitle' => get_option('blogname'),
                'language' => get_option('WPLANG'),
            ];
        }
    ]);
});
