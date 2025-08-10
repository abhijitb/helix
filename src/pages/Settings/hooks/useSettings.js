import { useState, useEffect, useCallback } from 'react';
import { getAllSettings, updateSettings } from '../utils/settingsAPI';

/**
 * Custom hook for managing WordPress settings
 * @return {Object} Settings state and methods
 */
export const useSettings = () => {
	const [ settings, setSettings ] = useState( {} );
	const [ originalSettings, setOriginalSettings ] = useState( {} );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState( false );

	/**
	 * Load settings from API
	 */
	const loadSettings = useCallback( async () => {
		try {
			setLoading( true );
			setError( null );

			const data = await getAllSettings();

			// Flatten settings for easier form handling
			const flattenedSettings = {};
			Object.keys( data ).forEach( ( category ) => {
				Object.keys( data[ category ] ).forEach( ( setting ) => {
					flattenedSettings[ setting ] =
						data[ category ][ setting ].value;
				} );
			} );

			setSettings( flattenedSettings );
			setOriginalSettings( flattenedSettings );
			setHasUnsavedChanges( false );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	}, [] );

	/**
	 * Update a single setting value
	 * @param {string} key   - Setting key
	 * @param {any}    value - Setting value
	 */
	const updateSetting = useCallback(
		( key, value ) => {
			setSettings( ( prev ) => {
				const newSettings = { ...prev, [ key ]: value };

				// Check if there are unsaved changes
				const hasChanges = Object.keys( newSettings ).some(
					( settingKey ) =>
						newSettings[ settingKey ] !==
						originalSettings[ settingKey ]
				);
				setHasUnsavedChanges( hasChanges );

				return newSettings;
			} );
		},
		[ originalSettings ]
	);

	/**
	 * Save all changes to the server
	 */
	const saveSettings = useCallback( async () => {
		try {
			setSaving( true );
			setError( null );

			// Only send changed settings
			const changedSettings = {};
			Object.keys( settings ).forEach( ( key ) => {
				if ( settings[ key ] !== originalSettings[ key ] ) {
					changedSettings[ key ] = settings[ key ];
				}
			} );

			if ( Object.keys( changedSettings ).length === 0 ) {
				return { success: true, message: 'No changes to save' };
			}

			const result = await updateSettings( changedSettings );

			// Update original settings to reflect saved state
			setOriginalSettings( settings );
			setHasUnsavedChanges( false );

			return {
				success: true,
				message: 'Settings saved successfully',
				updated: result.updated,
				errors: result.errors,
			};
		} catch ( err ) {
			setError( err.message );
			return { success: false, message: err.message };
		} finally {
			setSaving( false );
		}
	}, [ settings, originalSettings ] );

	/**
	 * Reset settings to original values
	 */
	const resetSettings = useCallback( () => {
		setSettings( originalSettings );
		setHasUnsavedChanges( false );
		setError( null );
	}, [ originalSettings ] );

	/**
	 * Reset a single setting to its original value
	 * @param {string} key - Setting key
	 */
	const resetSetting = useCallback(
		( key ) => {
			updateSetting( key, originalSettings[ key ] );
		},
		[ originalSettings, updateSetting ]
	);

	// Load settings on mount
	useEffect( () => {
		loadSettings();
	}, [ loadSettings ] );

	// Warn user about unsaved changes before leaving
	useEffect( () => {
		const handleBeforeUnload = ( event ) => {
			if ( hasUnsavedChanges ) {
				event.preventDefault();
				event.returnValue =
					'You have unsaved changes. Are you sure you want to leave?';
				return event.returnValue;
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );
		return () =>
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
	}, [ hasUnsavedChanges ] );

	return {
		settings,
		loading,
		saving,
		error,
		hasUnsavedChanges,
		updateSetting,
		saveSettings,
		resetSettings,
		resetSetting,
		loadSettings,
	};
};
