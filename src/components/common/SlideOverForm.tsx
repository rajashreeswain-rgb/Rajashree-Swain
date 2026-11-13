/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Save, AlertCircle } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;
}

interface SlideOverFormProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => Promise<boolean | void> | boolean | void;
  fields?: FormField[];
  children?: React.ReactNode;
  initialValues?: Record<string, any>;
  submitLabel?: string;
}

export const SlideOverForm: React.FC<SlideOverFormProps> = ({
  isOpen,
  title,
  description,
  onClose,
  onSubmit,
  fields = [],
  children,
  initialValues = {},
  submitLabel = 'Save Record',
}) => {
  const { showToast } = useAppStore();
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when form opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.name];
        if (val === undefined || val === null || String(val).trim() === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct validation errors before saving', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmit(formData);
      if (res !== false) {
        showToast('Record saved successfully', 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {children ? (
              children
            ) : (
              fields.map((field) => {
                const hasError = !!errors[field.name];
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      {field.label}
                      {field.required && (
                        <span className="text-rose-600 font-bold ml-1">*</span>
                      )}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden transition-colors ${
                          hasError
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select {field.label}...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden transition-colors ${
                          hasError
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={formData[field.name] !== undefined ? formData[field.name] : ''}
                        onChange={(e) =>
                          handleChange(
                            field.name,
                            field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                          )
                        }
                        className={`w-full px-3 py-1.5 text-xs bg-white border rounded focus:outline-hidden transition-colors ${
                          hasError
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                    )}

                    {hasError && (
                      <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium pt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}

                    {field.helpText && !hasError && (
                      <p className="text-[11px] text-slate-400">{field.helpText}</p>
                    )}
                  </div>
                );
              })
            )}

            {/* Sticky Actions Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submitLabel}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
