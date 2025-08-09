<?php
/**
 * Registers the Helix admin top-level menu page.
 *
 * @package Helix
 */

add_action(
	'admin_menu',
	function () {
		$helix_hook_suffix = add_menu_page(
			'Helix',
			'Helix',
			'read',
			'helix',
			function () {
				echo '<div id="helix-root"></div>';
			},
			'dashicons-admin-generic',
			1
		);

		if ( $helix_hook_suffix ) {
			// Mark when the Helix screen is loading. Used elsewhere to conditionally modify admin UI.
			add_action(
				"load-$helix_hook_suffix",
				function () {
					$GLOBALS['helix_is_current_screen'] = true;
					// Ensure we are in Helix mode when visiting the Helix page.
					update_option( 'helix_use_default_admin', false );
				}
			);
		}
	}
);
