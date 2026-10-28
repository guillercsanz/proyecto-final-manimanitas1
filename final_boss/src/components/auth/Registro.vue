<script setup>
import { ref, onMounted } from 'vue';
import { defineEmits, defineProps } from 'vue';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth } from '../../firebase';
import { useFirestore } from 'vuefire';

const props = defineProps({
  tipoDispositivo: { type: String, required: true },
  resolucionPantalla: { type: Object, required: true },
  aceptaCookies: { type: Boolean, required: true }
});

const sName = ref('');
const sEmailre = ref('');
const sPasswordre = ref('');
const sRepetirPassword = ref('');
const sCumpleanos = ref('');
const mostrarModal = ref(false);
const aceptaCookies = ref(false);
const db = useFirestore();
const emit = defineEmits(['cambioALogin', 'loginConExito']);

const snackbar = ref(false);
const snackbarMensaje = ref("");
const snackbarColor = ref("success");
const cargando = ref(false);
const textoCarga = ref("Creando cuenta...");

function mostrarSnackbar(mensaje, color = "success") {
  snackbarMensaje.value = mensaje;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(() => {
  aceptaCookies.value = localStorage.getItem("cookiesAceptadas") === "true";
  window.addEventListener("storage", () => {
    aceptaCookies.value = localStorage.getItem("cookiesAceptadas") === "true";
  });
});

function registrarPresionado() {
  if (!aceptaCookies.value) return mostrarSnackbar('Debes aceptar las cookies para registrarte.', 'error');
  if (!sEmailre.value || !sCumpleanos.value || !sPasswordre.value || !sRepetirPassword.value) {
    return mostrarSnackbar('Por favor completa todos los campos.', 'error');
  }
  if (sPasswordre.value !== sRepetirPassword.value) {
    return mostrarSnackbar('Las contraseñas no coinciden.', 'error');
  }

  cargando.value = true;

  createUserWithEmailAndPassword(auth, sEmailre.value, sPasswordre.value)
    .then((userCredential) => {
      const user = userCredential.user;
      enviarVerificacionCorreo(user);
      return guardarPerfil(user);
    })
    .then(() => {
      setTimeout(() => {
        cargando.value = false;
        emit('loginConExito');
      }, 1500);
    })
    .catch((error) => {
      cargando.value = false;
      registerNok(error);
    });
}

function enviarVerificacionCorreo(user) {
  sendEmailVerification(user)
    .then(() => mostrarSnackbar('Correo de verificación enviado.'))
    .catch(error => console.error('Error al enviar correo de verificación:', error.message));
}

function guardarPerfil(user) {
  const userDocRef = doc(db, 'Profiles', user.uid);

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      mostrarSnackbar('Ubicación no disponible, se guarda perfil sin ella.', 'warning');
      setDoc(userDocRef, {
        name: sName.value,
        email: user.email,
        creado: Timestamp.fromDate(new Date()),
        birthday: Timestamp.fromDate(new Date(sCumpleanos.value)),
        direccion: "",
        metodoPago: "",
        phone: ""
      }).then(() => {
        mostrarSnackbar('Perfil creado correctamente sin ubicación.');
        resolve();
      }).catch(reject);
    } else {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await setDoc(userDocRef, {
              name: sName.value,
              email: user.email,
              creado: Timestamp.fromDate(new Date()),
              birthday: Timestamp.fromDate(new Date(sCumpleanos.value)),
              direccion: "",
              metodoPago: "",
              phone: "",
              ubicacion: {
                latitud: position.coords.latitude,
                longitud: position.coords.longitude,
                timestamp: new Date()
              }
            });
            mostrarSnackbar('Perfil creado con ubicación.');
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        async () => {
          mostrarSnackbar('Ubicación no concedida, se guarda sin ella.', 'warning');
          try {
            await setDoc(userDocRef, {
              name: sName.value,
              email: user.email,
              creado: Timestamp.fromDate(new Date()),
              birthday: Timestamp.fromDate(new Date(sCumpleanos.value)),
              direccion: "",
              metodoPago: "",
              phone: ""
            });
            mostrarSnackbar('Perfil creado correctamente sin ubicación.');
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    }
  });
}


