# Memoria del Proyecto – Albert

En este documento explico los tres puntos que hemos implementado en nuestra aplicación Vue según lo que se pedía en la entrega final.

---

## 1. Método de pago con PayPal

Hemos integrado el sistema de pago de PayPal en modo prueba usando su SDK oficial. Esta parte está hecha en el componente `CheckOut.vue`. Cuando el usuario hace clic en pagar, se abre la pasarela de PayPal, y una vez aprobado el pago:

- Se guarda el pedido en Firestore (nombre, email, dirección, total, etc.).
- Se vacía automáticamente el carrito.
- El usuario vuelve a la pantalla principal con un mensaje de confirmación.

La lógica está coordinada desde `Principal.vue`, que se encarga de pasar el total y mostrar la pantalla de pago.

---

## 2. Sistema de idiomas y localización

Toda la web está traducida a español e inglés usando `vue-i18n`. Detecta el idioma del navegador, pero también se puede cambiar manualmente desde el menú superior.

Los textos están organizados en dos archivos: `es.json` y `en.json`, dentro de la carpeta `Idiomas`. 
Además, el idioma seleccionado se guarda en Firestore en el perfil del usuario, así cuando vuelve a entrar se mantiene su preferencia.

También adaptamos la moneda según el idioma. Si está en inglés, se muestran los precios en libras; si está en español, en euros.

---

## 3. Integración de Google Maps

En la sección de contacto (`contact.vue`) hemos integrado un mapa de Google Maps usando `vue3-google-map`. 
El mapa muestra nuestra ubicación con un marcador. Si haces clic en el marcador, se abre una ventana con la dirección exacta y un enlace que te lleva a Google Maps.

Todo el mapa está metido en un contenedor con diseño bonito: tiene sombra, esquinas redondeadas y fondo blanco semitransparente para que combine con el resto de la web. Es totalmente responsive y funciona en cualquier pantalla.

