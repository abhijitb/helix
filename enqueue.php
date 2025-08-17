<?php
/**
 * Enqueues Helix assets and exposes configuration to the frontend.
 *
 * @package Helix
 */

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		// Define Helix admin pages that need the React app.
		$helix_pages = array(
			'toplevel_page_helix',
			'toplevel_page_helix-posts',
			'toplevel_page_helix-users',
			'toplevel_page_helix-settings',
		);

		if ( ! in_array( $hook, $helix_pages, true ) ) {
			return;
		}

		wp_enqueue_script(
			'helix-app',
			plugin_dir_url( __FILE__ ) . 'build/index.js',
			array(),
			'0.1.0',
			array()
		);

		// Enqueue the CSS file built by Vite.
		$css_files = glob( plugin_dir_path( __FILE__ ) . 'build/assets/*.css' );
		if ( ! empty( $css_files ) ) {
			$css_file = basename( $css_files[0] );
			wp_enqueue_style(
				'helix-app-styles',
				plugin_dir_url( __FILE__ ) . 'build/assets/' . $css_file,
				array(),
				'0.1.0'
			);
		}

		// Get the original route that was redirected.
		$original_route = filter_input( INPUT_GET, 'helix_route', FILTER_SANITIZE_URL );
		$original_route = $original_route ? esc_url_raw( $original_route ) : '/wp-admin/';

		wp_localize_script(
			'helix-app',
			'helixData',
			array(
				'restUrl'       => esc_url_raw( rest_url( 'helix/v1/' ) ),
				'wpRestUrl'     => esc_url_raw( rest_url( 'wp/v2/' ) ),
				'nonce'         => wp_create_nonce( 'wp_rest' ),
				'user'          => wp_get_current_user(),
				'originalRoute' => $original_route,
				'adminUrl'      => admin_url(),
			)
		);
	}
);
