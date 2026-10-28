import { Component, inject, input, output, signal } from '@angular/core';
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
import { NotificacionService } from '../../services/notificacion.service';
import { NgOptimizedImage } from '@angular/common';

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
 * Validador personalizado para los selectores de Día, Mes y Año.
 * Verifica que sea una fecha de calendario real (evita ej. 31 de Febrero)
 * y que no esté en el futuro.
 */
export const fechaValidaValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const dia = control.get('diaNacimiento')?.value;
  const mes = control.get('mesNacimiento')?.value;
  const anio = control.get('anioNacimiento')?.value;

  if (!dia || !mes || !anio) {
    return null;
  }

  const d = parseInt(dia, 10);
  const m = parseInt(mes, 10) - 1;
  const a = parseInt(anio, 10);

  const fecha = new Date(a, m, d);
  if (
    fecha.getFullYear() !== a ||
    fecha.getMonth() !== m ||
    fecha.getDate() !== d
  ) {
    return { fechaInvalida: true };
  }

  const hoy = new Date();
  if (fecha > hoy) {
    return { fechaFutura: true };
  }

  return null;
};

/**
 * Componente presentacional reutilizable de Registro de Usuarios.
 * Cumple con los requisitos estrictos de la cátedra para el Sprint 1
 * y queda preparado para ser reutilizado en el panel de Administrador del Sprint 4.
 */
