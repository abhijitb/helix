import React, { useState, useEffect } from 'react';

/**
 * Notification component for displaying success/error messages
 * @param root0
 * @param root0.type
 * @param root0.message
 * @param root0.onClose
 * @param root0.autoClose
 * @param root0.duration
 */
const Notification = ( {
	type = 'info',
	message,
	onClose,
	autoClose = true,
	duration = 5000,
} ) => {
	const [ visible, setVisible ] = useState( true );

	useEffect( () => {
		if ( autoClose && duration > 0 ) {
			const timer = setTimeout( () => {
				setVisible( false );
				setTimeout( () => onClose?.(), 300 ); // Allow fade out animation
			}, duration );

			return () => clearTimeout( timer );
		}
	}, [ autoClose, duration, onClose ] );

	if ( ! visible ) {
		return null;
	}

	const getIcon = () => {
		switch ( type ) {
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			case 'warning':
				return '⚠️';
			default:
				return 'ℹ️';
		}
	};

	return (
		<div
			className={ `helix-notification helix-notification-${ type } ${
				visible ? 'visible' : ''
			}` }
		>
			<div className="helix-notification-content">
				<span className="helix-notification-icon">{ getIcon() }</span>
				<span className="helix-notification-message">{ message }</span>
				{ onClose && (
					<button
						type="button"
						onClick={ () => {
							setVisible( false );
							setTimeout( () => onClose(), 300 );
						} }
						className="helix-notification-close"
						aria-label="Close notification"
					>
						×
					</button>
				) }
			</div>
		</div>
	);
};

export default Notification;
