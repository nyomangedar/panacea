import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  icon?: ReactNode;
  onChange?: (value: string) => void;
}

export function Input({
  label,
  helperText,
  error = false,
  icon,
  disabled,
  onChange,
  id,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={['field', error && 'error'].filter(Boolean).join(' ')}>
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={icon ? 'input-wrap' : undefined}>
        {icon}
        <input
          id={inputId}
          className={['input', className].filter(Boolean).join(' ')}
          disabled={disabled}
          onChange={(e) => {
            if (!disabled) onChange?.(e.target.value);
          }}
          {...rest}
        />
      </div>
      {helperText && <span className="field-help">{helperText}</span>}
    </div>
  );
}
