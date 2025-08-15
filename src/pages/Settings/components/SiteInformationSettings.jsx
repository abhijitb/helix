import React from 'react';
import SettingsSection from './SettingsSection';
import TextInput from '../../../components/TextInput';
import SelectInput from '../../../components/SelectInput';

/**
 * Site Information Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const SiteInformationSettings = ( { settings, updateSetting } ) => {
	return (
		<SettingsSection
			title="Site Information"
			description="Basic information about your WordPress site"
		>
			<div className="helix-settings-grid">
				<TextInput
					label="Site Title"
					description="In a few words, explain what this site is about."
					value={ settings.siteTitle }
					onChange={ ( value ) =>
						updateSetting( 'siteTitle', value )
					}
					placeholder="My Awesome Site"
					required
				/>

				<TextInput
					label="Tagline"
					description="A brief description of your site, usually displayed under the title."
					value={ settings.tagline }
					onChange={ ( value ) => updateSetting( 'tagline', value ) }
					placeholder="Just another WordPress site"
				/>

				<TextInput
					label="WordPress Address (URL)"
					description="The address of your WordPress core files."
					value={ settings.siteUrl }
					onChange={ ( value ) => updateSetting( 'siteUrl', value ) }
					type="url"
					placeholder="https://example.com"
				/>

				<TextInput
					label="Site Address (URL)"
					description="The address you want people to type in their browser to reach your website."
					value={ settings.homeUrl }
					onChange={ ( value ) => updateSetting( 'homeUrl', value ) }
					type="url"
					placeholder="https://example.com"
				/>

				<TextInput
					label="Administration Email Address"
					description="This address is used for admin purposes, like new user notification."
					value={ settings.adminEmail }
					onChange={ ( value ) =>
						updateSetting( 'adminEmail', value )
					}
					type="email"
					placeholder="admin@example.com"
					required
				/>

				<SelectInput
					label="Site Language"
					description="The language for your site interface."
					value={
						settings.language?.value || settings.language || ''
					}
					onChange={ ( value ) => updateSetting( 'language', value ) }
					options={ settings.language?.options || [] }
					placeholder="Select a language..."
				/>

				<SelectInput
					label="Timezone"
					description="Choose either a city in the same timezone as you or a UTC timezone offset."
					value={
						settings.timezone?.value || settings.timezone || ''
					}
					onChange={ ( value ) => updateSetting( 'timezone', value ) }
					options={ settings.timezone?.options || [] }
					placeholder="Select a timezone..."
				/>
			</div>
		</SettingsSection>
	);
};

export default SiteInformationSettings;