function registerNok(error) {
  let mensaje = '';
  if (error.code === 'auth/email-already-in-use') mensaje = 'Usuario existente. Inicia sesión.';
  else if (error.code === 'auth/weak-password') mensaje = 'Contraseña muy débil. Mínimo 6 caracteres.';
  else if (error.code === 'auth/invalid-email') mensaje = 'Correo inválido.';
  else mensaje = 'Error al registrar: ' + error.message;
  mostrarSnackbar(mensaje, 'error');
}

function cancelarPresionado() {
  emit('cambioALogin');
}

function mostrarPoliticas() {
  mostrarModal.value = true;
}
</script>

<template>
  <v-container class="glass-container d-flex justify-center align-center fill-height">
    <div class="glass-card animate-fade-in-up">
      <h1 class="titulo">Registro</h1>
      <p class="subtexto">Crea tu cuenta para empezar</p>

      <v-text-field label="Nombre" v-model="sName" class="input-registro" prepend-inner-icon="mdi-account" dense outlined hide-details />
      <v-text-field label="Fecha de nacimiento" v-model="sCumpleanos" type="date" class="input-registro" prepend-inner-icon="mdi-calendar" dense outlined hide-details />
      <v-text-field label="Correo electrónico" v-model="sEmailre" type="email" class="input-registro" prepend-inner-icon="mdi-email" dense outlined hide-details />
      <v-text-field label="Contraseña" v-model="sPasswordre" type="password" class="input-registro" prepend-inner-icon="mdi-lock" dense outlined hide-details />
      <v-text-field label="Repetir Contraseña" v-model="sRepetirPassword" type="password" class="input-registro" prepend-inner-icon="mdi-lock-check" dense outlined hide-details />

      <v-btn @click="registrarPresionado" block class="boton-registro mt-3">REGISTRAR</v-btn>
      <v-btn @click="cancelarPresionado" block class="boton-cancelar">CANCELAR</v-btn>
    </div>

    <!-- Diálogo de carga -->
    <v-dialog v-model="cargando" persistent width="220">
      <v-card class="pa-4 d-flex flex-column align-center justify-center glass-loader">
        <v-progress-circular indeterminate color="orange-darken-2" size="40" />
        <span class="mt-2 texto-cargando">{{ textoCarga }}</span>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000" location="bottom center">
      {{ snackbarMensaje }}
    </v-snackbar>

    <!-- Modal políticas -->
    <v-dialog v-model="mostrarModal" max-width="600">
      <v-card>
        <v-card-title>Política de Privacidad</v-card-title>
        <v-card-text>
          (Tu texto de políticas aquí)
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="mostrarModal = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

* { font-family: 'Poppins', sans-serif; }

.glass-card {
  background: rgba(0, 0, 0, 0.45);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: inset 0 0 5px rgba(255,255,255,0.05), 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  color: #fff;
}

.animate-fade-in-up {
  animation: fadeInUp 0.7s ease-out both;
}

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

.titulo {
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.subtexto {
  font-size: 0.95rem;
  margin-bottom: 20px;
  color: #e0e0e0;
}

.politica-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #ccc;
  font-size: 0.85rem;
}

.link-politicas {
  color: #90caf9;
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
}

.boton-registro,
.boton-cancelar {
  transition: all 0.2s ease;
  font-weight: bold;
  border-radius: 12px;
  color: black;
}

.boton-registro {
  background-color: #4caf50;
}

.boton-registro:hover {
  background-color: #66bb6a;
  transform: scale(1.02);
}

.boton-cancelar {
  background-color: #f44336;
  margin-top: 8px;
}

.boton-cancelar:hover {
  background-color: #ef5350;
  transform: scale(1.02);
}

.input-registro .v-field {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  color: white;
  transition: 0.2s ease-in-out;
}
.input-registro input {
  color: white;
}
.input-registro label {
  color: #ccc !important;
}
.input-registro .v-icon {
  color: #f6911d;
}

.glass-loader {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 15px rgba(0,0,0,0.4);
  color: white;
}

.texto-cargando {
  font-size: 0.9rem;
  color: #f6911d;
}
</style>
