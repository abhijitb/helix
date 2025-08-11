import React from 'react';
import SettingsSection from './SettingsSection';
import ToggleInput from '../../../components/ToggleInput';

/**
 * Helix Specific Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const HelixSettings = ( { settings, updateSetting } ) => {
	return (
		<SettingsSection
			title="Helix Settings"
			description="Settings specific to the Helix plugin"
		>
			<div className="helix-settings-grid">
				<ToggleInput
					label="Use Default WordPress Admin"
					description="Switch back to the default WordPress admin interface instead of using Helix."
					value={ settings.helixUseDefaultAdmin }
					onChange={ ( value ) =>
						updateSetting( 'helixUseDefaultAdmin', value )
					}
				/>
			</div>
		</SettingsSection>
	);
};

export default HelixSettings;
