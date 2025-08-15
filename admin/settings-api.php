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
	$schema          = array();

	foreach ( $settings_config as $category => $settings ) {
		foreach ( $settings as $setting_key => $setting_config ) {
			$schema[ $setting_key ] = array(
				'description' => $setting_config['description'],
				'type'        => $setting_config['type'],
			);

			if ( isset( $setting_config['enum'] ) ) {
				$schema[ $setting_key ]['enum'] = $setting_config['enum'];
			}

			if ( isset( $setting_config['default'] ) ) {
				$schema[ $setting_key ]['default'] = $setting_config['default'];
			}
		}
	}

	return $schema;
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

	/**
	 * Filter the list of allowed settings.
	 *
	 * @since 1.0.0
	 * @param array $allowed_settings Array of allowed setting keys.
	 */
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
			return sanitize_text_field( $value );

		case 'email':
			$sanitized = sanitize_email( $value );
			if ( ! is_email( $sanitized ) ) {
				return new WP_Error(
					'helix_invalid_email',
					__( 'Invalid email address.', 'helix' ),
					array( 'status' => 400 )
				);
			}
			return $sanitized;

		case 'url':
			return esc_url_raw( $value );

		case 'integer':
			return absint( $value );

		case 'number':
			return floatval( $value );

		case 'boolean':
			return rest_sanitize_boolean( $value );

		default:
			// For enum types, validate against allowed values.
			if ( isset( $setting_config['enum'] ) ) {
				if ( ! in_array( $value, $setting_config['enum'], true ) ) {
					return new WP_Error(
						'helix_invalid_enum_value',
						sprintf(
							/* translators: 1: Setting name, 2: Allowed values */
							__( 'Invalid value for %1$s. Allowed values: %2$s', 'helix' ),
							$setting,
							implode( ', ', $setting_config['enum'] )
						),
						array( 'status' => 400 )
					);
				}
			}
			return sanitize_text_field( $value );
	}
}

/**
 * Get comprehensive settings configuration.
 *
 * @since 1.0.0
 * @return array Settings configuration array.
 */
/**
 * Get available WordPress languages.
 *
 * @since 1.0.0
 * @return array Array of available languages.
 */
function helix_get_available_languages() {
	$language_options = array();
	
	// Add English (United States) as default
	$language_options[] = array(
		'value' => '',
		'label' => 'English (United States)'
	);
	
	// Try to get installed languages
	if ( function_exists( 'get_available_languages' ) || ( file_exists( ABSPATH . 'wp-admin/includes/translation-install.php' ) && require_once ABSPATH . 'wp-admin/includes/translation-install.php' ) ) {
		
		$languages = get_available_languages();
		
		if ( ! empty( $languages ) && function_exists( 'wp_get_available_translations' ) ) {
			$available_translations = wp_get_available_translations();
			
			foreach ( $languages as $language ) {
				$language_data = $available_translations[ $language ] ?? null;
				if ( $language_data && isset( $language_data['native_name'] ) ) {
					$language_options[] = array(
						'value' => $language,
						'label' => $language_data['native_name']
					);
				} else {
					// Fallback if translation data is not available
					$language_options[] = array(
						'value' => $language,
						'label' => $language
					);
				}
			}
		}
	}
	
	// If no languages found, add some common ones as fallback
	if ( count( $language_options ) === 1 ) {
		$common_languages = array(
			'es_ES' => 'Español',
			'fr_FR' => 'Français',
			'de_DE' => 'Deutsch', 
			'it_IT' => 'Italiano',
			'pt_BR' => 'Português do Brasil',
			'ru_RU' => 'Русский',
			'ja' => '日本語',
			'zh_CN' => '简体中文',
		);
		
		foreach ( $common_languages as $code => $name ) {
			$language_options[] = array(
				'value' => $code,
				'label' => $name
			);
		}
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
	
	// UTC and common UTC offsets
	$timezone_options[] = array( 'value' => 'UTC', 'label' => 'UTC' );
	
	// Positive UTC offsets
	for ( $i = 1; $i <= 12; $i++ ) {
		$offset = sprintf( '+%d', $i );
		$timezone_options[] = array( 'value' => "UTC{$offset}", 'label' => "UTC{$offset}" );
	}
	
	// Negative UTC offsets
	for ( $i = 1; $i <= 12; $i++ ) {
		$offset = sprintf( '-%d', $i );
		$timezone_options[] = array( 'value' => "UTC{$offset}", 'label' => "UTC{$offset}" );
	}
	
	// Major city-based timezones organized by region
	$timezone_regions = array(
		'America' => array(
			'America/New_York' => 'New York',
			'America/Chicago' => 'Chicago', 
			'America/Denver' => 'Denver',
			'America/Los_Angeles' => 'Los Angeles',
			'America/Toronto' => 'Toronto',
			'America/Vancouver' => 'Vancouver',
			'America/Montreal' => 'Montreal',
			'America/Mexico_City' => 'Mexico City',
			'America/Sao_Paulo' => 'São Paulo',
			'America/Buenos_Aires' => 'Buenos Aires',
		),
		'Europe' => array(
			'Europe/London' => 'London',
			'Europe/Paris' => 'Paris',
			'Europe/Berlin' => 'Berlin',
			'Europe/Rome' => 'Rome',
			'Europe/Madrid' => 'Madrid',
			'Europe/Amsterdam' => 'Amsterdam',
			'Europe/Brussels' => 'Brussels',
			'Europe/Vienna' => 'Vienna',
			'Europe/Stockholm' => 'Stockholm',
			'Europe/Moscow' => 'Moscow',
		),
		'Asia' => array(
			'Asia/Tokyo' => 'Tokyo',
			'Asia/Shanghai' => 'Shanghai',
			'Asia/Hong_Kong' => 'Hong Kong',
			'Asia/Singapore' => 'Singapore',
			'Asia/Kolkata' => 'Kolkata',
			'Asia/Dubai' => 'Dubai',
			'Asia/Bangkok' => 'Bangkok',
			'Asia/Seoul' => 'Seoul',
			'Asia/Manila' => 'Manila',
		),
		'Australia' => array(
			'Australia/Sydney' => 'Sydney',
			'Australia/Melbourne' => 'Melbourne',
			'Australia/Brisbane' => 'Brisbane',
			'Australia/Perth' => 'Perth',
			'Australia/Adelaide' => 'Adelaide',
		),
		'Africa' => array(
			'Africa/Cairo' => 'Cairo',
			'Africa/Johannesburg' => 'Johannesburg',
			'Africa/Lagos' => 'Lagos',
		),
		'Pacific' => array(
			'Pacific/Auckland' => 'Auckland',
			'Pacific/Honolulu' => 'Honolulu',
		),
	);
	
	$timezone_identifiers = timezone_identifiers_list();
	
	foreach ( $timezone_regions as $region => $timezones ) {
		foreach ( $timezones as $timezone_id => $city_name ) {
			if ( in_array( $timezone_id, $timezone_identifiers ) ) {
				$timezone_options[] = array(
					'value' => $timezone_id,
					'label' => "{$city_name} ({$region})"
				);
			}
		}
	}
	
	return $timezone_options;
}

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
				'description' => __( 'Maximum width of large-sized images.', 'helix' ),
				'type'        => 'integer',
				'default'     => 1024,
			),
			'largeSizeH'                 => array(
				'label'       => __( 'Large Height', 'helix' ),
				'description' => __( 'Maximum height of large-sized images.', 'helix' ),
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
