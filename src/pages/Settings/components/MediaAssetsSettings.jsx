import React from 'react';
import SettingsSection from './SettingsSection';
import NumberInput from '../../../components/NumberInput';
import ToggleInput from '../../../components/ToggleInput';

/**
 * Media & Assets Settings Component
 * @param root0
 * @param root0.settings
 * @param root0.updateSetting
 */
const MediaAssetsSettings = ( { settings, updateSetting } ) => {
	return (
		<SettingsSection
			title="Media & Assets"
			description="Settings for media files, images, and site branding"
		>
			<div className="helix-settings-grid">
				<NumberInput
					label="Site Logo"
					description="The site logo (Media ID). Upload a logo in Media Library and enter its ID here."
					value={ settings.siteLogo }
					onChange={ ( value ) => updateSetting( 'siteLogo', value ) }
					min={ 0 }
				/>

				<NumberInput
					label="Site Icon (Favicon)"
					description="The site icon/favicon (Media ID). Upload an icon in Media Library and enter its ID here."
					value={ settings.siteIcon }
					onChange={ ( value ) => updateSetting( 'siteIcon', value ) }
					min={ 0 }
				/>

				<div className="helix-settings-subsection">
					<h4>Image Sizes</h4>

					<NumberInput
						label="Thumbnail Width"
						description="Maximum width of thumbnail images in pixels."
						value={ settings.thumbnailSizeW }
						onChange={ ( value ) =>
							updateSetting( 'thumbnailSizeW', value )
						}
						min={ 0 }
						max={ 2000 }
					/>

					<NumberInput
						label="Thumbnail Height"
						description="Maximum height of thumbnail images in pixels."
						value={ settings.thumbnailSizeH }
						onChange={ ( value ) =>
							updateSetting( 'thumbnailSizeH', value )
						}
						min={ 0 }
						max={ 2000 }
					/>

					<NumberInput
						label="Medium Width"
						description="Maximum width of medium-sized images in pixels."
						value={ settings.mediumSizeW }
						onChange={ ( value ) =>
							updateSetting( 'mediumSizeW', value )
						}
						min={ 0 }
						max={ 2000 }
					/>

					<NumberInput
						label="Medium Height"
						description="Maximum height of medium-sized images in pixels."
						value={ settings.mediumSizeH }
						onChange={ ( value ) =>
							updateSetting( 'mediumSizeH', value )
						}
						min={ 0 }
						max={ 2000 }
					/>

					<NumberInput
						label="Large Width"
						description="Maximum width of large-sized images in pixels."
						value={ settings.largeSizeW }
						onChange={ ( value ) =>
							updateSetting( 'largeSizeW', value )
						}
						min={ 0 }
						max={ 4000 }
					/>

					<NumberInput
						label="Large Height"
						description="Maximum height of large-sized images in pixels."
						value={ settings.largeSizeH }
						onChange={ ( value ) =>
							updateSetting( 'largeSizeH', value )
						}
						min={ 0 }
						max={ 4000 }
					/>
				</div>

				<ToggleInput
					label="Organize my uploads into month- and year-based folders"
					description="Organize uploaded files into date-based folder structure."
					value={ settings.uploadsUseYearmonthFolders }
					onChange={ ( value ) =>
						updateSetting( 'uploadsUseYearmonthFolders', value )
					}
				/>
			</div>
		</SettingsSection>
	);
};

export default MediaAssetsSettings;
