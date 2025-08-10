<?php
/**
 * Registers REST API routes for Helix.
 *
 * @package Helix
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include settings API utilities.
require_once plugin_dir_path( __FILE__ ) . 'settings-api.php';

add_action( 'rest_api_init', 'helix_register_rest_routes' );

/**
 * Register REST API routes for Helix.
 *
 * @since 1.0.0
 */
function helix_register_rest_routes() {
	// Settings endpoints.
	register_rest_route(
		'helix/v1',
		'/settings',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'helix_get_settings',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => helix_get_settings_schema(),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'helix_update_settings',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => helix_update_settings_schema(),
			),
		)
	);

	// Individual setting endpoints.
	register_rest_route(
		'helix/v1',
		'/settings/(?P<setting>[a-zA-Z0-9_-]+)',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'helix_get_single_setting',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => array(
					'setting' => array(
						'description' => __( 'Setting name to retrieve.', 'helix' ),
						'type'        => 'string',
						'required'    => true,
					),
				),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'helix_update_single_setting',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => array(
					'setting' => array(
						'description' => __( 'Setting name to update.', 'helix' ),
						'type'        => 'string',
						'required'    => true,
					),
					'value'   => array(
						'description' => __( 'Setting value.', 'helix' ),
						'type'        => array( 'string', 'boolean', 'integer', 'number' ),
						'required'    => true,
					),
				),
			),
		)
	);
}

/**
 * Permission callback for settings endpoints.
 *
 * @since 1.0.0
 * @return bool True if the request has read access for the item, false otherwise.
 */
function helix_settings_permissions_check() {
	return current_user_can( 'manage_options' );
}

/**
 * Get all WordPress settings.
 *
 * @since 1.0.0
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
function helix_get_settings() {
	$settings = helix_get_wordpress_settings();

	if ( is_wp_error( $settings ) ) {
		return $settings;
	}

	return rest_ensure_response( $settings );
}

/**
 * Update WordPress settings.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request Current request object.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
function helix_update_settings( $request ) {
	$params = $request->get_json_params();

	if ( empty( $params ) ) {
		return new WP_Error(
			'helix_no_settings_data',
			__( 'No settings data provided.', 'helix' ),
			array( 'status' => 400 )
		);
	}

	$updated_settings = array();
	$errors           = array();
	$allowed_settings = helix_get_allowed_settings();

	foreach ( $params as $setting => $value ) {
		if ( ! in_array( $setting, $allowed_settings, true ) ) {
			$errors[ $setting ] = sprintf(
				/* translators: %s: Setting name */
				__( 'Setting "%s" is not allowed to be updated.', 'helix' ),
				$setting
			);
			continue;
		}

		$sanitized_value = helix_sanitize_setting_value( $setting, $value );

		if ( is_wp_error( $sanitized_value ) ) {
			$errors[ $setting ] = $sanitized_value->get_error_message();
			continue;
		}

		$option_name = helix_get_wp_option_name( $setting );
		$result      = update_option( $option_name, $sanitized_value );

		if ( $result ) {
			$updated_settings[ $setting ] = $sanitized_value;
		} else {
			$errors[ $setting ] = __( 'Failed to update setting.', 'helix' );
		}
	}

	if ( ! empty( $errors ) && empty( $updated_settings ) ) {
		return new WP_Error(
			'helix_settings_update_failed',
			__( 'Failed to update any settings.', 'helix' ),
			array(
				'status' => 400,
				'errors' => $errors,
			)
		);
	}

	$response_data = array(
		'updated' => $updated_settings,
	);

	if ( ! empty( $errors ) ) {
		$response_data['errors'] = $errors;
	}

	return rest_ensure_response( $response_data );
}

/**
 * Get a single setting value.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request Current request object.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
function helix_get_single_setting( $request ) {
	$setting = $request->get_param( 'setting' );

	if ( ! helix_is_setting_allowed( $setting ) ) {
		return new WP_Error(
			'helix_setting_not_allowed',
			sprintf(
				/* translators: %s: Setting name */
				__( 'Setting "%s" is not allowed.', 'helix' ),
				$setting
			),
			array( 'status' => 403 )
		);
	}

	$option_name = helix_get_wp_option_name( $setting );
	$value       = get_option( $option_name );

	return rest_ensure_response(
		array(
			'setting' => $setting,
			'value'   => $value,
		)
	);
}

/**
 * Update a single setting value.
 *
 * @since 1.0.0
 * @param WP_REST_Request $request Current request object.
 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
 */
function helix_update_single_setting( $request ) {
	$setting = $request->get_param( 'setting' );
	$value   = $request->get_param( 'value' );

	if ( ! helix_is_setting_allowed( $setting ) ) {
		return new WP_Error(
			'helix_setting_not_allowed',
			sprintf(
				/* translators: %s: Setting name */
				__( 'Setting "%s" is not allowed to be updated.', 'helix' ),
				$setting
			),
			array( 'status' => 403 )
		);
	}

	$sanitized_value = helix_sanitize_setting_value( $setting, $value );

	if ( is_wp_error( $sanitized_value ) ) {
		return $sanitized_value;
	}

	$option_name = helix_get_wp_option_name( $setting );
	$result      = update_option( $option_name, $sanitized_value );

	if ( ! $result && get_option( $option_name ) !== $sanitized_value ) {
		return new WP_Error(
			'helix_setting_update_failed',
			sprintf(
				/* translators: %s: Setting name */
				__( 'Failed to update setting "%s".', 'helix' ),
				$setting
			),
			array( 'status' => 500 )
		);
	}

	return rest_ensure_response(
		array(
			'setting' => $setting,
			'value'   => $sanitized_value,
			'updated' => true,
		)
	);
}
