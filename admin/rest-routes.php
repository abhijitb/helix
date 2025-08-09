<?php
/**
 * Registers REST API routes for Helix.
 *
 * @package Helix
 */

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'helix/v1',
			'/settings',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function () {
					return array(
						'siteTitle' => get_option( 'blogname' ),
						'language'  => get_option( 'WPLANG' ),
					);
				},
			)
		);
	}
);
