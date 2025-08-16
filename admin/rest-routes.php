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
	// Get the schemas
	$get_schema = helix_get_settings_schema();
	$update_schema = helix_update_settings_schema();

	// Settings endpoints.
	register_rest_route(
		'helix/v1',
		'/settings',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'helix_get_settings',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => $get_schema,
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'helix_update_settings',
				'permission_callback' => 'helix_settings_permissions_check',
				'args'                => $update_schema,
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
	$params = $request->get_params();
	$allowed_settings = helix_get_allowed_settings();
	$updated_settings = array();
	$errors = array();

	// Process each setting
	foreach ( $params as $setting => $value ) {
		// Check if setting is allowed
		if ( ! in_array( $setting, $allowed_settings, true ) ) {
			$error_msg = sprintf(
				/* translators: %s: Setting name */
				__( 'Setting "%s" is not allowed.', 'helix' ),
				$setting
			);
			$errors[ $setting ] = $error_msg;
			continue;
		}

		// Validate and sanitize the value
		$sanitized_value = helix_sanitize_setting_value( $setting, $value );
		
		if ( is_wp_error( $sanitized_value ) ) {
			$errors[ $setting ] = $sanitized_value->get_error_message();
			continue;
		}

		// Get the WordPress option name for this setting
		$option_name = helix_get_wp_option_name( $setting );
		
		// Special handling for timezone setting
		if ( $setting === 'timezone' ) {
			$result = helix_update_timezone_setting( $sanitized_value );
		} else {
			// Update the WordPress option normally
			$result = update_option( $option_name, $sanitized_value );
		}
		
		// Special handling for WPLANG option
		if ( $option_name === 'WPLANG' && ! $result ) {
			// Check if switch_to_locale function is available
			if ( function_exists( 'switch_to_locale' ) ) {
				// Check if the language file exists
				$lang_dir = WP_CONTENT_DIR . '/languages/';
				$lang_file = $lang_dir . $sanitized_value . '.po';
				
				// If language file doesn't exist, try to install it
				if ( ! file_exists( $lang_file ) ) {
					// Try to install the language pack using WordPress core functions
					$install_result = helix_install_language_pack( $sanitized_value );
					
					if ( $install_result ) {
						// Try updating the option again
						$result = update_option( $option_name, $sanitized_value );
						
						if ( $result ) {
							$updated_settings[ $setting ] = $sanitized_value;
							continue; // Skip to next setting
						}
					}
				}
			}
			
			// If we still can't update, provide a helpful error message
			if ( ! $result ) {
				$error_msg = sprintf(
					__( 'Language "%s" could not be installed automatically. Please install the language pack manually via WordPress Admin → Settings → General → Site Language.', 'helix' ),
					$sanitized_value
				);
				$errors[ $setting ] = $error_msg;
				continue; // Skip to next setting
			}
		}

		if ( $result ) {
			$updated_settings[ $setting ] = $sanitized_value;
		} else {
			$error_msg = __( 'Failed to update setting.', 'helix' );
			$errors[ $setting ] = $error_msg;
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
