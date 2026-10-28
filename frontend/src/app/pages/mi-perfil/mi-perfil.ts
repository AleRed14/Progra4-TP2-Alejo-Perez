import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Vista de Mi Perfil de Usuario.
 * Exigida para el Sprint 1 con estilos definidos, datos de la sesión y maqueta de actividad.
 */
@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent {
  protected readonly authService = inject(AutenticacionService);
  private readonly notificacionService = inject(NotificacionService);

  // Señal del usuario actualmente autenticado
  protected readonly usuario = this.authService.usuarioActual;

  // Controla si la imagen de perfil falló al cargar para mostrar el avatar por defecto
  protected readonly errorImagen = signal<boolean>(false);

  protected readonly mostrarFoto = computed(() => {
    const url = this.usuario()?.fotoPerfilUrl;
    return (
      !!url &&
      url !== 'assets/imagenes/avatar-defecto.png' &&
      !this.errorImagen()
    );
  });

  onErrorImagen(): void {
    this.errorImagen.set(true);
  }

  /**
   * Notificación para la funcionalidad de edición (Sprint 2).
   */
  editarPerfil(): void {
    this.notificacionService.info(
      'En el Sprint 2 podrás editar tu información personal y foto de perfil mediante el modal.'
    );
  }
}
