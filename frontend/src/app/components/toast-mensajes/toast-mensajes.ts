import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-toast-mensajes',
  templateUrl: './toast-mensajes.html',
  styleUrl: './toast-mensajes.css',
})
export class ToastMensajesComponent {
  protected readonly notificacionService = inject(NotificacionService);
}

