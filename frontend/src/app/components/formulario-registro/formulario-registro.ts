import { Component, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PerfilUsuario, RegistroUsuarioDto } from '../../models/usuario.model';

/**
 * Validador personalizado que comprueba que 'password' y 'repetirPassword' coincidan.
 */
export const coincidenciaPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const repetir = control.get('repetirPassword')?.value;

  if (!password || !repetir) {
    return null;
  }

  return password === repetir ? null : { passwordNoCoincide: true };
};

/**
 * Componente presentacional reutilizable de Registro de Usuarios.
 * Cumple con los requisitos estrictos de la cátedra para el Sprint 1
 * y queda preparado para ser reutilizado en el panel de Administrador del Sprint 4.
 */
@Component({
  selector: 'app-formulario-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-registro.html',
  styleUrl: './formulario-registro.css',
})
export class FormularioRegistroComponent {
  private readonly fb = inject(FormBuilder);

  // Inputs y Outputs modernos (funciones nativas de Angular 22)
  readonly esAdminCreando = input<boolean>(false);
  readonly cargando = input<boolean>(false);
  readonly formularioEnviado = output<RegistroUsuarioDto>();

  // Estado local para previsualización de foto de perfil
  protected nombreArchivoSeleccionado: string | null = null;

  /**
   * Formulario reactivo con validaciones exhaustivas en tiempo real.
   * Regla de contraseña: mínimo 8 caracteres, al menos una mayúscula y un número.
   */
  readonly form: FormGroup = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(25),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/), // Al menos 1 mayúscula y 1 número
        ],
      ],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(200)]],
      fotoPerfilUrl: ['assets/imagenes/avatar-defecto.png'],
      perfil: ['usuario' as PerfilUsuario],
    },
    { validators: [coincidenciaPasswordValidator] }
  );

  // Getters auxiliares para verificar requisitos de contraseña en tiempo real
  get passwordValor(): string {
    return this.form.get('password')?.value || '';
  }

  get tieneLongitudMinima(): boolean {
    return this.passwordValor.length >= 8;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.passwordValor);
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.passwordValor);
  }

  get passwordsCoinciden(): boolean {
    const repetir = this.form.get('repetirPassword')?.value || '';
    return this.passwordValor.length > 0 && this.passwordValor === repetir;
  }

  /**
   * Captura el archivo de imagen de perfil seleccionado (requisito de clase 10).
   */
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.nombreArchivoSeleccionado = archivo.name;
    }
  }

  /**
   * Valida y emite los datos hacia el componente padre.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.value;
    const dto: RegistroUsuarioDto = {
      nombre: valor.nombre.trim(),
      apellido: valor.apellido.trim(),
      correo: valor.correo.toLowerCase().trim(),
      nombreUsuario: valor.nombreUsuario.toLowerCase().trim(),
      password: valor.password,
      fechaNacimiento: valor.fechaNacimiento,
      descripcion: valor.descripcion?.trim() || '',
      fotoPerfilUrl: valor.fotoPerfilUrl,
    };

    this.formularioEnviado.emit(dto);
  }

  /**
   * Helper de validación de campo para mensajes de error accesibles.
   */
  campoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }
}

