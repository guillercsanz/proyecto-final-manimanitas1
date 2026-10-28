<script setup>
import { ref, defineEmits, onMounted } from 'vue';

const emit = defineEmits(["cookiesAceptadas"]);

const cookiesAceptadas = ref(localStorage.getItem("cookiesAceptadas") === "true");
const mostrarModal = ref(false);
const mostrarCookies = ref(!cookiesAceptadas.value);

onMounted(() => {
  cookiesAceptadas.value = localStorage.getItem("cookiesAceptadas") === "true";
  mostrarCookies.value = !cookiesAceptadas.value;
});

const aceptarCookies = () => {
  localStorage.setItem("cookiesAceptadas", "true");
  cookiesAceptadas.value = true;
  mostrarCookies.value = false;
  emit("cookiesAceptadas");
  window.dispatchEvent(new Event("storage"));
};

const mostrarPolitica = () => {
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};
</script>

<template>
<!-- Diálogo de aceptación de cookies -->
<v-dialog v-model="mostrarCookies" persistent max-width="520" transition="scale-transition">
  <v-card
    class="pa-5 rounded-xl"
    style="backdrop-filter: blur(12px); background: rgba(30, 30, 30, 0.8); color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.6);"
  >
    <v-card-title class="justify-center text-h6 font-weight-bold mb-2" style="color: #f6911d;">
      <v-icon class="mr-2 pulse-cookie" size="26">mdi-cookie</v-icon>
      Política de Cookies
      <v-icon class="ml-2 pulse-cookie" size="26">mdi-cookie</v-icon>
    </v-card-title>

    <v-card-text class="text-center" style="color: #e0e0e0;">
      Utilizamos cookies para ofrecerte una mejor experiencia, personalizar contenido
      y analizar el tráfico. <br />
      Al continuar navegando aceptas nuestra política de cookies.
      <br />
      <a @click.prevent="mostrarPolitica" class="text-orange font-weight-bold" style="cursor: pointer;">Leer más</a>
    </v-card-text>

    <v-card-actions class="d-flex justify-center mt-4">
      <v-btn
        color="#f6911d"
        class="text-black font-weight-bold px-8 py-2 rounded-xl"
        variant="elevated"
        @click="aceptarCookies"
        style="transition: transform 0.2s ease;"
        @mouseover="(e) => e.currentTarget.style.transform = 'scale(1.05)'"
        @mouseleave="(e) => e.currentTarget.style.transform = 'scale(1)'"
      >
        <v-icon left>mdi-check</v-icon>
        ACEPTAR
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


  <!-- Política completa (igual que antes) -->
  <v-dialog v-model="mostrarModal" max-width="600">
    <v-card>
      <v-card-title class="headline justify-center">🍪 Política de Cookies 🍪</v-card-title>
        <v-card-text class="contenido-politica">
          <p><v-icon class="mr-1">mdi-calendar</v-icon>
            <strong>Última actualización:</strong> <span class="fecha">03/03/2025</span>
          </p>

          <h3><v-icon class="mr-1">mdi-cookie</v-icon> ¿Qué son las cookies?</h3>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio. 
            Sirven para mejorar tu experiencia de navegación, guardar tus preferencias y analizar el uso del sitio.
          </p>

          <h3><v-icon class="mr-1">mdi-list-status</v-icon> Tipos de cookies que usamos</h3>
          <ul>
            <li><strong>Esenciales:</strong> necesarias para el funcionamiento correcto del sitio.</li>
            <li><strong>Preferencias:</strong> recuerdan tus elecciones y configuraciones.</li>
            <li><strong>Estadísticas:</strong> recopilan datos anónimos de uso para mejorar nuestros servicios.</li>
            <li><strong>Marketing:</strong> usadas para mostrarte anuncios relevantes.</li>
          </ul>

          <h3><v-icon class="mr-1">mdi-cog</v-icon> ¿Cómo gestionamos las cookies?</h3>
          <p>
            Te solicitamos tu consentimiento al acceder por primera vez. Siempre puedes modificar tus preferencias desde la configuración del navegador.
          </p>

          <h3><v-icon class="mr-1">mdi-delete</v-icon> ¿Cómo desactivar o eliminar cookies?</h3>
          <p>Puedes hacerlo desde tu navegador:</p>
          <ul class="enlaces">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank">Mozilla Firefox</a></li>
            <li><a href="https://support.microsoft.com/es-es/help/4027947" target="_blank">Microsoft Edge</a></li>
          </ul>

          <h3><v-icon color="orange" class="mr-1">mdi-email</v-icon> Contacto</h3>
          <p>Si tienes dudas, puedes escribirnos a <a href="mailto:contacto.utunbu@gmail.com">contacto.utunbu@gmail.com</a></p>
        </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text color="red" @click="cerrarModal">
          <v-icon left>mdi-close</v-icon> Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cookie-glass {
  background: rgba(0, 0, 0, 0.65);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  padding: 20px;
  color: #fff;
  text-align: center;
}

.titulo-cookies {
  font-size: 1.5rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

.pulse-cookie {
  animation: pulse 1.6s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.texto-cookies {
  font-size: 1rem;
  line-height: 1.6;
  margin-top: 10px;
  color: #f0f0f0;
}

.texto-cookies a {
  color: #f6911d;
  font-weight: bold;
  text-decoration: underline;
}

.boton-aceptar {
  background: linear-gradient(90deg, #f6911d, #ffcc70);
  color: black;
  font-weight: bold;
  border-radius: 12px;
  padding: 10px 24px;
  transition: transform 0.2s;
}

.boton-aceptar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px #f6911d;
}

.contenido-politica {
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  font-family: 'Poppins', sans-serif;
}

.contenido-politica h3 {
  font-weight: 600;
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
  color: #f6911d;
  display: flex;
  align-items: center;
}

.contenido-politica ul {
  padding-left: 1.4rem;
  margin-bottom: 1rem;
}

.contenido-politica ul li {
  margin-bottom: 0.4rem;
}

.contenido-politica .enlaces li a {
  color: #1e88e5;
  text-decoration: underline;
  font-weight: 500;
}

.contenido-politica a:hover {
  text-decoration: none;
  color: #0d47a1;
}

.fecha {
  color: #555;
  font-style: italic;
}
</style>