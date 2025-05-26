export interface Egresado {
  fotoPerfil: string;
  id: string;
  mail: string;
  nombre: string;
  apellido: string;
  genero?: string;
  ubicacion?: string;
  perfilLinkedin?: string;
  urlRepositorio?: string;
  experienciaLaboral?: string;
  situacionLaboral?: string;
  telefono?: string;
  carrera: string;
  anioEgreso: string;
  isActive: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}