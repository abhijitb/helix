import React from 'react';

/**
 * Save button component with loading and status indicators
 * @param root0
 * @param root0.onSave
 * @param root0.onReset
 * @param root0.saving
 * @param root0.hasUnsavedChanges
 * @param root0.disabled
 */
const SaveButton = ( {
	onSave,
	onReset,
	saving = false,
	hasUnsavedChanges = false,
	disabled = false,
} ) => {
	return (
		<div className="helix-save-buttons">
			<button
				type="button"
				onClick={ onSave }
				disabled={ disabled || saving || ! hasUnsavedChanges }
				className={ `helix-btn helix-btn-primary ${
					saving ? 'saving' : ''
				}` }
			>
				{ saving ? (
					<>
						<span className="helix-spinner"></span>
						Saving...
					</>
				) : (
					'Save Changes'
				) }
			</button>

			{ hasUnsavedChanges && ! saving && (
				<button
					type="button"
					onClick={ onReset }
					className="helix-btn helix-btn-secondary"
				>
					Reset Changes
				</button>
			) }

			{ ! hasUnsavedChanges && ! saving && (
				<span className="helix-save-status">✓ All changes saved</span>
			) }
		</div>
	);
};

export default SaveButton;
