<?php
/**
 * Enqueues Helix assets and exposes configuration to the frontend.
 *
 * @package Helix
 */

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( 'toplevel_page_helix' !== $hook ) {
			return;
		}

		wp_enqueue_script(
			'helix-app',
			plugin_dir_url( __FILE__ ) . 'build/index.js',
			array(),
			'0.1.0',
			array()
		);

		// Get the original route that was redirected.
		$original_route = filter_input( INPUT_GET, 'helix_route', FILTER_SANITIZE_URL );
		$original_route = $original_route ? esc_url_raw( $original_route ) : '/wp-admin/';

		wp_localize_script(
			'helix-app',
			'helixData',
			array(
				'restUrl'       => esc_url_raw( rest_url( 'helix/v1/' ) ),
				'nonce'         => wp_create_nonce( 'wp_rest' ),
				'user'          => wp_get_current_user(),
				'originalRoute' => $original_route,
				'adminUrl'      => admin_url(),
			)
		);
	}
);
