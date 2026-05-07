import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

interface EmailPillInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export interface EmailPillInputHandle {
  /** Commits any uncommitted text as a pill if valid, then returns the resulting value string. */
  flush: () => string;
}

const isValidEmailFormat = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const EmailPillInput = forwardRef<EmailPillInputHandle, EmailPillInputProps>(
  function EmailPillInput(
    {
      value,
      onChange,
      placeholder = 'Enter emails...',
      required = false,
      className = '',
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const emails = value
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    /**
     * Try to commit `inputValue` as a new pill. Returns the resulting
     * canonical value string (whether or not we actually committed),
     * so callers can validate synchronously without waiting for state.
     */
    const commit = (): string => {
      const pending = inputValue.trim();
      if (
        pending &&
        isValidEmailFormat(pending) &&
        !emails.includes(pending)
      ) {
        const next = [...emails, pending].join(', ');
        onChange(next);
        setInputValue('');
        return next;
      }
      return value;
    };

    useImperativeHandle(ref, () => ({ flush: commit }));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter, comma, and space all commit the current input as a pill.
      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
        e.preventDefault();
        commit();
      } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
        const newEmails = emails.slice(0, -1);
        onChange(newEmails.join(', '));
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Don't drop a typed-but-uncommitted email when the user clicks elsewhere.
      commit();
    };

    const removeEmail = (emailToRemove: string) => {
      const newEmails = emails.filter((email) => email !== emailToRemove);
      onChange(newEmails.join(', '));
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <div
          className={`flex flex-wrap gap-2 items-center px-4 py-3 rounded-lg border bg-[#F6F0E1]/50 transition-all ${
            isFocused
              ? 'border-[#C8A046] ring-2 ring-[#C8A046]/30'
              : 'border-[#1B5E3B]/20'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-2 bg-[#1B5E3B] text-[#F6F0E1] px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="hover:bg-[#1B5E3B]/80 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <input
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={emails.length === 0 ? placeholder : ''}
            required={required && emails.length === 0}
            className="flex-1 min-w-[200px] bg-transparent outline-none text-[#1B5E3B] placeholder-[#1B5E3B]/40 text-sm"
          />
        </div>

        {isFocused && (
          <p className="text-xs text-[#1B5E3B]/70">
            You can enter your personal email, institution email, or both.
            Press Enter, space, or comma to add an email.
          </p>
        )}
      </div>
    );
  },
);
