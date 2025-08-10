import React from 'react';

/**
 * Settings section wrapper component
 * @param root0
 * @param root0.title
 * @param root0.description
 * @param root0.children
 * @param root0.className
 */
const SettingsSection = ( {
	title,
	description,
	children,
	className = '',
} ) => {
	return (
		<div className={ `helix-settings-section ${ className }` }>
			{ title && (
				<div className="helix-settings-section-header">
					<h3 className="helix-settings-section-title">{ title }</h3>
					{ description && (
						<p className="helix-settings-section-description">
							{ description }
						</p>
					) }
				</div>
			) }

			<div className="helix-settings-section-content">{ children }</div>
		</div>
	);
};

export default SettingsSection;
