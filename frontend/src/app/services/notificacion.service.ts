import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info' | 'advertencia';

export interface NotificacionToast {
  id: string;
  mensaje: string;
  tipo: TipoNotificacion;
  duracionMs: number;
}

export interface DialogoConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  resolver: (confirmado: boolean) => void;
}

/**
 * Servicio reactivo centralizado para el manejo de notificaciones visuales y diálogos.
 * Reemplazo absoluto y estricto de window.alert() y window.confirm() según las reglas del TP2.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  // Estado reactivo interno con Signals
  private readonly _toasts = signal<NotificacionToast[]>([]);
  private readonly _confirmacionActiva = signal<DialogoConfirmacion | null>(null);

  // Señales de solo lectura expuestas a los componentes
  readonly toasts = this._toasts.asReadonly();
  readonly confirmacionActiva = this._confirmacionActiva.asReadonly();

  /**
   * Muestra un toast no intrusivo flotante en pantalla con autodestrucción por temporizador.
   */
  mostrarToast(
    mensaje: string,
    tipo: TipoNotificacion = 'info',
    duracionMs: number = 4000
  ): void {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const nuevoToast: NotificacionToast = { id, mensaje, tipo, duracionMs };

    this._toasts.update((actuales) => [...actuales, nuevoToast]);

    if (duracionMs > 0) {
      setTimeout(() => {
        this.removerToast(id);
      }, duracionMs);
    }
  }

  /**
   * Atajos semánticos para mostrar notificaciones rápidas
   */
  exito(mensaje: string, duracionMs = 4000): void {
    this.mostrarToast(mensaje, 'exito', duracionMs);
  }

  error(mensaje: string, duracionMs = 5000): void {
    this.mostrarToast(mensaje, 'error', duracionMs);
  }

  advertencia(mensaje: string, duracionMs = 4500): void {
    this.mostrarToast(mensaje, 'advertencia', duracionMs);
  }

  info(mensaje: string, duracionMs = 4000): void {
    this.mostrarToast(mensaje, 'info', duracionMs);
  }

  /**
   * Remueve un toast específico por su ID.
   */
  removerToast(id: string): void {
    this._toasts.update((actuales) => actuales.filter((t) => t.id !== id));
  }

  /**
   * Despliega un diálogo modal de confirmación accesible (reemplazo de window.confirm)
   * Retorna una promesa que resuelve en true (confirmado) o false (cancelado).
   */
  confirmar(
    titulo: string,
    mensaje: string,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar'
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._confirmacionActiva.set({
        titulo,
        mensaje,
        textoConfirmar,
        textoCancelar,
        resolver: resolve,
      });
    });
  }

  /**
   * Resuelve el diálogo de confirmación actual y limpia el estado.
   */
  responderConfirmacion(confirmado: boolean): void {
    const dialogo = this._confirmacionActiva();
    if (dialogo) {
      dialogo.resolver(confirmado);
      this._confirmacionActiva.set(null);
    }
  }
}
