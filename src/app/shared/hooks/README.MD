Shared Components
Este directorio contiene componentes, hooks y utilidades compartidas en toda la aplicación.
Estructura
Copyshared/
├── components/       # Componentes reutilizables
│   ├── layout/      # Componentes de layout
│   └── ui/          # Componentes de UI base
├── hooks/           # Custom hooks
└── utils/           # Utilidades generales
Componentes UI
Los componentes UI están construidos con:

Tailwind CSS para estilos
shadcn/ui como base
Diseño responsivo
Accesibilidad incorporada

Ejemplo de Uso
tsxCopyimport Button from '@/app/shared/components/ui/Button';
import Input from '@/app/shared/components/ui/Input';

function MyComponent() {
  return (
    <div>
      <Input 
        label="Email"
        type="email"
        placeholder="tu@email.com"
      />
      <Button variant="primary">
        Enviar
      </Button>
    </div>
  );
}
Hooks Personalizados
Hooks comunes para reutilizar lógica:
typescriptCopy// useForm.ts
export function useForm<T>({ 
  initialValues, 
  onSubmit, 
  validate 
}: FormConfig<T>) {
  // Implementación
}

// Uso
const { values, errors, handleSubmit } = useForm({
  initialValues: { email: '' },
  onSubmit: async (values) => {
    // Manejar submit
  }
});
Utilities
Funciones de utilidad comunes:
typescriptCopy// date.ts
export function formatDate(date: Date): string {
  // Implementación
}

// validation.ts
export function validateEmail(email: string): boolean {
  // Implementación
}
Añadir Nuevos Componentes

Crear archivo en la carpeta apropiada
Seguir la estructura existente
Documentar props y uso
Añadir ejemplos

Template de Componente
tsxCopyinterface MyComponentProps {
  /** Descripción de la prop */
  propName: PropType;
}

export function MyComponent({ propName }: MyComponentProps) {
  return (
    // JSX
  );
}
Mejores Prácticas

Mantén los componentes simples y enfocados
Usa TypeScript para props y tipos
Implementa pruebas unitarias
Documenta el uso y ejemplos
Sigue los principios de diseño establecidos