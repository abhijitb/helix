import React from 'react';
import FormField from './FormField';

/**
 * Select input component
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.value
 * @param root0.onChange
 * @param root0.options
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 * @param root0.className
 * @param root0.placeholder
 */
const SelectInput = ( {
	label,
	description,
	value,
	onChange,
	options = [],
	required = false,
	disabled = false,
	error = null,
	className = '',
	placeholder = 'Select an option...',
	...props
} ) => {
	const handleChange = ( event ) => {
		onChange( event.target.value );
	};

	return (
		<FormField
			label={ label }
			description={ description }
			error={ error }
			required={ required }
			className={ className }
		>
			<select
				value={ value || '' }
				onChange={ handleChange }
				required={ required }
				disabled={ disabled }
				className="helix-select-input"
				{ ...props }
			>
				{ placeholder && (
					<option value="" disabled>
						{ placeholder }
					</option>
				) }
				{ options.map( ( option ) => (
					<option key={ option.value } value={ option.value }>
						{ option.label }
					</option>
				) ) }
			</select>
		</FormField>
	);
};

export default SelectInput;
