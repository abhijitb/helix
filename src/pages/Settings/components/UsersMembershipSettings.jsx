import React from 'react';
import SettingsSection from './SettingsSection';
import SelectInput from '../../../components/SelectInput';
import ToggleInput from '../../../components/ToggleInput';

/**
 * Users & Membership Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const UsersMembershipSettings = ( { settings, updateSetting } ) => {
	const roleOptions = [
		{ value: 'subscriber', label: 'Subscriber' },
		{ value: 'contributor', label: 'Contributor' },
		{ value: 'author', label: 'Author' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'administrator', label: 'Administrator' },
	];

	return (
		<SettingsSection
			title="Users & Membership"
			description="Settings for user registration and default permissions"
		>
			<div className="helix-settings-grid">
				<ToggleInput
					label="Anyone can register"
					description="Allow anyone to register as a user on your site."
					value={ settings.usersCanRegister }
					onChange={ ( value ) =>
						updateSetting( 'usersCanRegister', value )
					}
				/>

				<SelectInput
					label="New User Default Role"
					description="The default role assigned to new users when they register."
					value={ settings.defaultRole }
					onChange={ ( value ) =>
						updateSetting( 'defaultRole', value )
					}
					options={ roleOptions }
				/>
			</div>
		</SettingsSection>
	);
};

export default UsersMembershipSettings;
