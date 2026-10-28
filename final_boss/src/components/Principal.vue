<script setup>
import Registro from './auth/Registro.vue';
import Login from './auth/Login.vue';
import Home from './home/Home.vue';
import Perfil from "./menu/Perfil.vue";
import CookiesConsent from './auth/CookiesConsent.vue';
import Contact from './menu/contact.vue';
import Carrito from './menu/Carrito.vue';
import CheckOut from './menu/CheckOut.vue';
import Footer from "./footer/Footer.vue";
import Loading from './auth/Loading.vue';
import { defineProps, ref, onMounted, onUnmounted, computed } from 'vue';

const prope = defineProps({
  sTitulo: {
    type: String,
    default: 'UTUNBU'
  }
});

const fondoActual = computed(() => {
  if (blLoginVisible.value || blRegistroVisible.value) {
    return 'fondoColonias';
  } else {
    return 'fondoMarmol';
  }
});

// Control de visibilidad de pantallas
const blLoginVisible = ref(false);
const blRegistroVisible = ref(false);
const blHomeVisible = ref(true);
const blPerfilVisible = ref(false);
const blContactVisible = ref(false);
const blCarritoVisible = ref(false);
const blCheckOutVisible = ref(false);
const cookiesAceptadas = ref(localStorage.getItem("cookiesAceptadas") === "true");

// Datos del dispositivo
const tipoDispositivo = ref('desktop');
const resolucionPantalla = ref({ ancho: window.innerWidth, alto: window.innerHeight });

const cargando = ref(false); // estado global del loader

function detectarDispositivo() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipod|android.*mobile|windows.*phone/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  tipoDispositivo.value = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  resolucionPantalla.value = { ancho: window.innerWidth, alto: window.innerHeight };
}

onMounted(() => {
  detectarDispositivo();
  window.addEventListener('resize', detectarDispositivo);
});

onUnmounted(() => {
  window.removeEventListener('resize', detectarDispositivo);
});

// Control de cookies
const handleCookiesAceptadas = () => {
    cookiesAceptadas.value = true;
    localStorage.setItem("cookiesAceptadas", "true");
};

// Función para ocultar todas las pantallas
function ocultarTodo() {
  blLoginVisible.value = false;
  blRegistroVisible.value = false;
  blHomeVisible.value = false;
  blPerfilVisible.value = false;
  blContactVisible.value = false;
  blCarritoVisible.value = false;
  blCheckOutVisible.value = false;
}

// Funciones para cambiar pantallas
function mostrarRegistro() {
  ocultarTodo();
  blRegistroVisible.value = true;
}

function mostrarLogin() {
  ocultarTodo();
  blLoginVisible.value = true;
}

function mostrarHome() {
  ocultarTodo();
  blHomeVisible.value = true;
}

function mostrarPerfil() {
  ocultarTodo();
  blPerfilVisible.value = true;
}

function mostrarContacto() {
  ocultarTodo();
  blContactVisible.value = true;
}

function mostrarCarrito() {
  ocultarTodo();
  blCarritoVisible.value = true;
}

const totalPedido = ref(0);

function mostrarCheckOut(total) {
  totalPedido.value = total;
  ocultarTodo();
  blCheckOutVisible.value = true;
}

function mostrarHomeConCarga() {
  cargando.value = true;
  setTimeout(() => {
    cargando.value = false;
    mostrarHome(); // tu función original que activa `blHomeVisible`
  }, 3000);
}
</script>

<template>
  <CookiesConsent v-if="!cookiesAceptadas" @cookiesAceptadas="handleCookiesAceptadas" />

  <div :class="['contenedor', fondoActual]">

    <div class="loginregistro">
      <Login 
        v-if="blLoginVisible" 
        @cambioARegistro="mostrarRegistro" 
        @loginConExito="mostrarHomeConCarga"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <Registro 
        v-if="blRegistroVisible" 
        @cambioALogin="mostrarLogin" 
        @loginConExito="mostrarHomeConCarga"
        :aceptaCookies="cookiesAceptadas"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <Home 
        v-if="blHomeVisible" 
        @cambioAPerfil="mostrarPerfil" 
        @login="mostrarLogin" 
        @registro="mostrarRegistro" 
        @mostrarHome="mostrarHome" 
        @cambioAContacto="mostrarContacto" 
        @mostrarCarrito="mostrarCarrito"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <Perfil 
        v-if="blPerfilVisible" 
        @cambioAHome="mostrarHome" 
        @cambioAContacto="mostrarContacto" 
        @mostrarCarrito="mostrarCarrito"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <Contact 
        v-if="blContactVisible" 
        @cambioAHome="mostrarHome" 
        @cambioAContacto="mostrarContacto" 
        @cambioAPerfil="mostrarPerfil" 
        @login="mostrarLogin" 
        @registro="mostrarRegistro" 
        @mostrarCarrito="mostrarCarrito"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <Carrito 
        v-if="blCarritoVisible" 
        @cambioAHome="mostrarHome" 
        @cambioAContacto="mostrarContacto" 
        @cambioAPerfil="mostrarPerfil" 
        @login="mostrarLogin" 
        @registro="mostrarRegistro" 
        @mostrarCarrito="mostrarCarrito"
        @tramitarPedido="mostrarCheckOut"
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />

      <CheckOut 
        v-if="blCheckOutVisible" 
        :total="totalPedido" 
        @cancelar="mostrarCarrito" 
        @pedidoOK="mostrarHome"
      /> 
      <Footer v-if="!blLoginVisible && !blRegistroVisible" />

    </div>
  </div>

  <transition name="fade-zoom" mode="out-in">
    <Loading v-if="cargando" />
  </transition>
</template>

<style scoped>
.contenedor {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Empuja el contenido al centro y el footer abajo */
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

.fondoMarmol {
  background-image: url('@/assets/marmol.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.fondoColonias {
  background-image: url('@/assets/fondoColonias.png'); /* o .jpg si es ese el formato real */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.loginregistro {
  flex-grow: 1; /* Permite que el contenido crezca ocupando el espacio disponible */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.footer {
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
  text-align: center;
  margin-top: auto;
}
</style>

<style>
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-zoom-enter-to,
.fade-zoom-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
