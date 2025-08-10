import React from 'react';
import SettingsSection from './SettingsSection';
import SelectInput from './SelectInput';
import NumberInput from './NumberInput';
import ToggleInput from './ToggleInput';
import TextInput from './TextInput';

/**
 * Content & Reading Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const ContentReadingSettings = ( { settings, updateSetting } ) => {
	const showOnFrontOptions = [
		{ value: 'posts', label: 'Your latest posts' },
		{ value: 'page', label: 'A static page' },
	];

	const startOfWeekOptions = [
		{ value: 0, label: 'Sunday' },
		{ value: 1, label: 'Monday' },
		{ value: 2, label: 'Tuesday' },
		{ value: 3, label: 'Wednesday' },
		{ value: 4, label: 'Thursday' },
		{ value: 5, label: 'Friday' },
		{ value: 6, label: 'Saturday' },
	];

	return (
		<SettingsSection
			title="Content & Reading"
			description="Settings that affect how your content is displayed"
		>
			<div className="helix-settings-grid">
				<SelectInput
					label="Your homepage displays"
					description="What to show on the front page of your site."
					value={ settings.showOnFront }
					onChange={ ( value ) =>
						updateSetting( 'showOnFront', value )
					}
					options={ showOnFrontOptions }
				/>

				{ settings.showOnFront === 'page' && (
					<>
						<NumberInput
							label="Homepage"
							description="The page to show on the front page (Page ID)."
							value={ settings.pageOnFront }
							onChange={ ( value ) =>
								updateSetting( 'pageOnFront', value )
							}
							min={ 0 }
						/>

						<NumberInput
							label="Posts page"
							description="The page to show posts (Page ID)."
							value={ settings.pageForPosts }
							onChange={ ( value ) =>
								updateSetting( 'pageForPosts', value )
							}
							min={ 0 }
						/>
					</>
				) }

				<NumberInput
					label="Blog pages show at most"
					description="Number of posts to show per page."
					value={ settings.postsPerPage }
					onChange={ ( value ) =>
						updateSetting( 'postsPerPage', value )
					}
					min={ 1 }
					max={ 100 }
				/>

				<ToggleInput
					label="Discourage search engines from indexing this site"
					description="This will discourage, but not prevent, search engines from indexing this site."
					value={ ! settings.blogPublic }
					onChange={ ( value ) =>
						updateSetting( 'blogPublic', ! value )
					}
				/>

				<TextInput
					label="Date Format"
					description="Format for displaying dates throughout your site."
					value={ settings.dateFormat }
					onChange={ ( value ) =>
						updateSetting( 'dateFormat', value )
					}
					placeholder="F j, Y"
				/>

				<TextInput
					label="Time Format"
					description="Format for displaying times throughout your site."
					value={ settings.timeFormat }
					onChange={ ( value ) =>
						updateSetting( 'timeFormat', value )
					}
					placeholder="g:i a"
				/>

				<SelectInput
					label="Week Starts On"
					description="The day of the week the calendar should start on."
					value={ settings.startOfWeek }
					onChange={ ( value ) =>
						updateSetting( 'startOfWeek', parseInt( value ) )
					}
					options={ startOfWeekOptions }
				/>
			</div>
		</SettingsSection>
	);
};

export default ContentReadingSettings;
