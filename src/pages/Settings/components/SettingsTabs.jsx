import React from 'react';
// Material-UI Icons
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Settings tabs navigation component
 * @param root0
 * @param root0.activeTab
 * @param root0.onTabChange
 * @param root0.hasUnsavedChanges
 */
const SettingsTabs = ( { activeTab, onTabChange, hasUnsavedChanges } ) => {
	const tabs = [
		{
			id: 'site',
			label: 'Site Information',
			icon: HomeIcon,
		},
		{
			id: 'content',
			label: 'Content & Reading',
			icon: ArticleIcon,
		},
		{
			id: 'writing',
			label: 'Writing & Publishing',
			icon: EditIcon,
		},
		{
			id: 'media',
			label: 'Media & Assets',
			icon: ImageIcon,
		},
		{
			id: 'users',
			label: 'Users & Membership',
			icon: PeopleIcon,
		},
		{
			id: 'helix',
			label: 'Helix Settings',
			icon: SettingsIcon,
		},
	];

	return (
		<div className="helix-settings-tabs">
			<nav className="helix-tabs-nav" role="tablist">
				{ tabs.map( ( tab ) => (
					<button
						key={ tab.id }
						type="button"
						role="tab"
						aria-selected={ activeTab === tab.id }
						aria-controls={ `${ tab.id }-panel` }
						className={ `helix-tab ${
							activeTab === tab.id ? 'active' : ''
						}` }
						onClick={ () => onTabChange( tab.id ) }
					>
						<span className="helix-tab-icon">
							<tab.icon />
						</span>
						<span className="helix-tab-label">{ tab.label }</span>
						{ hasUnsavedChanges && (
							<span
								className="helix-tab-indicator"
								title="Unsaved changes"
							>
								●
							</span>
						) }
					</button>
				) ) }
			</nav>
		</div>
	);
};

export default SettingsTabs;
