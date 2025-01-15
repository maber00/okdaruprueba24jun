// src/app/shared/hooks/useForm.ts
import { useState, useCallback } from 'react';

export type FormFieldValue = string | number | boolean | null | undefined;

interface FormConfig<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T | 'submit', string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: FormFieldValue) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: FormFieldValue) => void;
  updateValues: (values: Partial<T>) => void;
  resetForm: () => void;
}

export function useForm<T extends Record<string, FormFieldValue>>({
  initialValues,
  onSubmit,
  validate
}: FormConfig<T>): UseFormReturn<T> {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T | 'submit', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((currentValues: T) => {
    if (validate) {
      const validationErrors = validate(currentValues);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [validate]);

  const handleChange = useCallback((name: keyof T, value: FormFieldValue) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: FormFieldValue) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const updateValues = useCallback((newValues: Partial<T>) => {
    setFormValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formValues)) {
      // Marcar todos los campos como touched para mostrar errores
      const allTouched = Object.keys(formValues).reduce<Partial<Record<keyof T, boolean>>>((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {});
      
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values: formValues,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    updateValues,
    resetForm
  };
}

// Ejemplo de uso con tipos específicos:
/*
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginComponent() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm<LoginForm>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginForm, string>> = {};
      if (!values.email) {
        errors.email = 'Email es requerido';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Email inválido';
      }
      if (!values.password) {
        errors.password = 'Contraseña es requerida';
      }
      return errors;
    },
    onSubmit: async (values) => {
      await loginUser(values);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
        {touched.email && errors.email && <span>{errors.email}</span>}
      </div>
      {errors.submit && <div className="error">{errors.submit}</div>}
    </form>
  );
}
*/