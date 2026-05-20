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
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
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

/**
 * Highly prioritized CSS injection in admin_head to override legacy WordPress styling
 * instantly on Helix pages, hiding legacy nags and styling the loading screen seamlessly.
 */
add_action(
	'admin_head',
	function () {
		$screen = get_current_screen();
		if ( ! $screen ) {
			return;
		}

		$helix_pages = array(
			'toplevel_page_helix',
			'toplevel_page_helix-posts',
			'toplevel_page_helix-users',
			'toplevel_page_helix-settings',
		);

		if ( ! in_array( $screen->id, $helix_pages, true ) ) {
			return;
		}

		?>
		<style id="helix-layout-overrides">
			/* Style the legacy WordPress containers to blend with Helix's theme instantly */
			body.toplevel_page_helix,
			body.toplevel_page_helix-posts,
			body.toplevel_page_helix-users,
			body.toplevel_page_helix-settings {
				background-color: #fafaf9 !important;
			}
			.toplevel_page_helix #wpcontent,
			.toplevel_page_helix-posts #wpcontent,
			.toplevel_page_helix-users #wpcontent,
			.toplevel_page_helix-settings #wpcontent {
				background: #fafaf9 !important;
				padding-left: 0 !important;
				margin-left: 160px; /* Adjust spacing to account for WP menu fold */
				transition: margin-left 0.15s ease-in-out;
			}
			@media only screen and (max-width: 960px) {
				.toplevel_page_helix #wpcontent,
				.toplevel_page_helix-posts #wpcontent,
				.toplevel_page_helix-users #wpcontent,
				.toplevel_page_helix-settings #wpcontent {
					margin-left: 36px;
				}
			}
			@media only screen and (max-width: 782px) {
				.toplevel_page_helix #wpcontent,
				.toplevel_page_helix-posts #wpcontent,
				.toplevel_page_helix-users #wpcontent,
				.toplevel_page_helix-settings #wpcontent {
					margin-left: 0;
					padding-top: 46px !important;
				}
			}
			.toplevel_page_helix #wpbody-content,
			.toplevel_page_helix-posts #wpbody-content,
			.toplevel_page_helix-users #wpbody-content,
			.toplevel_page_helix-settings #wpbody-content {
				padding-bottom: 0 !important;
			}
			/* Instantly hide administrative noise (update alerts, notices, panel toggles) */
			.toplevel_page_helix .notice,
			.toplevel_page_helix .update-nag,
			.toplevel_page_helix #screen-meta-links,
			.toplevel_page_helix .updated,
			.toplevel_page_helix .error,
			.toplevel_page_helix-posts .notice,
			.toplevel_page_helix-posts .update-nag,
			.toplevel_page_helix-posts #screen-meta-links,
			.toplevel_page_helix-posts .updated,
			.toplevel_page_helix-posts .error,
			.toplevel_page_helix-users .notice,
			.toplevel_page_helix-users .update-nag,
			.toplevel_page_helix-users #screen-meta-links,
			.toplevel_page_helix-users .updated,
			.toplevel_page_helix-users .error,
			.toplevel_page_helix-settings .notice,
			.toplevel_page_helix-settings .update-nag,
			.toplevel_page_helix-settings #screen-meta-links,
			.toplevel_page_helix-settings .updated,
			.toplevel_page_helix-settings .error {
				display: none !important;
			}
			/* Center and animate loading states */
			.helix-loader-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				min-height: 75vh;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif;
				color: #44403c;
			}
			.helix-loader-spinner {
				width: 36px;
				height: 36px;
				border: 3px solid #e7e5e4;
				border-top: 3px solid #78716c;
				border-radius: 50%;
				animation: helix-spin 0.8s linear infinite;
				margin-bottom: 16px;
			}
			.helix-loader-text {
				font-size: 14px;
				font-weight: 500;
				color: #78716c;
				letter-spacing: -0.01em;
			}
			@keyframes helix-spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		</style>
		<?php
	}
);
