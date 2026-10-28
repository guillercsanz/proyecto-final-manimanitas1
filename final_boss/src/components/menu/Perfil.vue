<script setup>
import MenuSuperior from "@/components/menu/MenuSuperior.vue";
import { ref, onMounted, computed } from "vue";
import { useFirebaseAuth, useFirestore } from "vuefire";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { defineEmits } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const emit = defineEmits(["cambioAHome", "cambioAContacto", "mostrarCarrito"]);
const auth = useFirebaseAuth();
const db = useFirestore();

const userData = ref({
  name: "",
  email: "",
  phone: "",
  direccion: "",
  metodoPago: "",
  birthday: "",
  creado: "",
});

const isEditing = ref(false);

// Computed para métodos de pago traducidos
const paymentMethods = computed(() => [
  t('perfil.tarjetaCredito'),
  t('perfil.paypal'),
  t('perfil.transferenciaBancaria')
]);

// Función para obtener el locale adecuado en la formateación de fechas
function getDateLocale() {
  return locale.value.startsWith('en') ? 'en-US' : 'es-ES';
}

function obtenerDatosUsuario() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "Profiles", user.uid);
    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          userData.value.name = data.name || t('perfil.noEspecificado');
          userData.value.email = data.email || user.email;
          userData.value.phone = data.phone || t('perfil.noEspecificado');
          userData.value.direccion = data.direccion || t('perfil.noEspecificado');
          userData.value.metodoPago = data.metodoPago || t('perfil.noEspecificado');

          if (data.birthday) {
            const fechaNacimiento = new Date(data.birthday.seconds * 1000).toLocaleDateString(getDateLocale());
            userData.value.birthday = fechaNacimiento;
          } else {
            userData.value.birthday = t('perfil.noEspecificado');
          }

          if (data.creado) {
            const fechaCreado = new Date(data.creado.seconds * 1000).toLocaleDateString(getDateLocale());
            userData.value.creado = fechaCreado;
          } else {
            userData.value.creado = "";
          }
        }
      })
      .catch((error) => {
        console.error("Error al obtener datos del usuario:", error);
      });
  }
}

function guardarDatos() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "Profiles", user.uid);
    updateDoc(userDocRef, {
      name: userData.value.name,
      phone: userData.value.phone,
      direccion: userData.value.direccion,
      metodoPago: userData.value.metodoPago,
    })
      .then(() => {
        console.log("Datos actualizados correctamente en Firebase");
        isEditing.value = false;
      })
      .catch((error) => {
        console.error("Error al actualizar los datos en Firebase:", error);
      });
  }
}

function activarEdicion() {
  isEditing.value = true;
}

onMounted(() => {
  obtenerDatosUsuario();
});

function reenviarHome() {
  emit("cambioAHome");
}

function irContacto() {
  emit("cambioAContacto");
}

function irCarrito() {
  emit("mostrarCarrito");
}
</script>

<template>
  <MenuSuperior
    @mostrarHome="reenviarHome"
    @cambioAContacto="irContacto"
    @mostrarCarrito="irCarrito"
    class="menu-superior"
  />

  <div class="perfil-container">
    <h1 class="title">{{ t('perfil.titulo') }}</h1>

    <div class="info-box">
      <v-row>
        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.nombre') }}</label>
          <div v-if="!isEditing" class="campo-texto">{{ userData.name }}</div>
          <v-text-field v-if="isEditing" v-model="userData.name" dense outlined class="input-field" />
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.email') }}</label>
          <div class="campo-texto disabled-field">{{ userData.email }}</div>
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.telefono') }}</label>
          <div v-if="!isEditing" class="campo-texto">{{ userData.phone }}</div>
          <v-text-field v-if="isEditing" v-model="userData.phone" dense outlined class="input-field" />
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.direccion') }}</label>
          <div v-if="!isEditing" class="campo-texto">{{ userData.direccion }}</div>
          <v-text-field v-if="isEditing" v-model="userData.direccion" dense outlined class="input-field" />
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.metodoPago') }}</label>
          <div v-if="!isEditing" class="campo-texto">{{ userData.metodoPago }}</div>
          <v-select
            v-if="isEditing"
            v-model="userData.metodoPago"
            :items="paymentMethods"
            dense
            outlined
            class="input-field"
          />
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.fechaNacimiento') }}</label>
          <div class="campo-texto">{{ userData.birthday }}</div>
        </v-col>

        <v-col cols="12" md="6">
          <label class="campo-label">{{ t('perfil.cuentaCreada') }}</label>
          <div class="campo-texto">{{ userData.creado }}</div>
        </v-col>
      </v-row>
    </div>

    <div class="buttons-container">
      <v-btn v-if="!isEditing" color="primary" class="boton-accion" @click="activarEdicion">
        {{ t('perfil.editar') }}
      </v-btn>
      <v-btn v-if="isEditing" color="green" class="boton-accion" @click="guardarDatos">
        {{ t('perfil.guardarCambios') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
/* 🔹 Menú fijo */
.menu-superior {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: black;
  z-index: 1000;
}

/* 🔹 Contenedor principal */
.perfil-container {
  width: 100%;
  max-width: 800px;
  padding: 30px;
  text-align: left;
}

/* 🔹 Título */
.title {
  font-size: 36px;
  font-weight: bold;
  color: #222;
  text-align: center;
  width: 100%;
  margin-top: 80px;
  margin-bottom: 20px;
}

/* 🔹 Caja de información */
.info-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 🔹 Etiquetas */
.campo-label {
  font-weight: bold;
  font-size: 16px;
  display: block;
  margin-bottom: 5px;
  color: #444;
}

/* 🔹 Texto de cada campo */
.campo-texto {
  font-size: 18px;
  color: #333;
  padding: 8px 0;
  border-bottom: 1px solid #ccc;
}

/* 🔹 Campo deshabilitado (Correo) */
.disabled-field {
  color: #777;
  font-style: italic;
  cursor: not-allowed;
}

/* 🔹 Inputs estilizados */
.input-field ::v-deep(.v-input__control) {
  background: transparent !important;
  border: 1px solid #ccc !important;
  border-radius: 8px;
  padding: 5px;
}

/* 🔹 Botones */
.buttons-container {
  margin-top: 20px;
  text-align: center;
}

.boton-accion {
  font-weight: bold;
  letter-spacing: 1px;
  padding: 12px 20px;
  border-radius: 8px;
}
</style>