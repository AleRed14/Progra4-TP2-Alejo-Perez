import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Barra de navegación superior accesible y responsive.
 * Se adapta de forma reactiva al estado de autenticación de las Signals.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '(document:click)': 'cerrarMenu()',
    '(document:keydown.escape)': 'cerrarMenu()',
  },
})
export class NavbarComponent {
  protected readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly notificacionService = inject(NotificacionService);

  protected readonly errorImagen = signal<boolean>(false);
  protected readonly menuAbierto = signal<boolean>(false);

  protected readonly mostrarFoto = computed(() => {
    const url = this.authService.usuarioActual()?.fotoPerfilUrl;
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
   * Alterna la visibilidad del menú desplegable de usuario.
   */
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuAbierto.update((abierto) => !abierto);
  }

  /**
   * Cierra el menú desplegable de usuario.
   */
  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  /**
   * Cierra la sesión activa y redirige al usuario a la pantalla de login.
   */
  async cerrarSesion(): Promise<void> {
    this.cerrarMenu();

    const confirmar = await this.notificacionService.confirmar(
      'Cerrar Sesión',
      '¿Estás seguro de que deseás salir de Patitas?',
      'Sí, salir',
      'Cancelar'
    );

    if (confirmar) {
      this.authService.cerrarSesion();
      this.errorImagen.set(false);
      this.notificacionService.info('Sesión finalizada correctamente.');
      this.router.navigate(['/login']);
    }
  }
}
