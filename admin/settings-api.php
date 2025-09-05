<?php
/**
 * Settings API utilities and helper functions.
 *
 * @package Helix
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the schema for settings GET requests.
 *
 * @since 1.0.0
 * @return array Schema array.
 */
function helix_get_settings_schema() {
	return array(
		'context' => array(
			'description' => __( 'Scope under which the request is made; determines fields present in response.', 'helix' ),
			'type'        => 'string',
			'enum'        => array( 'view', 'edit' ),
			'default'     => 'view',
		),
	);
}

/**
 * Get the schema for settings UPDATE requests.
 *
 * @since 1.0.0
 * @return array Schema array.
 */
function helix_update_settings_schema() {
	$settings_config = helix_get_settings_config();
	$args            = array();

	foreach ( $settings_config as $category => $category_settings ) {
		foreach ( $category_settings as $setting_key => $setting_config ) {
			$args[ $setting_key ] = array(
				'description'       => $setting_config['description'],
				'type'              => get_rest_api_type( $setting_config['type'] ),
				'sanitize_callback' => 'helix_sanitize_setting_value_for_rest',
				'validate_callback' => 'helix_validate_setting_value_for_rest',
			);

			// Add enum validation if applicable.
			if ( isset( $setting_config['enum'] ) ) {
				$enum_values = array();
				foreach ( $setting_config['enum'] as $option ) {
					if ( is_array( $option ) && isset( $option['value'] ) ) {
						$enum_values[] = $option['value'];
					} else {
						$enum_values[] = $option;
					}
				}
				$args[ $setting_key ]['enum'] = $enum_values;
			}

			// Add minimum/maximum validation for numbers.
			if ( isset( $setting_config['min'] ) ) {
				$args[ $setting_key ]['minimum'] = $setting_config['min'];
			}
			if ( isset( $setting_config['max'] ) ) {
				$args[ $setting_key ]['maximum'] = $setting_config['max'];
			}
		}
	}

	return $args;
}

/**
 * Convert Helix setting types to WordPress REST API types.
 *
 * @since 1.0.0
 * @param string $helix_type The Helix setting type.
 * @return string|array The WordPress REST API type.
 */
function get_rest_api_type( $helix_type ) {
	switch ( $helix_type ) {
		case 'string':
		case 'email':
		case 'url':
			return 'string';
		case 'integer':
			return 'integer';
		case 'number':
			return 'number';
		case 'boolean':
			return 'boolean';
		default:
			return 'string';
	}
}

/**
 * Sanitize setting value for REST API requests.
 *
 * @since 1.0.0
 * @param mixed           $value   The value to sanitize.
 * @param WP_REST_Request $request The request object.
 * @param string          $param   The parameter name.
 * @return mixed|WP_Error Sanitized value or WP_Error on failure.
 */
function helix_sanitize_setting_value_for_rest( $value, $request, $param ) {
	return helix_sanitize_setting_value( $param, $value );
}

/**
 * Validate setting value for REST API requests.
 *
 * @since 1.0.0
 * @param mixed           $value   The value to validate.
 * @param WP_REST_Request $request The request object.
 * @param string          $param   The parameter name.
 * @return bool|WP_Error True if valid, WP_Error on failure.
 */
function helix_validate_setting_value_for_rest( $value, $request, $param ) {
	// Check if the setting is allowed.
	if ( ! helix_is_setting_allowed( $param ) ) {
		return new WP_Error(
			'helix_setting_not_allowed',
			sprintf(
				/* translators: %s: Setting name */
				__( 'Setting "%s" is not allowed.', 'helix' ),
				$param
			),
			array( 'status' => 403 )
		);
	}

	// Use the existing sanitization function which also validates.
	$sanitized = helix_sanitize_setting_value( $param, $value );
	
	// If sanitization returns a WP_Error, validation failed.
	if ( is_wp_error( $sanitized ) ) {
		return $sanitized;
	}

	return true;
}

/**
 * Get all WordPress settings in organized format.
 *
 * @since 1.0.0
 * @return array|WP_Error Array of settings or WP_Error on failure.
 */
