import React from 'react';
import FormField from './FormField';

/**
 * Number input component
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.value
 * @param root0.onChange
 * @param root0.min
 * @param root0.max
 * @param root0.step
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 * @param root0.className
 */
const NumberInput = ( {
	label,
	description,
	value,
	onChange,
	min = null,
	max = null,
	step = 1,
	required = false,
	disabled = false,
	error = null,
	className = '',
	...props
} ) => {
	const handleChange = ( event ) => {
		const newValue = event.target.value;
		// Convert to number if not empty, otherwise keep as empty string
		onChange( newValue === '' ? '' : Number( newValue ) );
	};

	return (
		<FormField
			label={ label }
			description={ description }
			error={ error }
			required={ required }
			className={ className }
		>
			<input
				type="number"
				value={ value || '' }
				onChange={ handleChange }
				min={ min }
				max={ max }
				step={ step }
				required={ required }
				disabled={ disabled }
				className="helix-number-input"
				{ ...props }
			/>
		</FormField>
	);
};

export default NumberInput;
