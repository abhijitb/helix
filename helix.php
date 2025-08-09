<?php
/**
 * Main plugin file that bootstraps the Helix admin interface.
 *
 * @package Helix
 */

/**
 * Plugin Name: Helix – Modern WP Admin
 * Description: A React-powered replacement for the WordPress admin UI.
 * Version: 0.1.0
 * Author: Abhijit Bhatnagar
 */

require_once __DIR__ . '/admin/init.php';
require_once __DIR__ . '/admin/rest-routes.php';
require_once __DIR__ . '/admin/disable-wp-admin.php';
require_once __DIR__ . '/admin/menu-customization.php';
require_once __DIR__ . '/enqueue.php';