function helix_get_wordpress_settings() {
	$settings_config = helix_get_settings_config();
	$settings        = array();

	foreach ( $settings_config as $category => $category_settings ) {
		$settings[ $category ] = array();

		foreach ( $category_settings as $setting_key => $setting_config ) {
			$option_name = helix_get_wp_option_name( $setting_key );
			$value       = get_option( $option_name, $setting_config['default'] ?? null );

			// Apply formatting if specified.
			if ( isset( $setting_config['format_callback'] ) && is_callable( $setting_config['format_callback'] ) ) {
				$value = call_user_func( $setting_config['format_callback'], $value );
			}

			$settings[ $category ][ $setting_key ] = array(
				'value'       => $value,
				'label'       => $setting_config['label'],
				'description' => $setting_config['description'],
				'type'        => $setting_config['type'],
			);

			// Add additional properties if they exist.
			if ( isset( $setting_config['enum'] ) ) {
				$settings[ $category ][ $setting_key ]['options'] = $setting_config['enum'];
			}
		}
	}

	return $settings;
}

/**
 * Get the list of allowed settings that can be updated.
 *
 * @since 1.0.0
 * @return array Array of allowed setting keys.
 */
function helix_get_allowed_settings() {
	$settings_config  = helix_get_settings_config();
	$allowed_settings = array();

	foreach ( $settings_config as $category => $settings ) {
		$allowed_settings = array_merge( $allowed_settings, array_keys( $settings ) );
	}

	// Filter the list of allowed settings.
	return apply_filters( 'helix_allowed_settings', $allowed_settings );
}

/**
 * Check if a setting is allowed to be accessed/updated.
 *
 * @since 1.0.0
 * @param string $setting Setting key to check.
 * @return bool True if allowed, false otherwise.
 */
function helix_is_setting_allowed( $setting ) {
	$allowed_settings = helix_get_allowed_settings();
	return in_array( $setting, $allowed_settings, true );
}

/**
 * Get WordPress option name from setting key.
 *
 * @since 1.0.0
 * @param string $setting Setting key.
 * @return string WordPress option name.
 */
function helix_get_wp_option_name( $setting ) {
	$option_mapping = helix_get_option_mapping();
	return $option_mapping[ $setting ] ?? $setting;
}

/**
 * Get mapping between setting keys and WordPress option names.
 *
 * @since 1.0.0
 * @return array Mapping array.
 */
function helix_get_option_mapping() {
	return array(
		'siteTitle'                  => 'blogname',
		'tagline'                    => 'blogdescription',
		'siteUrl'                    => 'siteurl',
		'homeUrl'                    => 'home',
		'adminEmail'                 => 'admin_email',
		'language'                   => 'WPLANG',
		'timezone'                   => 'timezone_string',
		'dateFormat'                 => 'date_format',
		'timeFormat'                 => 'time_format',
		'startOfWeek'                => 'start_of_week',
		'postsPerPage'               => 'posts_per_page',
		'showOnFront'                => 'show_on_front',
		'pageOnFront'                => 'page_on_front',
		'pageForPosts'               => 'page_for_posts',
		'defaultCategory'            => 'default_category',
		'defaultPostFormat'          => 'default_post_format',
		'useSmilies'                 => 'use_smilies',
		'defaultCommentStatus'       => 'default_comment_status',
		'defaultPingStatus'          => 'default_ping_status',
		'siteLogo'                   => 'site_logo',
		'siteIcon'                   => 'site_icon',
		'thumbnailSizeW'             => 'thumbnail_size_w',
		'thumbnailSizeH'             => 'thumbnail_size_h',
		'mediumSizeW'                => 'medium_size_w',
		'mediumSizeH'                => 'medium_size_h',
		'largeSizeW'                 => 'large_size_w',
		'largeSizeH'                 => 'large_size_h',
		'uploadsUseYearmonthFolders' => 'uploads_use_yearmonth_folders',
		'usersCanRegister'           => 'users_can_register',
		'defaultRole'                => 'default_role',
		'blogPublic'                 => 'blog_public',
		'helixUseDefaultAdmin'       => 'helix_use_default_admin',
	);
}

