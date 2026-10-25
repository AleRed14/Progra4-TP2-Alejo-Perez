import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormularioRegistroComponent } from '../../components/formulario-registro/formulario-registro';
import { RegistroUsuarioDto } from '../../models/usuario.model';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Página de Registro Público de Usuarios.
 * Conecta el componente presentacional FormularioRegistro con el servicio de autenticación.
 */
@Component({
  selector: 'app-registro',
  imports: [FormularioRegistroComponent, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  private readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly notificacionService = inject(NotificacionService);

  protected readonly cargando = signal<boolean>(false);

  /**
   * Recibe el evento emitido por el formulario hijo y realiza el registro.
   */
  onRegistro(dto: RegistroUsuarioDto): void {
    this.cargando.set(true);

    this.authService.registro(dto).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.notificacionService.exito(
          res.mensaje || '¡Cuenta creada con éxito! Ya podés iniciar sesión.'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando.set(false);
        const mensaje =
          err.error?.mensaje || 'No pudimos completar tu registro. Revisá los campos.';
        this.notificacionService.error(mensaje);
      },
    });
  }
}

