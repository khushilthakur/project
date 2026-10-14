import React from 'react';

export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', display: 'flex' }}>
            <Icon size={18} />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="form-input"
          style={{
            paddingLeft: Icon ? '2.5rem' : '0.875rem',
            borderColor: error ? 'var(--danger)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className="form-textarea"
        style={{
          borderColor: error ? 'var(--danger)' : undefined,
          resize: 'vertical',
        }}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="form-select"
        style={{ borderColor: error ? 'var(--danger)' : undefined }}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