/**
 * Sanitize setting value based on setting type.
 *
 * @since 1.0.0
 * @param string $setting Setting key.
 * @param mixed  $value   Value to sanitize.
 * @return mixed|WP_Error Sanitized value or WP_Error on failure.
 */
function helix_sanitize_setting_value( $setting, $value ) {
	$settings_config = helix_get_settings_config();
	$setting_config  = null;

	// Find the setting configuration.
	foreach ( $settings_config as $category => $settings ) {
		if ( isset( $settings[ $setting ] ) ) {
			$setting_config = $settings[ $setting ];
			break;
		}
	}

	if ( ! $setting_config ) {
		return new WP_Error(
			'helix_invalid_setting',
			sprintf(
				/* translators: %s: Setting name */
				__( 'Invalid setting: %s', 'helix' ),
				$setting
			),
			array( 'status' => 400 )
		);
	}

	// Apply custom sanitization if available.
	if ( isset( $setting_config['sanitize_callback'] ) && is_callable( $setting_config['sanitize_callback'] ) ) {
		return call_user_func( $setting_config['sanitize_callback'], $value );
	}

	// Default sanitization based on type.
	switch ( $setting_config['type'] ) {
		case 'string':
			$sanitized = sanitize_text_field( $value );
			break;

		case 'email':
			$sanitized = sanitize_email( $value );
			if ( ! is_email( $sanitized ) ) {
				return new WP_Error(
					'helix_invalid_email',
					__( 'Invalid email address.', 'helix' ),
					array( 'status' => 400 )
				);
			}
			break;

		case 'url':
			$sanitized = esc_url_raw( $value );
			break;

		case 'integer':
			$sanitized = absint( $value );
			break;

		case 'number':
			$sanitized = floatval( $value );
			break;

		case 'boolean':
			$sanitized = rest_sanitize_boolean( $value );
			break;

		default:
			$sanitized = sanitize_text_field( $value );
			break;
	}

	// For any type with enum values, validate against allowed values.
	if ( isset( $setting_config['enum'] ) ) {
		// Extract values from enum options if they are objects with 'value' property.
		$enum_values = array();
		foreach ( $setting_config['enum'] as $option ) {
			if ( is_array( $option ) && isset( $option['value'] ) ) {
				$enum_values[] = $option['value'];
			} else {
				$enum_values[] = $option;
			}
		}

		if ( ! in_array( $sanitized, $enum_values, true ) ) {
			return new WP_Error(
				'helix_invalid_enum_value',
				sprintf(
					/* translators: 1: Setting name, 2: Allowed values */
					__( 'Invalid value for %1$s. Allowed values: %2$s', 'helix' ),
					$setting,
					implode( ', ', $enum_values )
				),
				array( 'status' => 400 )
			);
		}
	}

	return $sanitized;
}

/**
 * Update special settings that require custom logic.
 *
 * @since 1.0.0
 * @param string $setting The setting key.
 * @param mixed  $value The sanitized value.
 * @return bool|null True if successful, false if failed, null if not a special setting.
 */
function helix_update_setting( $setting, $value ) {
	// Handle timezone setting.
	if ( 'timezone' === $setting ) {
		return helix_update_timezone_setting( $value );
	} elseif ( 'language' === $setting ) {
		return helix_update_language_setting( $value );
	}
	// Not a special setting.
	return false;
}

/**
 * Update language setting with automatic language pack installation.
 *
 * @since 1.0.0
 * @param string $locale The language locale to set.
 * @return bool True if successful, false otherwise.
 */
function helix_update_language_setting( $locale ) {
	// Try to update the option first.
	$result = update_option( 'WPLANG', $locale );

	// If it failed, try to install the language pack.
	if ( ! $result && function_exists( 'switch_to_locale' ) ) {
		// Check if the language file exists.
		$lang_dir  = WP_CONTENT_DIR . '/languages/';
		$lang_file = $lang_dir . $locale . '.po';

		// If language file doesn't exist, try to install it.
		if ( ! file_exists( $lang_file ) ) {
			$install_result = helix_install_language_pack( $locale );

			if ( $install_result ) {
				// Try updating the option again.
				$result = update_option( 'WPLANG', $locale );
			}
		}
	}

	return $result;
}

