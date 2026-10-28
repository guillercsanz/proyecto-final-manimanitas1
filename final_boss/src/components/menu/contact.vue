<script setup>
import { ref } from "vue";
import emailjs from "emailjs-com";
import MenuSuperior from "@/components/menu/MenuSuperior.vue";
import { defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map'
const showInfo = ref(false)

const center = { lat: 40.473759985296255, lng: -3.371841174730451 };

const emit = defineEmits(["cambioAHome", "cambioAPerfil", "login", "registro", "mostrarCarrito"]);
const { t } = useI18n(); // Acceso a las traducciones

const nombre = ref("");
const email = ref("");
const telefono = ref("");
const mensaje = ref("");
const enviado = ref(false);

const map = ref(null);

function enviarFormulario() {
  if (nombre.value && email.value && mensaje.value) {
    const serviceID = "service_5fq47ca"; 
    const templateID = "template_9oqg7te"; 
    const userID = "5Zy6kB8gZ2c-UP4y1"; 

    const templateParams = {
      from_name: nombre.value,
      from_email: email.value,
      reply_to: email.value,
      user_phone: telefono.value,
      message: mensaje.value,
    };

    emailjs.send(serviceID, templateID, templateParams, userID)
      .then(() => {
        enviado.value = true;
        alert(t('contacto.mensajeEnviado')); // Usando i18n

        setTimeout(() => {
          enviado.value = false;
          nombre.value = "";
          email.value = "";
          telefono.value = "";
          mensaje.value = "";
        }, 3000);
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje", error);
        alert(t('contacto.errorEnvio')); // Usando i18n
      });
  } else {
    alert(t('contacto.camposIncompletos')); // Usando i18n
  }
}

function reenviarHome() { emit("cambioAHome"); }
function irPerfil() { emit("cambioAPerfil"); }
function cambioLogin() { emit("login"); }
function cambioRegistro() { emit("registro"); }
function irCarrito() { emit("mostrarCarrito"); }
</script>

<template>
  <MenuSuperior class="menu-superior" 
                @mostrarHome="reenviarHome" 
                @cambioAPerfil="irPerfil" 
                @login="cambioLogin" 
                @registro="cambioRegistro" 
                @mostrarCarrito="irCarrito" />

  <v-container fluid class="contact-container">
    <h1 class="title">{{ t('contacto.titulo') }}</h1>

    <v-row class="content-wrapper">
      <!-- Formulario -->
      <v-col cols="12" md="6" class="form-section">
        <p class="subtitle">{{ t('contacto.subtitulo') }}</p>

        <v-form @submit.prevent="enviarFormulario">
          <v-text-field v-model="nombre" :label="t('contacto.nombre')" outlined dense required class="custom-input"></v-text-field>
          <v-text-field v-model="email" :label="t('contacto.email')" type="email" outlined dense required class="custom-input"></v-text-field>
          <v-text-field v-model="telefono" :label="t('contacto.telefono')" type="tel" outlined dense class="custom-input"></v-text-field>
          <v-textarea v-model="mensaje" :label="t('contacto.mensaje')" outlined dense required class="custom-input"></v-textarea>
          <v-btn color="primary" block class="boton-enviar" @click="enviarFormulario">{{ t('contacto.enviar') }}</v-btn>
        </v-form>

        <v-alert v-if="enviado" type="success" class="mt-3 alert">
          {{ t('contacto.alertaEnviado') }}
        </v-alert>
      </v-col>

      <!-- Información de contacto -->
      <v-col cols="12" md="6" class="info-section">
        <h2 class="info-title">{{ t('contacto.infoTitulo') }}</h2>
        <p class="info-text">
          <v-icon>mdi-phone</v-icon>
          <a :href="'tel:+34123456789'" class="contact-link">+34 123 456 789</a>
        </p>
        <p class="info-text">
          <v-icon>mdi-email</v-icon>
          <a :href="'https://mail.google.com/mail/?view=cm&fs=1&to=contacto.utunbu@gmail.com'" target="_blank" class="contact-link">
            contacto.utunbu@gmail.com
          </a>
        </p>

        <!-- Título de ubicación -->
        <h3 class="info-title">{{ t('contacto.tituloUbicacion') }}</h3>

        <!-- Mapa -->
        <div style="margin-top: 10px; width: 100%; height: 250px; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.9); box-shadow: 0 4px 12px rgba(0,0,0,0.2); padding: 8px;">
          <GoogleMap
            api-key="AIzaSyDokwLkk4-4v5aDzreSmXY9N_Z7hUx3IhU"
            style="width: 100%; height: 100%; border-radius: 8px;"
            :center="center"
            :zoom="15"
          >
            <Marker
              :options="{ position: center }"
              @click="showInfo = true"
            />
            <InfoWindow
              v-if="showInfo"
              :options="{ position: center }"
              @closeclick="showInfo = false"
            >
              <div style="font-size: 14px; line-height: 1.5;">
                <strong>📍 C. Gardenia, 29, 28803 Alcalá de Henares, Madrid</strong><br />
                <a href="https://www.google.com/maps?q=40.473759985296255,-3.371841174730451" target="_blank" style="color: #1a73e8; text-decoration: underline;">
                  {{ t('contacto.verEnMaps') }}
                </a>
              </div>
            </InfoWindow>
          </GoogleMap>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.menu-superior {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: rgb(0, 0, 0);
  border-bottom: 2px solid #ffffff33;
  transition: background 0.3s ease-in-out;
}

.contact-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 50px;
  margin-bottom: 80px;
}

.title {
  font-size: 36px;
  font-weight: bold;
  color: #222;
  text-align: center;
  width: 100%;
  margin-top: 80px;
  margin-bottom: 20px;
}

.content-wrapper {
  width: 100%;
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-section {
  padding: 20px;
}

.subtitle {
  font-size: 18px;
  color: #555;
  margin-bottom: 20px;
}

.custom-input ::v-deep(.v-input__control) {
  background: transparent !important;
  border: 1px solid #bbb;
  border-radius: 8px;
  box-shadow: none;
  color: #222;
}

.boton-enviar {
  font-weight: bold;
  letter-spacing: 1px;
  margin-top: 10px;
}

.info-section {
  padding: 20px;
  border-radius: 10px;
  text-align: left;
}

.info-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 15px;
}

.info-text {
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #333;
}

.contact-link {
  text-decoration: none;
  color: #000000;
  font-weight: bold;
  transition: color 0.3s;
}

.contact-link:hover {
  color: #0056b3;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    text-align: center;
  }

  .info-section {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
