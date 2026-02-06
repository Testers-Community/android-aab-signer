'use client';

import { useState, useCallback, useRef } from 'react';
import {
  validateAABFile,
  validateKeystoreFile,
  validateSigningParams,
  MAX_AAB_SIZE,
  MAX_KEYSTORE_SIZE,
  VALID_AAB_EXTENSIONS,
  VALID_KEYSTORE_EXTENSIONS,
} from '@/lib/validation';

interface UploadFormProps {
  onSubmit: (data: {
    aabFile: File;
    keystoreFile: File;
    keystorePassword: string;
    keyAlias: string;
    keyPassword: string;
  }) => void;
  disabled?: boolean;
}

// Icon components
const PackageIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const KeyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export function UploadForm({ onSubmit, disabled = false }: UploadFormProps) {
  const [aabFile, setAabFile] = useState<File | null>(null);
  const [keystoreFile, setKeystoreFile] = useState<File | null>(null);
  const [keystorePassword, setKeystorePassword] = useState('');
  const [keyAlias, setKeyAlias] = useState('');
  const [keyPassword, setKeyPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraggingAab, setIsDraggingAab] = useState(false);
  const [isDraggingKeystore, setIsDraggingKeystore] = useState(false);
  const [showKeystorePassword, setShowKeystorePassword] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);

  const aabInputRef = useRef<HTMLInputElement>(null);
  const keystoreInputRef = useRef<HTMLInputElement>(null);

  const handleAabDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAab(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateAABFile(file);
      if (validation.valid) {
        setAabFile(file);
        setErrors(prev => ({ ...prev, aab: '' }));
      } else {
        setErrors(prev => ({ ...prev, aab: validation.error || '' }));
      }
    }
  }, []);

  const handleKeystoreDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingKeystore(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validation = validateKeystoreFile(file);
      if (validation.valid) {
        setKeystoreFile(file);
        setErrors(prev => ({ ...prev, keystore: '' }));
      } else {
        setErrors(prev => ({ ...prev, keystore: validation.error || '' }));
      }
    }
  }, []);

  const handleAabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validation = validateAABFile(file);
      if (validation.valid) {
        setAabFile(file);
        setErrors(prev => ({ ...prev, aab: '' }));
      } else {
        setErrors(prev => ({ ...prev, aab: validation.error || '' }));
      }
    }
  };

  const handleKeystoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validation = validateKeystoreFile(file);
      if (validation.valid) {
        setKeystoreFile(file);
        setErrors(prev => ({ ...prev, keystore: '' }));
      } else {
        setErrors(prev => ({ ...prev, keystore: validation.error || '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate files
    const aabValidation = validateAABFile(aabFile);
    if (!aabValidation.valid) {
      newErrors.aab = aabValidation.error || '';
    }

    const keystoreValidation = validateKeystoreFile(keystoreFile);
    if (!keystoreValidation.valid) {
      newErrors.keystore = keystoreValidation.error || '';
    }

    // Validate signing params
    const paramsValidation = validateSigningParams({
      keystorePassword,
      keyAlias,
      keyPassword,
    });
    if (!paramsValidation.valid) {
      if (paramsValidation.error?.includes('Keystore password')) {
        newErrors.keystorePassword = paramsValidation.error;
      } else if (paramsValidation.error?.includes('Key alias')) {
        newErrors.keyAlias = paramsValidation.error;
      } else if (paramsValidation.error?.includes('Key password')) {
        newErrors.keyPassword = paramsValidation.error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    onSubmit({
      aabFile: aabFile!,
      keystoreFile: keystoreFile!,
      keystorePassword,
      keyAlias,
      keyPassword,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AAB File Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Android App Bundle (AAB)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${isDraggingAab
              ? 'border-lime-400 bg-lime-500/10'
              : aabFile
                ? 'border-lime-500/50 bg-lime-500/5'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={e => {
            e.preventDefault();
            if (!disabled) setIsDraggingAab(true);
          }}
          onDragLeave={() => setIsDraggingAab(false)}
          onDrop={disabled ? undefined : handleAabDrop}
          onClick={() => !disabled && aabInputRef.current?.click()}
        >
          <input
            ref={aabInputRef}
            type="file"
            accept={VALID_AAB_EXTENSIONS.join(',')}
            onChange={handleAabChange}
            disabled={disabled}
            className="hidden"
          />
          {aabFile ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-lime-400" />
              <div className="text-left">
                <p className="font-medium text-white truncate max-w-[200px]">{aabFile.name}</p>
                <p className="text-sm text-zinc-400">{formatFileSize(aabFile.size)}</p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <PackageIcon className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
              <p className="text-zinc-300 font-medium">Drop your .aab file here</p>
              <p className="text-sm text-zinc-500 mt-1">or click to browse (max {formatFileSize(MAX_AAB_SIZE)})</p>
            </div>
          )}
        </div>
        {errors.aab && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.aab}
          </p>
        )}
      </div>

      {/* Keystore File Upload */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Keystore File
        </label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${isDraggingKeystore
              ? 'border-lime-400 bg-lime-500/10'
              : keystoreFile
                ? 'border-lime-500/50 bg-lime-500/5'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={e => {
            e.preventDefault();
            if (!disabled) setIsDraggingKeystore(true);
          }}
          onDragLeave={() => setIsDraggingKeystore(false)}
          onDrop={disabled ? undefined : handleKeystoreDrop}
          onClick={() => !disabled && keystoreInputRef.current?.click()}
        >
          <input
            ref={keystoreInputRef}
            type="file"
            accept={VALID_KEYSTORE_EXTENSIONS.join(',')}
            onChange={handleKeystoreChange}
            disabled={disabled}
            className="hidden"
          />
          {keystoreFile ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-lime-400" />
              <div className="text-left">
                <p className="font-medium text-white truncate max-w-[200px]">{keystoreFile.name}</p>
                <p className="text-sm text-zinc-400">{formatFileSize(keystoreFile.size)}</p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <KeyIcon className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
              <p className="text-zinc-300 font-medium">Drop your keystore file here</p>
              <p className="text-sm text-zinc-500 mt-1">.jks, .keystore, .p12, or .pfx (max {formatFileSize(MAX_KEYSTORE_SIZE)})</p>
            </div>
          )}
        </div>
        {errors.keystore && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.keystore}
          </p>
        )}
      </div>

      {/* Key Alias */}
      <div>
        <label htmlFor="keyAlias" className="block text-sm font-medium text-zinc-300 mb-2">
          Key Alias
        </label>
        <input
          type="text"
          id="keyAlias"
          value={keyAlias}
          onChange={e => setKeyAlias(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all ${errors.keyAlias ? 'border-red-500' : 'border-zinc-700'
            } ${disabled ? 'opacity-50' : ''}`}
          placeholder="e.g., my-key-alias"
        />
        {errors.keyAlias && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.keyAlias}
          </p>
        )}
      </div>

      {/* Keystore Password */}
      <div>
        <label htmlFor="keystorePassword" className="block text-sm font-medium text-zinc-300 mb-2">
          Keystore Password
        </label>
        <div className="relative">
          <input
            type={showKeystorePassword ? 'text' : 'password'}
            id="keystorePassword"
            value={keystorePassword}
            onChange={e => setKeystorePassword(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all ${errors.keystorePassword ? 'border-red-500' : 'border-zinc-700'
              } ${disabled ? 'opacity-50' : ''}`}
            placeholder="Enter keystore password"
          />
          <button
            type="button"
            onClick={() => setShowKeystorePassword(!showKeystorePassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showKeystorePassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.keystorePassword && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.keystorePassword}
          </p>
        )}
      </div>

      {/* Key Password */}
      <div>
        <label htmlFor="keyPassword" className="block text-sm font-medium text-zinc-300 mb-2">
          Key Password
        </label>
        <div className="relative">
          <input
            type={showKeyPassword ? 'text' : 'password'}
            id="keyPassword"
            value={keyPassword}
            onChange={e => setKeyPassword(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all ${errors.keyPassword ? 'border-red-500' : 'border-zinc-700'
              } ${disabled ? 'opacity-50' : ''}`}
            placeholder="Often same as keystore password"
          />
          <button
            type="button"
            onClick={() => setShowKeyPassword(!showKeyPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showKeyPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.keyPassword && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.keyPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${disabled
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            : 'btn-primary text-black hover:shadow-lg hover:shadow-lime-500/25'
          }`}
      >
        {disabled ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            Sign My AAB
            <ArrowRightIcon className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
