import { Component, inject, signal } from '@angular/core';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

export interface PublicacionMaqueta {
  id: string;
  titulo: string;
  descripcion: string;
  autorNombre: string;
  autorUsuario: string;
  tiempo: string;
  cantidadMeGusta: number;
  dioMeGusta: boolean;
  comentariosCount: number;
  iconoMascota: string;
}

/**
 * Vista de Feed Principal de Publicaciones.
 * Exigida en el Sprint 1 con estilos definidos y maquetación navegable.
 */
@Component({
  selector: 'app-publicaciones',
  imports: [],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class PublicacionesComponent {
  protected readonly authService = inject(AutenticacionService);
  private readonly notificacionService = inject(NotificacionService);

  // Estado del ordenamiento (Sprint 2)
  protected readonly criterioOrden = signal<'fecha' | 'megusta'>('fecha');

  // Datos representativos temáticos de mascotas para Sprint 1
  protected readonly publicaciones = signal<PublicacionMaqueta[]>([
    {
      id: 'post-1',
      titulo: '¡Milo aprendió a dar la patita después de semanas de práctica! 🐶',
      descripcion:
        'Hoy Milo por fin entendió el truco de la patita usando premios de pollo casero. Es un mestizo que rescatamos hace 6 meses y cada día está más adaptado a la familia.',
      autorNombre: 'Ignacio Pérez',
      autorUsuario: 'nacho_user',
      tiempo: 'Hace 2 horas',
      cantidadMeGusta: 14,
      dioMeGusta: true,
      comentariosCount: 4,
      iconoMascota: '🐕',
    },
    {
      id: 'post-2',
      titulo: 'Luna durmiendo en su lugar favorito de la tarde 🐱☀️',
      descripcion:
        'Apenas entra el rayo de sol por la ventana del living, Luna se acomoda y no se mueve por tres horas seguidas. ¿Las mascotas de ustedes también buscan el calorcito?',
      autorNombre: 'Camila Rossi',
      autorUsuario: 'cami_cats',
      tiempo: 'Hace 5 horas',
      cantidadMeGusta: 28,
      dioMeGusta: false,
      comentariosCount: 6,
      iconoMascota: '🐈',
    },
    {
      id: 'post-3',
      titulo: 'Jornada de adopción responsable este sábado en la plaza 🌳',
      descripcion:
        'Les recordamos a todos que este sábado desde las 14hs estaremos con el refugio presentando perritos y gatitos vacunados y desparasitados que buscan un hogar definitivo.',
      autorNombre: 'Administrador Patitas',
      autorUsuario: 'admin_pets',
      tiempo: 'Ayer',
      cantidadMeGusta: 45,
      dioMeGusta: false,
      comentariosCount: 11,
      iconoMascota: '🐾',
    },
  ]);

  /**
   * Cambia el criterio de ordenamiento (Fecha vs Me gusta).
   */
  cambiarOrden(orden: 'fecha' | 'megusta'): void {
    this.criterioOrden.set(orden);
    this.notificacionService.info(
      `Ordenando feed por ${orden === 'fecha' ? 'más recientes' : 'más populares'}.`
    );
  }

  /**
   * Acción de dar/quitar me gusta interactivo.
   */
  toggleMeGusta(post: PublicacionMaqueta): void {
    this.publicaciones.update((lista) =>
      lista.map((p) => {
        if (p.id === post.id) {
          const nuevoEstado = !p.dioMeGusta;
          return {
            ...p,
            dioMeGusta: nuevoEstado,
            cantidadMeGusta: nuevoEstado ? p.cantidadMeGusta + 1 : p.cantidadMeGusta - 1,
          };
        }
        return p;
      })
    );
  }

  /**
   * Aviso sobre la creación de posts (Sprint 2).
   */
  abrirModalCrear(): void {
    this.notificacionService.info(
      'En el Sprint 2 podrás crear nuevas publicaciones y subir fotos de tus mascotas.'
    );
  }

  /**
   * Prueba interactiva del modal de confirmación al eliminar.
   */
  async eliminarPost(post: PublicacionMaqueta): Promise<void> {
    const confirmado = await this.notificacionService.confirmar(
      'Eliminar Publicación',
      `¿Estás seguro de que deseás eliminar "${post.titulo}"? Esta acción aplicará baja lógica.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (confirmado) {
      this.publicaciones.update((lista) => lista.filter((p) => p.id !== post.id));
      this.notificacionService.exito('Publicación eliminada correctamente.');
    }
  }
}

