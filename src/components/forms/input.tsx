import React, { forwardRef, useImperativeHandle, useState } from 'react';

type Props = {
	type?: string;
	optional?: boolean;
	label?: string;
	placeholder?: string;
	requiredIndicator?: string;
	errors?: any;
	currentLength?: number;
	maxLength?: number;
	children?: React.ReactNode;
	className?: string;
	name?: string;
	value?: any;
	step?: string | number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = forwardRef<HTMLInputElement, Props>(
	(
		{
			type = 'text',
			optional = false,
			label,
			placeholder,
			requiredIndicator = '',
			errors,
			currentLength,
			maxLength,
			children,
			className = '',
			...rest
		},
		ref
	) => {
		const [show, setShow] = useState(false);
		const inputRef = React.useRef<HTMLInputElement | null>(null);

		useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

		const isPassword = type === 'password';
		const inputType = isPassword && show ? 'text' : type;

		const baseClasses =
			'block w-full rounded-md bg-slate-800 text-slate-100 placeholder:text-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400';

		const errorClasses = errors ? 'border-red-500 focus:ring-red-400' : '';

		// space for right icons
		const paddingRight = children || isPassword ? 'pr-10' : '';

		return (
			<div>
				{label && (
					<label className={`block text-sm font-medium mb-1 ${requiredIndicator}`}>
						{label}{' '}
						{optional && <span className="text-sm text-slate-400">(opcional)</span>}
					</label>
				)}

				<div className="relative">
					<input
						ref={inputRef}
						type={inputType}
						placeholder={placeholder}
						className={`${baseClasses} ${errorClasses} ${paddingRight} ${className} px-3 py-2`}
						{...rest}
					/>

					{children && (
						<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
							{children}
						</div>
					)}

					{isPassword && (
						<button
							type="button"
							tabIndex={0}
							className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-300 hover:text-slate-100"
							onClick={() => setShow((s) => !s)}
						>
							{show ? (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M10 3C6.5 3 3.6 5.1 2 8c1.6 2.9 4.5 5 8 5s6.4-2.1 8-5c-1.6-2.9-4.5-5-8-5z" />
									<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M2.1 2.1l15.8 15.8-1.4 1.4L.7 3.5 2.1 2.1zM10 4c3.5 0 6.4 2.1 8 5-.5.9-1.3 1.7-2.1 2.4L6.6 4.6C7.8 4.2 9 4 10 4zM4.4 6.1l1.5 1.5A4 4 0 0014 13.6l1.5 1.5C15 16 12.1 18 8.6 18 5.1 18 2.2 16 0 13c1.6-2.9 4.5-5 8-5 1 0 1.9.2 2.8.6L4.4 6.1z" />
								</svg>
							)}
						</button>
					)}
				</div>

				{/* invalid feedback */}
				{errors && (
					<p className="mt-1 text-sm text-red-400">{errors?.message || String(errors)}</p>
				)}

				{/* length counter */}
				{maxLength && maxLength > 0 && (
					<div className="text-sm text-slate-400 mt-1 text-right">{currentLength}/{maxLength}</div>
				)}
			</div>
		);
	}
);

export default Input;