/**
 * Update timezone setting by handling both city-based timezones and GMT offsets.
 *
 * @since 1.0.0
 * @param string $timezone_value The timezone value to save.
 * @return bool True if update succeeded, false otherwise.
 */
function helix_update_timezone_setting( $timezone_value ) {
	// Check if it's a GMT offset (starts with UTC+ or UTC- or is numeric).
	if ( preg_match( '/^UTC[+-](\d+(?:\.\d+)?)$/', $timezone_value, $matches ) ) {
		// Extract the numeric offset.
		$offset      = $matches[1];
		$is_negative = strpos( $timezone_value, 'UTC-' ) === 0;

		// Convert to numeric value (negative if UTC-).
		$numeric_offset = $is_negative ? -1 * floatval( $offset ) : floatval( $offset );

		// Save to gmt_offset option.
		$result = update_option( 'gmt_offset', $numeric_offset );

		// Clear the timezone_string option since we're using GMT offset.
		if ( $result ) {
			update_option( 'timezone_string', '' );
		}

		return $result;
	} elseif ( is_numeric( $timezone_value ) ) {
		// Direct numeric offset (like "5.5").
		$numeric_offset = floatval( $timezone_value );

		// Save to gmt_offset option.
		$result = update_option( 'gmt_offset', $numeric_offset );

		// Clear the timezone_string option since we're using GMT offset.
		if ( $result ) {
			update_option( 'timezone_string', '' );
		}

		return $result;
	} else {
		// City-based timezone (like "Asia/Kolkata").
		// Save to timezone_string option.
		$result = update_option( 'timezone_string', $timezone_value );

		// Clear the gmt_offset option since we're using city-based timezone.
		if ( $result ) {
			update_option( 'gmt_offset', '' );
		}

		return $result;
	}
}

/**
 * Get available WordPress languages.
 *
 * @since 1.0.0
 * @return array Array of available languages.
 */
function helix_get_available_languages() {
	$language_options = array();

	// Add English (United States) as default.
	$language_options[] = array(
		'value' => '',
		'label' => 'English (United States)',
	);

	// First, try to get installed languages.
	if ( function_exists( 'get_available_languages' ) ) {
		$installed_languages = get_available_languages();
	} else {
		$installed_languages = array();
	}

	// Always try to include the required file first.
	if ( ! function_exists( 'wp_get_available_translations' ) && file_exists( ABSPATH . 'wp-admin/includes/translation-install.php' ) ) {
		require_once ABSPATH . 'wp-admin/includes/translation-install.php';
	}

	// Get all available translations (including uninstalled ones).
	if ( function_exists( 'wp_get_available_translations' ) ) {
		$available_translations = wp_get_available_translations();

		// Add all available languages.
		foreach ( $available_translations as $locale => $translation_data ) {
			$label = isset( $translation_data['native_name'] ) ? $translation_data['native_name'] : $locale;

			// Mark installed languages differently.
			$is_installed  = in_array( $locale, $installed_languages, true );
			$display_label = $is_installed ? $label : $label . ' (Not Installed)';

			$language_options[] = array(
				'value'     => $locale,
				'label'     => $display_label,
				'installed' => $is_installed,
			);
		}
	} else {
		// Fallback to common languages if wp_get_available_translations is still not available.
		$language_options = helix_get_fallback_languages( $installed_languages );
	}

	return $language_options;
}

/**
 * Install a language pack using WordPress core functions.
 *
 * @since 1.0.0
 * @param string $locale The language locale to install.
 * @return bool True if installation succeeded, false otherwise.
 */
