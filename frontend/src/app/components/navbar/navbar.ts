import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Barra de navegación superior accesible y responsive.
 * Se adapta de forma reactiva al estado de autenticación de las Signals.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  protected readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly notificacionService = inject(NotificacionService);

  /**
   * Cierra la sesión activa y redirige al usuario a la pantalla de login.
   */
  async cerrarSesion(): Promise<void> {
    const confirmar = await this.notificacionService.confirmar(
      'Cerrar Sesión',
      '¿Estás seguro de que deseás salir de Patitas?',
      'Sí, salir',
      'Cancelar'
    );

    if (confirmar) {
      this.authService.cerrarSesion();
      this.notificacionService.info('Sesión finalizada correctamente.');
      this.router.navigate(['/login']);
    }
  }
}

