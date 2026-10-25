import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastMensajesComponent } from './components/toast-mensajes/toast-mensajes';

/**
 * Shell Principal de la Aplicación Patitas.
 * Contiene la cabecera (Navbar), el punto de inserción de vistas (RouterOutlet)
 * y el contenedor global de notificaciones y modales (ToastMensajes).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastMensajesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