function helix_install_language_pack( $locale ) {
	// Make sure we have the required functions.
	if ( ! function_exists( 'wp_download_language_pack' ) ) {
		if ( file_exists( ABSPATH . 'wp-admin/includes/translation-install.php' ) ) {
			require_once ABSPATH . 'wp-admin/includes/translation-install.php';
		} else {
			return false;
		}
	}

	// Make sure we have the filesystem API.
	if ( ! function_exists( 'request_filesystem_credentials' ) ) {
		if ( file_exists( ABSPATH . 'wp-admin/includes/file.php' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		} else {
			return false;
		}
	}

	// Check if the function is now available.
	if ( ! function_exists( 'wp_download_language_pack' ) ) {
		return false;
	}

	// Check if filesystem API is available.
	if ( ! function_exists( 'request_filesystem_credentials' ) ) {
		return false;
	}

	// Get available translations to verify the language exists.
	if ( function_exists( 'wp_get_available_translations' ) ) {
		$available_translations = wp_get_available_translations();

		if ( ! isset( $available_translations[ $locale ] ) ) {
			return false;
		}
	}

	// Try to download and install the language pack.
	try {

		$download_result = wp_download_language_pack( $locale );

		if ( is_wp_error( $download_result ) ) {
			return false;
		}

		// Verify the language file now exists.
		$lang_dir  = WP_CONTENT_DIR . '/languages/';
		$lang_file = $lang_dir . $locale . '.po';

		if ( file_exists( $lang_file ) ) {
			return true;
		} else {
			return false;
		}
	} catch ( Exception $e ) {
		return false;
	}
}

/**
 * Get fallback language options when wp_get_available_translations is not available.
 *
 * @since 1.0.0
 * @param array $installed_languages Array of installed language codes.
 * @return array Array of fallback language options.
 */
function helix_get_fallback_languages( $installed_languages = array() ) {
	$language_options = array();

	// Common languages as fallback.
	$common_languages = array(
		'en_GB' => 'English (United Kingdom)',
		'es_ES' => 'Español',
		'fr_FR' => 'Français',
		'de_DE' => 'Deutsch',
		'it_IT' => 'Italiano',
		'pt_BR' => 'Português do Brasil',
		'ru_RU' => 'Русский',
		'ja'    => '日本語',
		'zh_CN' => '简体中文',
		'ar'    => 'العربية',
		'hi_IN' => 'हिन्दी',
		'ko_KR' => '한국어',
		'nl_NL' => 'Nederlands',
		'sv_SE' => 'Svenska',
		'da_DK' => 'Dansk',
		'fi'    => 'Suomi',
		'no'    => 'Norsk',
		'pl_PL' => 'Polski',
		'tr_TR' => 'Türkçe',
	);

	foreach ( $common_languages as $code => $name ) {
		$is_installed  = in_array( $code, $installed_languages, true );
		$display_label = $is_installed ? $name : $name . ' (Not Installed)';

		$language_options[] = array(
			'value'     => $code,
			'label'     => $display_label,
			'installed' => $is_installed,
		);
	}

	return $language_options;
}

/**
 * Get available WordPress timezones.
 *
 * @since 1.0.0
 * @return array Array of available timezones.
 */
function helix_get_available_timezones() {
	$timezone_options = array();

	// Use WordPress core function to get timezone choices.
	if ( function_exists( 'wp_timezone_choice' ) ) {
		// Get the HTML output from wp_timezone_choice.
		$timezone_html = wp_timezone_choice( get_option( 'timezone_string', 'UTC' ) );
		// Parse the HTML to extract option values and labels.
		if ( preg_match_all( '/<option[^>]*value=["\']([^"\']*)["\'][^>]*>([^<]*)<\/option>/', $timezone_html, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$value = $match[1];
				$label = trim( $match[2] );

				// Skip empty values.
				if ( ! empty( $value ) || '0' === $value ) {
					$timezone_options[] = array(
						'value' => $value,
						'label' => $label,
					);
				}
			}
		}
	}

	return $timezone_options;
}

/**
 * Get comprehensive settings configuration.
 *
 * @since 1.0.0
 * @return array Settings configuration array.
 */
function helix_get_settings_config() {
	return array(
		'site_information'   => array(
			'siteTitle'  => array(
				'label'       => __( 'Site Title', 'helix' ),
				'description' => __( 'In a few words, explain what this site is about.', 'helix' ),
				'type'        => 'string',
				'default'     => get_bloginfo( 'name' ),
			),
			'tagline'    => array(
				'label'       => __( 'Tagline', 'helix' ),
				'description' => __( 'In a few words, explain what this site is about.', 'helix' ),
				'type'        => 'string',
				'default'     => get_bloginfo( 'description' ),
			),
			'siteUrl'    => array(
				'label'       => __( 'WordPress Address (URL)', 'helix' ),
				'description' => __( 'The address of your WordPress core files.', 'helix' ),
				'type'        => 'url',
				'default'     => site_url(),
			),
			'homeUrl'    => array(
				'label'       => __( 'Site Address (URL)', 'helix' ),
				'description' => __( 'The address you want people to type in their browser to reach your website.', 'helix' ),
				'type'        => 'url',
				'default'     => home_url(),
			),
			'adminEmail' => array(
				'label'       => __( 'Administration Email Address', 'helix' ),
				'description' => __( 'This address is used for admin purposes.', 'helix' ),
				'type'        => 'email',
				'default'     => get_option( 'admin_email' ),
			),
			'language'   => array(
				'label'       => __( 'Site Language', 'helix' ),
				'description' => __( 'The language for your site.', 'helix' ),
				'type'        => 'string',
				'default'     => get_locale(),
				'enum'        => helix_get_available_languages(),
			),
			'timezone'   => array(
				'label'       => __( 'Timezone', 'helix' ),
				'description' => __( 'Choose either a city in the same timezone as you or a UTC timezone offset.', 'helix' ),
				'type'        => 'string',
				'default'     => get_option( 'timezone_string', 'UTC' ),
				'enum'        => helix_get_available_timezones(),
			),
		),
		'content_reading'    => array(
			'showOnFront'  => array(
				'label'       => __( 'Your homepage displays', 'helix' ),
				'description' => __( 'What to show on the front page.', 'helix' ),
				'type'        => 'string',
				'enum'        => array( 'posts', 'page' ),
				'default'     => 'posts',
			),
			'pageOnFront'  => array(
				'label'       => __( 'Homepage', 'helix' ),
				'description' => __( 'The page to show on the front page.', 'helix' ),
				'type'        => 'integer',
				'default'     => 0,
			),
			'pageForPosts' => array(
				'label'       => __( 'Posts page', 'helix' ),
				'description' => __( 'The page to show posts.', 'helix' ),
				'type'        => 'integer',
				'default'     => 0,
			),
			'postsPerPage' => array(
				'label'       => __( 'Blog pages show at most', 'helix' ),
				'description' => __( 'Number of posts to show per page.', 'helix' ),
				'type'        => 'integer',
				'default'     => 10,
			),
			'blogPublic'   => array(
				'label'       => __( 'Search engine visibility', 'helix' ),
				'description' => __( 'Discourage search engines from indexing this site.', 'helix' ),
				'type'        => 'boolean',
				'default'     => true,
			),
			'dateFormat'   => array(
				'label'       => __( 'Date Format', 'helix' ),
				'description' => __( 'Format for displaying dates.', 'helix' ),
				'type'        => 'string',
				'default'     => get_option( 'date_format' ),
			),
			'timeFormat'   => array(
				'label'       => __( 'Time Format', 'helix' ),
				'description' => __( 'Format for displaying times.', 'helix' ),
				'type'        => 'string',
				'default'     => get_option( 'time_format' ),
			),
			'startOfWeek'  => array(
				'label'       => __( 'Week Starts On', 'helix' ),
				'description' => __( 'The day of the week the calendar should start on.', 'helix' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1, 2, 3, 4, 5, 6 ),
				'default'     => 1,
			),
		),
		'writing_publishing' => array(
			'defaultCategory'      => array(
				'label'       => __( 'Default Post Category', 'helix' ),
				'description' => __( 'The default category for new posts.', 'helix' ),
				'type'        => 'integer',
				'default'     => 1,
			),
			'defaultPostFormat'    => array(
				'label'       => __( 'Default Post Format', 'helix' ),
				'description' => __( 'The default format for new posts.', 'helix' ),
				'type'        => 'string',
				'enum'        => array( 'standard', 'aside', 'gallery', 'image', 'link', 'quote', 'status', 'video', 'audio', 'chat' ),
				'default'     => 'standard',
			),
			'useSmilies'           => array(
				'label'       => __( 'Convert emoticons', 'helix' ),
				'description' => __( 'Convert emoticons like :-) and :-P to graphics on display.', 'helix' ),
				'type'        => 'boolean',
				'default'     => true,
			),
			'defaultCommentStatus' => array(
				'label'       => __( 'Default comment status', 'helix' ),
				'description' => __( 'Allow people to submit comments on new posts.', 'helix' ),
				'type'        => 'string',
				'enum'        => array( 'open', 'closed' ),
				'default'     => 'open',
			),
			'defaultPingStatus'    => array(
				'label'       => __( 'Default ping status', 'helix' ),
				'description' => __( 'Allow link notifications from other blogs (pingbacks and trackbacks) on new posts.', 'helix' ),
				'type'        => 'string',
				'enum'        => array( 'open', 'closed' ),
				'default'     => 'open',
			),
		),
		'media_assets'       => array(
			'siteLogo'                   => array(
				'label'       => __( 'Site Logo', 'helix' ),
				'description' => __( 'The site logo.', 'helix' ),
				'type'        => 'integer',
				'default'     => 0,
			),
			'siteIcon'                   => array(
				'label'       => __( 'Site Icon', 'helix' ),
				'description' => __( 'The site icon (favicon).', 'helix' ),
				'type'        => 'integer',
				'default'     => 0,
			),
			'thumbnailSizeW'             => array(
				'label'       => __( 'Thumbnail Width', 'helix' ),
				'description' => __( 'Maximum width of thumbnail images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 150,
			),
			'thumbnailSizeH'             => array(
				'label'       => __( 'Thumbnail Height', 'helix' ),
				'description' => __( 'Maximum height of thumbnail images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 150,
			),
			'mediumSizeW'                => array(
				'label'       => __( 'Medium Width', 'helix' ),
				'description' => __( 'Maximum width of medium-sized images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 300,
			),
			'mediumSizeH'                => array(
				'label'       => __( 'Medium Height', 'helix' ),
				'description' => __( 'Maximum height of medium-sized images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 300,
			),
			'largeSizeW'                 => array(
				'label'       => __( 'Large Width', 'helix' ),
				'description' => __( 'Maximum width of large images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 1024,
			),
			'largeSizeH'                 => array(
				'label'       => __( 'Large Height', 'helix' ),
				'description' => __( 'Maximum height of large images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 1024,
			),
			'uploadsUseYearmonthFolders' => array(
				'label'       => __( 'Organize uploads into date-based folders', 'helix' ),
				'description' => __( 'Organize my uploads into month- and year-based folders.', 'helix' ),
				'type'        => 'boolean',
				'default'     => true,
			),
		),
		'users_membership'   => array(
			'usersCanRegister' => array(
				'label'       => __( 'Anyone can register', 'helix' ),
				'description' => __( 'Allow anyone to register as a user.', 'helix' ),
				'type'        => 'boolean',
				'default'     => false,
			),
			'defaultRole'      => array(
				'label'       => __( 'New User Default Role', 'helix' ),
				'description' => __( 'The default role for new users.', 'helix' ),
				'type'        => 'string',
				'enum'        => array( 'subscriber', 'contributor', 'author', 'editor', 'administrator' ),
				'default'     => 'subscriber',
			),
		),
		'helix_specific'     => array(
			'helixUseDefaultAdmin' => array(
				'label'       => __( 'Use Default WordPress Admin', 'helix' ),
				'description' => __( 'Use the default WordPress admin interface instead of Helix.', 'helix' ),
				'type'        => 'boolean',
				'default'     => false,
			),
		),
	);
}
