import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	isLoading?: boolean;
	typeStepperBtn?: string;
	variant?: 'primary' | 'secondary' | 'ghost' | string;
	size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			type = 'button',
			className = '',
			disabled = false,
			isLoading = false,
			onClick,
			id = '',
			typeStepperBtn,
			variant = 'primary',
			size = 'md',
			...rest
		}: ButtonProps,
		ref
	) => {

		const base = 'inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400';

		const variants: Record<string, string> = {
			primary: 'bg-cyan-500 text-white hover:bg-cyan-600',
			secondary: 'bg-slate-700 text-white hover:bg-slate-600',
			ghost: 'bg-transparent text-cyan-500 hover:bg-slate-50',
		};

		const sizes: Record<string, string> = {
			sm: 'px-3 py-1.5 text-sm',
			md: 'px-4 py-2 text-sm',
			lg: 'px-5 py-3 text-base',
		};

		const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

		const classes = `${base} ${variants[variant] ?? variant} ${sizes[size] ?? sizes.md} ${disabledClass} ${className}`.trim();

		return (
			<button
				ref={ref}
				type={type}
				className={classes}
				disabled={disabled || isLoading}
				onClick={onClick}
				id={id}
				data-kt-stepper-action={typeStepperBtn}
				data-kt-indicator="on"
				{...rest}
			>
				{isLoading ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							></path>
						</svg>
						<span>Loading...</span>
					</>
				) : (
					children
				)}
			</button>
		);
	}
);

export default Button;

