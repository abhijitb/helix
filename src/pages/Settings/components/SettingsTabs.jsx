import React from 'react';

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
			icon: '🏠',
		},
		{
			id: 'content',
			label: 'Content & Reading',
			icon: '📖',
		},
		{
			id: 'writing',
			label: 'Writing & Publishing',
			icon: '✍️',
		},
		{
			id: 'media',
			label: 'Media & Assets',
			icon: '🖼️',
		},
		{
			id: 'users',
			label: 'Users & Membership',
			icon: '👥',
		},
		{
			id: 'helix',
			label: 'Helix Settings',
			icon: '⚙️',
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
						<span className="helix-tab-icon">{ tab.icon }</span>
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
