<script setup>
import { ref, onMounted, defineEmits, computed } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { useFirebaseAuth, useFirestore } from "vuefire";
import { useI18n } from "vue-i18n"; 

import logoSrc from '@/assets/utunbu.png';
import es from "@/assets/flags/spain.jpg";
import uk from"@/assets/flags/uk.jpg";

const auth = useFirebaseAuth();
const db = useFirestore();
const emit = defineEmits(["cambioAPerfil", "login", "registro", "mostrarHome", "cambioAContacto", "logOut", "mostrarCarrito"]);
const { locale } = useI18n();

const userName = ref("Usuario");
const userEmail = ref("");

const currentFlag = computed(() => {
  if (locale.value === 'es') {
    return es;
  } else {
    return uk;
  }
});


// Verifica si hay usuario autenticado y obtiene sus datos
function verificarUsuario() {
  const user = auth.currentUser;
  
  if (user) {
    console.log("Usuario autenticado:", user.uid);
    const userDocRef = doc(db, "Profiles", user.uid);
    
    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log("🔹 Datos obtenidos de Firestore:", data);
          
          if (data.name && data.name.trim() !== "") {
            userName.value = data.name;
          }
          userEmail.value = data.email || user.email;
        } else {
          console.warn("No se encontró el perfil del usuario en Firestore.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
      });
  } 
}

// Detecta el idioma seleccionado (desde localStorage o el del dispositivo)
onMounted(() => {
  verificarUsuario();
  const idiomaSeleccionado = localStorage.getItem('idiomaSeleccionado');
  if (idiomaSeleccionado) {
    locale.value = idiomaSeleccionado;
  } else {
    const deviceLang = navigator.language || navigator.userLanguage;
    locale.value = deviceLang.startsWith('es') ? 'es' : 'en';
    localStorage.setItem('idiomaSeleccionado', locale.value);
  }
});

function cambiarLocalizacion(nuevoIdioma) {
  locale.value = nuevoIdioma;
  localStorage.setItem('idiomaSeleccionado', nuevoIdioma);
}

function irPerfil() {
  emit("cambioAPerfil");
}

function cambioLogin() {
  emit("login");
}

function cambioRegistro() {
  emit("registro"); 
}

function cerrarSesion() {
  auth.signOut()
    .then(() => {
      console.log("Sesión cerrada correctamente.");
      userName.value = "Invitado";
      userEmail.value = "";

      setTimeout(() => {
        verificarUsuario();
        if (userEmail.value === "") {
          alert("Sesión cerrada correctamente.");
          console.log("🔄 Redirigiendo a Home...");
          volverHome();
          emit("logOut");
        }
      }, 1000);
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión: " + error);
    });
}

function volverHome() {
  emit("mostrarHome"); 
}

function irContacto() {
  emit("cambioAContacto");
}

function mostrarCarrito() {
  emit("mostrarCarrito");
}
</script>

<template>
  <v-app-bar app color="black" class="custom-app-bar" elevate-on-scroll>
    <div class="logo-container">
      <img :src="logoSrc" alt="Logo" class="logo" />
    </div>

    <v-spacer></v-spacer>
    <p class="slogan">{{ $t('slogan') }}</p>
    <v-spacer></v-spacer>

    <!-- Menú de selección de idioma con banderas -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon class="icon-btn">
          <img :src="currentFlag" class="flag-icon" alt="Idioma actual" />
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="cambiarLocalizacion('es')">
          <v-list-item-title>
            <img src="@/assets/flags/spain.jpg" class="flag-icon" alt="Español" />
            Español
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="cambiarLocalizacion('en')">
          <v-list-item-title>
            <img src="@/assets/flags/uk.jpg" class="flag-icon" alt="English" />
            English
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <div class="menu-buttons">
      <v-btn icon class="icon-btn" @click="volverHome">
        <v-icon>mdi-home</v-icon>
      </v-btn>

      <v-btn icon class="icon-btn" @click="irContacto">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>

      <!-- Menú de usuario -->
      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon class="icon-btn">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>

        <v-card class="menu-card">
          <!-- Si NO hay usuario autenticado -->
          <div v-if="userEmail === ''">
            <v-card-title>
              <v-icon>mdi-account</v-icon> {{ $t('miCuenta') }}
            </v-card-title>
            <v-card-text>{{ $t('registro') }}</v-card-text>
            <v-card-actions>
              <v-btn color="black" @click="cambioLogin">{{ $t('iniciarSesion') }}</v-btn>
              <v-btn color="red" @click="cambioRegistro">{{ $t('crearCuenta') }}</v-btn>
            </v-card-actions>
          </div>

          <!-- Si hay usuario autenticado -->
          <div v-else>
            <v-card-title>{{ $t('menuSuperior.bienvenido') }} {{ userName }}</v-card-title>
            <v-card-subtitle>{{ userEmail }}</v-card-subtitle>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="black" block @click="irPerfil">{{ $t('miCuenta') }}</v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </v-menu>

      <v-btn icon class="icon-btn" @click="mostrarCarrito">
        <v-icon>mdi-cart</v-icon>
      </v-btn>

      <!-- Botón de Cerrar Sesión -->
      <v-btn icon class="icon-btn logout-btn" @click="cerrarSesion">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lemon&family=Sigmar&display=swap');

.custom-app-bar {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: rgb(0, 0, 0);
  border-bottom: 2px solid #ffffff33;
  transition: background 0.3s ease-in-out;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.logo {
  width: 80px;
  height: 70px;
  transition: transform 0.3s ease-in-out;
}

.logo:hover {
  transform: scale(1.1);
}

.slogan {
  font-family: 'Sigmar', cursive;
  font-size: 30px;
  font-weight: bold;
  color: white;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

.menu-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, color 0.2s ease-in-out;
}

.icon-btn:hover {
  transform: scale(1.2);
  color: #ffcc00;
}

.logout-btn:hover {
  color: #ff4444;
}

.flag-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  margin-right: 8px;
}
</style>