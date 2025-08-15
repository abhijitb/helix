import React from 'react';
import FormField from './FormField';

/**
 * Toggle switch component with proper accessibility
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.value
 * @param root0.onChange
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 * @param root0.className
 * @param root0.id
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
	id = `toggle-${ Math.random().toString( 36 ).substr( 2, 9 ) }`,
	...props
} ) => {
	const handleToggle = () => {
		if ( disabled ) {
			return;
		}
		onChange( ! value );
	};

	return (
		<FormField
			description={ description }
			error={ error }
			required={ required }
			className={ `helix-toggle-field ${ className }` }
		>
			<div className="helix-toggle-wrapper">
				{ label && (
					<label
						htmlFor={ id }
						className={ `helix-toggle-label ${
							disabled ? 'helix-toggle-label-disabled' : ''
						}` }
					>
						{ label }
					</label>
				) }

				<button
					id={ id }
					type="button"
					role="switch"
					aria-checked={ !! value }
					onClick={ handleToggle }
					disabled={ disabled }
					className={ `helix-toggle-switch ${
						value
							? 'helix-toggle-switch-on'
							: 'helix-toggle-switch-off'
					} ${ disabled ? 'helix-toggle-switch-disabled' : '' }` }
					{ ...props }
				>
					<span
						className={ `helix-toggle-knob ${
							value
								? 'helix-toggle-knob-on'
								: 'helix-toggle-knob-off'
						}` }
					/>
				</button>
			</div>
		</FormField>
	);
};

export default ToggleInput;
