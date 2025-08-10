import React, { useState } from 'react';
import { useSettings } from './Settings/hooks/useSettings';
import SettingsTabs from './Settings/components/SettingsTabs';
import SaveButton from './Settings/components/SaveButton';
import Notification from './Settings/components/Notification';
import SiteInformationSettings from './Settings/components/SiteInformationSettings';
import ContentReadingSettings from './Settings/components/ContentReadingSettings';
import WritingPublishingSettings from './Settings/components/WritingPublishingSettings';
import MediaAssetsSettings from './Settings/components/MediaAssetsSettings';
import UsersMembershipSettings from './Settings/components/UsersMembershipSettings';
import HelixSettings from './Settings/components/HelixSettings';
import './Settings/styles.css';

/**
 * Main Settings Page Component
 */
export default function Settings() {
	const {
		settings,
		loading,
		saving,
		error,
		hasUnsavedChanges,
		updateSetting,
		saveSettings,
		resetSettings,
	} = useSettings();

	const [ activeTab, setActiveTab ] = useState( 'site' );
	const [ notification, setNotification ] = useState( null );

	const handleSave = async () => {
		const result = await saveSettings();

		if ( result.success ) {
			setNotification( {
				type: 'success',
				message: result.message || 'Settings saved successfully!',
			} );
		} else {
			setNotification( {
				type: 'error',
				message:
					result.message ||
					'Failed to save settings. Please try again.',
			} );
		}
	};

	const handleReset = () => {
		resetSettings();
		setNotification( {
			type: 'info',
			message: 'Changes have been reset to their original values.',
		} );
	};

	const handleTabChange = ( tabId ) => {
		if ( hasUnsavedChanges ) {
			const confirmed = window.confirm(
				'You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost.'
			);
			if ( ! confirmed ) {
				return;
			}
		}
		setActiveTab( tabId );
	};

	const renderTabContent = () => {
		const commonProps = { settings, updateSetting };

		switch ( activeTab ) {
			case 'site':
				return <SiteInformationSettings { ...commonProps } />;
			case 'content':
				return <ContentReadingSettings { ...commonProps } />;
			case 'writing':
				return <WritingPublishingSettings { ...commonProps } />;
			case 'media':
				return <MediaAssetsSettings { ...commonProps } />;
			case 'users':
				return <UsersMembershipSettings { ...commonProps } />;
			case 'helix':
				return <HelixSettings { ...commonProps } />;
			default:
				return <SiteInformationSettings { ...commonProps } />;
		}
	};

	if ( loading ) {
		return (
			<div className="helix-settings-page">
				<div className="helix-loading">
					<div className="helix-spinner"></div>
					<p>Loading settings...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="helix-settings-page">
			{ /* Header */ }
			<div className="helix-settings-header">
				<h1>Settings</h1>
				<p>Manage your WordPress site configuration</p>
			</div>

			{ /* Global Error */ }
			{ error && (
				<Notification
					type="error"
					message={ error }
					onClose={ () => {} }
					autoClose={ false }
				/>
			) }

			{ /* Success/Info Notifications */ }
			{ notification && (
				<Notification
					type={ notification.type }
					message={ notification.message }
					onClose={ () => setNotification( null ) }
				/>
			) }

			{ /* Tabs Navigation */ }
			<SettingsTabs
				activeTab={ activeTab }
				onTabChange={ handleTabChange }
				hasUnsavedChanges={ hasUnsavedChanges }
			/>

			{ /* Tab Content */ }
			<div className="helix-settings-content">
				<div
					id={ `${ activeTab }-panel` }
					role="tabpanel"
					aria-labelledby={ `${ activeTab }-tab` }
					className="helix-tab-panel"
				>
					{ renderTabContent() }
				</div>
			</div>

			{ /* Footer Controls */ }
			<div className="helix-settings-footer">
				<SaveButton
					onSave={ handleSave }
					onReset={ handleReset }
					saving={ saving }
					hasUnsavedChanges={ hasUnsavedChanges }
				/>
			</div>
		</div>
	);
}
