import React from 'react';
import FormField from './FormField';

/**
 * Text input component
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.value
 * @param root0.onChange
 * @param root0.placeholder
 * @param root0.type
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 * @param root0.className
 */
const TextInput = ( {
	label,
	description,
	value,
	onChange,
	placeholder = '',
	type = 'text',
	required = false,
	disabled = false,
	error = null,
	className = '',
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
			<input
				type={ type }
				value={ value || '' }
				onChange={ handleChange }
				placeholder={ placeholder }
				required={ required }
				disabled={ disabled }
				className="helix-text-input"
				{ ...props }
			/>
		</FormField>
	);
};

export default TextInput;
