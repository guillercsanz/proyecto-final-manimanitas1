<script setup>
import { ref, onMounted } from "vue";
import { defineEmits, defineProps } from "vue";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const props = defineProps({
  tipoDispositivo: { type: String, required: true },
  resolucionPantalla: { type: Object, required: true },
});

const sEmail = ref("");
const sPassword = ref("");
const usuarioAutenticado = ref(false);
const emit = defineEmits(["cambioARegistro", "loginConExito", "mostrarCookies"]);

const snackbar = ref(false);
const snackbarMensaje = ref("");
const snackbarColor = ref("success");

function mostrarSnackbar(mensaje, color = "success") {
  snackbarMensaje.value = mensaje;
  snackbarColor.value = color;
  snackbar.value = true;
}


onMounted(() => {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Persistencia configurada en almacenamiento local"))
    .catch((error) => console.error("Error al configurar persistencia:", error));

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario ya autenticado:", user);
      usuarioAutenticado.value = true;
      emit("loginConExito");
    } else {
      console.log("No hay usuario autenticado.");
      usuarioAutenticado.value = false;
    }
  });
});

function loginWithGoogle() {
  const cookiesAceptadas = localStorage.getItem("cookiesAceptadas") === "true";
  if (!cookiesAceptadas) {
    alert("Debes aceptar las cookies para iniciar sesión con Google.");
    return;
  }

  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const userDocRef = doc(db, "Profiles", user.uid);
      return getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          return setDoc(userDocRef, {
            name: user.displayName || "Usuario Sin Nombre",
            email: user.email,
            phone: "No especificado",
            birthday: "No especificado",
            direccion: "No especificado",
            metodoPago: "No especificado",
            creado: new Date().toISOString(),
          });
        }
      });
    })
    .then(() => {
      usuarioAutenticado.value = true;
      emit("loginConExito");
    })
    .catch((error) => {
      console.error("Error al autenticar con Google:", error.message);
      alert("Error al autenticar con Google: " + error.message);
    });
}

function loginPresionado() {
  const cookiesAceptadas = localStorage.getItem("cookiesAceptadas") === "true";
  if (!cookiesAceptadas) {
    alert("Debes aceptar las cookies para iniciar sesión.");
    return;
  }

  signInWithEmailAndPassword(auth, sEmail.value, sPassword.value)
    .then((userCredential) => {
      usuarioAutenticado.value = true;
      emit("loginConExito");
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      alert(`Usuario o contraseña incorrectos: ${error.message}`);
    });
}

function registroPresionado() {
  emit("cambioARegistro");
}

function recuperarContrasena() {
  if (!sEmail.value) {
    mostrarSnackbar("Por favor, introduce tu correo electrónico.", "error");
    return;
  }

  sendPasswordResetEmail(auth, sEmail.value)
    .then(() => {
      mostrarSnackbar("Correo enviado para restablecer la contraseña.");
      sEmail.value = "";
    })
    .catch((error) => {
      console.error("Error al enviar correo de recuperación:", error);
      mostrarSnackbar("❌ Error al enviar el correo: " + error.message, "error");
    });
}

</script>

<template>
  <v-container
    class="glass-container d-flex justify-center align-center fill-height"
  >
    <div class="glass-card animate-fade-in-up">
      <h1 class="titulo">Bienvenido</h1>
      <p class="subtexto">Por favor, inicia sesión en tu cuenta</p>

      <v-text-field
        label="Correo electrónico"
        v-model="sEmail"
        type="email"
        dense
        hide-details
        outlined
        prepend-inner-icon="mdi-email"
      ></v-text-field>

      <v-text-field
        label="Contraseña"
        v-model="sPassword"
        type="password"
        dense
        hide-details
        outlined
        prepend-inner-icon="mdi-lock"
      ></v-text-field>

      <v-btn @click="loginPresionado" block class="boton-login">Login</v-btn>

      <v-btn @click="loginWithGoogle" block class="boton-google">
        <v-icon left>mdi-google</v-icon> Iniciar con Google
      </v-btn>

      <p class="recuperar-pass">
         <a href="#" @click.prevent="recuperarContrasena">¿Olvidaste tu contraseña?</a>
      </p>

      <p class="registro-link">
        ¿No tienes cuenta? <span @click="registroPresionado">Regístrate</span>
      </p>
    </div>
  </v-container>
  <v-snackbar
  v-model="snackbar"
  :color="snackbarColor"
  timeout="5000"
  location="bottom center"
>
  {{ snackbarMensaje }}
</v-snackbar>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

* {
  font-family: 'Poppins', sans-serif;
}

.glass-card {
  background: rgba(0, 0, 0, 0.45); /* Más oscuro */
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  color: #fff; /* Texto blanco por defecto */
}

.animate-fade-in-up {
  animation: fadeInUp 0.7s ease-out both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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

.boton-login {
  background-color: #ffffffbb;
  color: #222;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 10px;
  border-radius: 12px;
  transition: 0.3s;
}
.boton-login:hover {
  background-color: white;
  transform: scale(1.03);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.boton-google {
  background-color: #ea4335;
  color: white;
  font-weight: bold;
  border-radius: 12px;
  transition: 0.3s;
}
.boton-google:hover {
  background-color: #d9392d;
  transform: scale(1.03);
  box-shadow: 0 0 10px rgba(255, 87, 87, 0.5);
}

.registro-link {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #ffffffcc;
}
.registro-link span {
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

.recuperar-pass {
  margin-top: 15px;
  font-size: 0.85rem;
}
.recuperar-pass a {
  color: #ffffffcc;
  text-decoration: underline;
}
</style>
