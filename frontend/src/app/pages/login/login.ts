import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Página de Inicio de Sesión.
 * Incluye formulario validado y botones de acceso rápido para la cátedra.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacionService);
  private readonly router = inject(Router);
  private readonly notificacionService = inject(NotificacionService);

  // Estados locales con Signals
  protected readonly cargando = signal<boolean>(false);
  protected readonly errorMensaje = signal<string | null>(null);

  // Formulario reactivo
  readonly form: FormGroup = this.fb.group({
    identificador: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Completa automáticamente el formulario con los usuarios de prueba exigidos por la cátedra.
   */
  usarCredencialesPrueba(tipo: 'usuario' | 'admin'): void {
    const cred = this.authService.credencialesPrueba[tipo];
    this.form.patchValue({
      identificador: cred.identificador,
      password: cred.password,
    });
    this.errorMensaje.set(null);
    this.notificacionService.info(
      `Credenciales de ${tipo === 'admin' ? 'Administrador' : 'Usuario'} cargadas.`
    );
  }

  /**
   * Envía las credenciales al servicio de autenticación.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.notificacionService.exito(`¡Bienvenido de nuevo, ${res.usuario.nombre}!`);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.cargando.set(false);
        // Regla estricta de cátedra: "Las credenciales no son correctas"
        const mensaje = err.error?.mensaje || 'Las credenciales no son correctas';
        this.errorMensaje.set(mensaje);
        this.notificacionService.error(mensaje);
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
