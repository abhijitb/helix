import React from 'react';
import SettingsSection from './SettingsSection';
import SelectInput from '../../../components/SelectInput';
import NumberInput from '../../../components/NumberInput';
import ToggleInput from '../../../components/ToggleInput';

/**
 * Writing & Publishing Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const WritingPublishingSettings = ( { settings, updateSetting } ) => {
	const postFormatOptions = [
		{ value: 'standard', label: 'Standard' },
		{ value: 'aside', label: 'Aside' },
		{ value: 'gallery', label: 'Gallery' },
		{ value: 'image', label: 'Image' },
		{ value: 'link', label: 'Link' },
		{ value: 'quote', label: 'Quote' },
		{ value: 'status', label: 'Status' },
		{ value: 'video', label: 'Video' },
		{ value: 'audio', label: 'Audio' },
		{ value: 'chat', label: 'Chat' },
	];

	const statusOptions = [
		{ value: 'open', label: 'Open' },
		{ value: 'closed', label: 'Closed' },
	];

	return (
		<SettingsSection
			title="Writing & Publishing"
			description="Settings for content creation and publishing"
		>
			<div className="helix-settings-grid">
				<NumberInput
					label="Default Post Category"
					description="The default category for new posts (Category ID)."
					value={ settings.defaultCategory }
					onChange={ ( value ) =>
						updateSetting( 'defaultCategory', value )
					}
					min={ 1 }
				/>

				<SelectInput
					label="Default Post Format"
					description="The default format for new posts."
					value={ settings.defaultPostFormat }
					onChange={ ( value ) =>
						updateSetting( 'defaultPostFormat', value )
					}
					options={ postFormatOptions }
				/>

				<ToggleInput
					label="Convert emoticons like :-) and :-P to graphics on display"
					description="Transform text emoticons into graphical representations."
					value={ settings.useSmilies }
					onChange={ ( value ) =>
						updateSetting( 'useSmilies', value )
					}
				/>

				<SelectInput
					label="Default comment status"
					description="Allow people to submit comments on new posts."
					value={ settings.defaultCommentStatus }
					onChange={ ( value ) =>
						updateSetting( 'defaultCommentStatus', value )
					}
					options={ statusOptions }
				/>

				<SelectInput
					label="Default ping status"
					description="Allow link notifications from other blogs (pingbacks and trackbacks) on new posts."
					value={ settings.defaultPingStatus }
					onChange={ ( value ) =>
						updateSetting( 'defaultPingStatus', value )
					}
					options={ statusOptions }
				/>
			</div>
		</SettingsSection>
	);
};

export default WritingPublishingSettings;
