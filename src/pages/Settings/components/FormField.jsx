import React from 'react';

/**
 * Form field wrapper component
 * @param root0
 * @param root0.label
 * @param root0.description
 * @param root0.error
 * @param root0.required
 * @param root0.children
 * @param root0.className
 */
const FormField = ( {
	label,
	description,
	error,
	required = false,
	children,
	className = '',
} ) => {
	return (
		<div className={ `helix-form-field ${ className }` }>
			{ label && (
				<label className="helix-form-label">
					{ label }
					{ required && <span className="helix-required">*</span> }
				</label>
			) }

			<div className="helix-form-control">{ children }</div>

			{ description && (
				<p className="helix-form-description">{ description }</p>
			) }

			{ error && <p className="helix-form-error">{ error }</p> }
		</div>
	);
};

export default FormField;