@Component({
  selector: 'app-formulario-registro',
  imports: [ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './formulario-registro.html',
  styleUrl: './formulario-registro.css',
})
export class FormularioRegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificacionService = inject(NotificacionService);

  // Inputs y Outputs modernos (funciones nativas de Angular 22)
  readonly esAdminCreando = input<boolean>(false);
  readonly cargando = input<boolean>(false);
  readonly formularioEnviado = output<RegistroUsuarioDto>();

  // Límite de caracteres para la descripción
  readonly MAX_DESCRIPCION = 160;

  // Listas de opciones para los selectores de fecha en orden Día, Mes, Año
  readonly dias = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  readonly meses = [
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' },
  ];
  readonly anios = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // Estado local para Drag & Drop y previsualización de foto de perfil
  protected readonly estaArrastrando = signal<boolean>(false);
  protected readonly previewUrl = signal<string | null>(null);
  protected nombreArchivoSeleccionado: string | null = null;
  private archivoSeleccionado: File | null = null;

  /**
   * Formulario reactivo con validaciones exhaustivas en tiempo real.
   * Regla de contraseña: mínimo 8 caracteres, al menos una minúscula, una mayúscula y un número.
   */
  readonly form: FormGroup = this.fb.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/),
        ],
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/),
        ],
      ],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      nombreUsuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(16),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      repetirPassword: ['', [Validators.required]],
      diaNacimiento: ['', [Validators.required]],
      mesNacimiento: ['', [Validators.required]],
      anioNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(160)]],
      perfil: ['usuario' as PerfilUsuario],
    },
    { validators: [coincidenciaPasswordValidator, fechaValidaValidator] }
  );

  // Getters auxiliares para verificar requisitos de contraseña en tiempo real
  get passwordValor(): string {
    return this.form.get('password')?.value || '';
  }

  get tieneLongitudMinima(): boolean {
    return this.passwordValor.length >= 8;
  }

  get tieneMayuscula(): boolean {
    return /[A-Z]/.test(this.passwordValor) && /[a-z]/.test(this.passwordValor);
  }

  get tieneNumero(): boolean {
    return /\d/.test(this.passwordValor);
  }

  get passwordsCoinciden(): boolean {
    const repetir = this.form.get('repetirPassword')?.value || '';
    return this.passwordValor.length > 0 && this.passwordValor === repetir;
  }

  // Getters para el indicador de caracteres de la descripción
  get descripcionValor(): string {
    return this.form.get('descripcion')?.value || '';
  }

  get descripcionLongitud(): number {
    return this.descripcionValor.length;
  }

  get descripcionExcedida(): boolean {
    return this.descripcionLongitud > this.MAX_DESCRIPCION;
  }

  // --- Manejo de Drag & Drop ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastrando.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastrando.set(false);

    const archivos = event.dataTransfer?.files;
    if (archivos && archivos.length > 0) {
      this.procesarArchivo(archivos[0]);
    }
  }

  /**
   * Captura el archivo seleccionado mediante el explorador de archivos.
   */
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  /**
   * Valida el formato y tamaño, y genera la URL temporal de previsualización.
   */
  private procesarArchivo(archivo: File): void {
    const formatosValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!formatosValidos.includes(archivo.type)) {
      this.notificacionService.advertencia(
        'Por favor seleccioná un archivo de imagen válido (.jpg, .png o .webp).'
      );
      return;
    }

    const limiteBytes = 5 * 1024 * 1024; // 5 MB
    if (archivo.size > limiteBytes) {
      this.notificacionService.advertencia('La imagen no puede superar los 5 MB.');
      return;
    }

    // Liberar URL anterior si existía para prevenir fugas de memoria
    const urlAnterior = this.previewUrl();
    if (urlAnterior) {
      URL.revokeObjectURL(urlAnterior);
    }

    this.archivoSeleccionado = archivo;
    this.nombreArchivoSeleccionado = archivo.name;
    this.previewUrl.set(URL.createObjectURL(archivo));
  }

  /**
   * Quita la foto seleccionada y restablece el input de archivo.
   */
  quitarFoto(event: MouseEvent, input: HTMLInputElement): void {
    event.stopPropagation();
    const urlAnterior = this.previewUrl();
    if (urlAnterior) {
      URL.revokeObjectURL(urlAnterior);
    }
    this.archivoSeleccionado = null;
    this.nombreArchivoSeleccionado = null;
    this.previewUrl.set(null);
    input.value = '';
  }

  /**
   * Valida y emite los datos hacia el componente padre unificando Día, Mes y Año en ISO YYYY-MM-DD.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.value;
    const fechaNacimiento = `${valor.anioNacimiento}-${valor.mesNacimiento}-${valor.diaNacimiento}`;

    const dto: RegistroUsuarioDto = {
      nombre: valor.nombre.trim(),
      apellido: valor.apellido.trim(),
      correo: valor.correo.toLowerCase().trim(),
      nombreUsuario: valor.nombreUsuario.toLowerCase().trim(),
      password: valor.password,
      fechaNacimiento,
      descripcion: valor.descripcion?.trim() || '',
      perfil: valor.perfil || 'usuario',
      fotoPerfil: this.archivoSeleccionado,
    };

    this.formularioEnviado.emit(dto);
  }

  /**
   * Helper de validación de campo general para mensajes accesibles.
   */
  campoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched));
  }

  /**
   * Helper de validación para los selectores de fecha de nacimiento.
   */
  fechaCampoInvalido(nombreCampo: string): boolean {
    const c = this.form.get(nombreCampo);
    const hayErrorGrupo = !!(
      (this.form.errors?.['fechaInvalida'] || this.form.errors?.['fechaFutura']) &&
      this.fechaTocada()
    );
    return !!(c && c.invalid && (c.dirty || c.touched)) || hayErrorGrupo;
  }

  fechaTocada(): boolean {
    const d = this.form.get('diaNacimiento');
    const m = this.form.get('mesNacimiento');
    const a = this.form.get('anioNacimiento');
    return !!((d?.touched || d?.dirty) && (m?.touched || m?.dirty) && (a?.touched || a?.dirty));
  }

  fechaIncompleta(): boolean {
    const d = this.form.get('diaNacimiento');
    const m = this.form.get('mesNacimiento');
    const a = this.form.get('anioNacimiento');
    const algunTocado = !!(d?.touched || m?.touched || a?.touched);
    const algunoVacio = !d?.value || !m?.value || !a?.value;
    return algunTocado && algunoVacio;
  }
}
