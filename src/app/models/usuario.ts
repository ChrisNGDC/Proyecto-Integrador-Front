export interface Usuario {
  nombre: string;
  fotoPerfil: string;
  datos: {
    nombreCompleto: string;
    telefono: string;
    email: string;
    titulo: string;
    anioRecibido: string;
    poseeExperienciaLaboral: string;
    ubicacion: string;
  };
  descripcion: string;
}