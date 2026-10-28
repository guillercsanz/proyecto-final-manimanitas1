<script setup>
import MenuSuperior from '../menu/MenuSuperior.vue';
import ColoniaList from "@/components/colonias/ColoniaList.vue";
import { defineEmits, defineProps } from "vue";

// Props que vienen desde Principal.vue
const props = defineProps({
  tipoDispositivo: {
    type: String,
    required: true
  },
  resolucionPantalla: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["cambioAPerfil", "login", "registro", "mostrarHome", "cambioAContacto", "mostrarCarrito"]);

function cambioAPerfil() {
  emit("cambioAPerfil");
}

function cambioLogin() {
  emit("login");
}

function cambioRegistro() {
  emit("registro");
}

function salir() {
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
  <div>
    <menu-superior 
      @cambioAPerfil="cambioAPerfil" 
      @login="cambioLogin" 
      @registro="cambioRegistro" 
      @mostrarHome="salir" 
      @cambioAContacto="irContacto" 
      @mostrarCarrito="mostrarCarrito"
    />

    <!-- Sección de la lista de colonias, le pasamos el tipo de dispositivo -->
    <v-container>
      <ColoniaList 
        :tipoDispositivo="tipoDispositivo"
        :resolucionPantalla="resolucionPantalla"
      />
    </v-container>
  </div>
</template>

<style scoped>
.alerta-dispositivo {
  margin: 15px 0;
  padding: 10px;
}
</style>