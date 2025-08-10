import React from 'react';
import FormField from './FormField';

/**
 * Toggle/Checkbox input component
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.value
 * @param root0.onChange
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 * @param root0.className
 */
const ToggleInput = ( {
	label,
	description,
	value,
	onChange,
	required = false,
	disabled = false,
	error = null,
	className = '',
	...props
} ) => {
	const handleChange = ( event ) => {
		onChange( event.target.checked );
	};

	return (
		<FormField
			description={ description }
			error={ error }
			required={ required }
			className={ `helix-toggle-field ${ className }` }
		>
			<label className="helix-toggle-wrapper">
				<input
					type="checkbox"
					checked={ !! value }
					onChange={ handleChange }
					required={ required }
					disabled={ disabled }
					className="helix-toggle-input"
					{ ...props }
				/>
				<span className="helix-toggle-slider"></span>
				<span className="helix-toggle-label">{ label }</span>
			</label>
		</FormField>
	);
};

export default ToggleInput;
