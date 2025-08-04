<?php
add_action('admin_menu', function () {
    add_menu_page('Helix', 'Helix', 'read', 'helix', function () {
        echo '<div id="helix-root"></div>';
    }, 'dashicons-admin-generic', 1);
});
