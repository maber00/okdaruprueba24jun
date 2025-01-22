Services
Este directorio contiene los servicios que manejan la lógica de negocio de DARU.
Estructura
Copyservices/
├── analytics/         # Servicios de análisis y métricas
├── billing/          # Servicios de facturación
├── projectManagement/# Gestión de proyectos
└── storage/          # Gestión de almacenamiento
Servicios Principales
Project Service
Maneja todas las operaciones relacionadas con proyectos:
typescriptCopyclass ProjectService {
  async createProject(data: ProjectInput): Promise<Project>
  async updateProject(id: string, data: Partial<Project>): Promise<Project>
  async deleteProject(id: string): Promise<void>
  // ...
}
Task Service
Gestiona las tareas y asignaciones:
typescriptCopyclass TaskService {
  async createTask(data: TaskInput): Promise<Task>
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task>
  async assignTask(taskId: string, userId: string): Promise<Task>
  // ...
}
Integración con Firebase
Los servicios utilizan Firebase como backend:

Firestore para datos
Storage para archivos
Authentication para usuarios

Ejemplo:
typescriptCopyclass StorageService {
  private storage = getStorage();

  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}
Creación de Nuevos Servicios

Crea una nueva clase en el directorio apropiado
Implementa métodos siguiendo el patrón establecido
Exporta una instancia singleton
Documenta la API pública

Template
typescriptCopyclass NewService {
  // Singleton
  private static instance: NewService;
  
  private constructor() {}
  
  static getInstance(): NewService {
    if (!NewService.instance) {
      NewService.instance = new NewService();
    }
    return NewService.instance;
  }

  // Métodos públicos
  async methodName(param: ParamType): Promise<ReturnType> {
    // Implementación
  }
}

export const newService = NewService.getInstance();
Mejores Prácticas

Mantén los servicios independientes
Usa inyección de dependencias cuando sea necesario
Maneja errores apropiadamente
Implementa logging para debugging
Escribe tests unitarios