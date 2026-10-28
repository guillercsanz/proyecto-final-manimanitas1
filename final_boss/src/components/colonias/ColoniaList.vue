<script>
import { db } from "@/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { useFirebaseAuth } from "vuefire";


const EUR_TO_GBP = 0.85;


export default {
  data() {
    return {
      colonias: [],
      vistaMalla: true,
      criterioOrden: "nombre",
      ordenAscendente: true,
      auth: useFirebaseAuth(),
      coloniaSeleccionada: null,
    };
  },

  computed: {
  coloniasOrdenadas() {
    let colonias = [...this.colonias];
    const tasaCambio = this.$i18n.locale === 'en' ? 0.85 : 1;

    colonias = colonias.map(colonia => ({
      ...colonia,
      precioConvertido: colonia.precio * tasaCambio
    }));

    colonias.sort((a, b) => {
      if (this.criterioOrden === "nombre") {
        return this.ordenAscendente ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
      } else {
        return this.ordenAscendente ? a.precioConvertido - b.precioConvertido : b.precioConvertido - a.precioConvertido;
      }
    });

    return colonias;
  },

  precioConvertidoSeleccionada() {
    if (!this.coloniaSeleccionada) return 0;
    const tasaCambio = this.$i18n.locale === 'en' ? 0.85 : 1;
    return this.coloniaSeleccionada.precio * tasaCambio;
  }
},


  methods: {
    cambiarVista() {
      this.vistaMalla = !this.vistaMalla;
    },
    cambiarCriterio(criterio) {
      this.criterioOrden = criterio;
    },
    cambiarOrden() {
      this.ordenAscendente = !this.ordenAscendente;
    },
    mostrarDetalles(colonia) {
      this.coloniaSeleccionada = { ...colonia };
    },
    volverALista() {
      this.coloniaSeleccionada = null;
    },
    agregarAlCarrito(colonia) {
      if (!this.auth.currentUser) {
        alert(this.$t('debesIniciarSesion'));
        return;
      }

      const ref = doc(db, "Carrito", this.auth.currentUser.uid, "productos", colonia.id);
      setDoc(ref, colonia, { merge: true })
        .then(() => alert(`✅ ${colonia.nombre} ${this.$t('anadidoCarrito')}`))
        .catch(err => console.error(err));
    },
  },

  mounted() {
    onSnapshot(collection(db, "colonias"), snapshot => {
      this.colonias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  },
};
</script>

<template>
  <v-container class="contenedor-colonias">
    <!-- Controles de Vista y Ordenación -->
    <v-row justify="center" class="mb-4" v-if="!coloniaSeleccionada">
      <v-btn @click="cambiarVista" class="boton-cambiar">
        <span v-if="vistaMalla">{{ $t('verLista') }}</span>
        <span v-else>{{ $t('verMalla') }}</span>
      </v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn class="boton-cambiar ml-4" v-bind="props">
            {{ $t('ordenar') }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="cambiarCriterio('nombre')">
            <v-list-item-title>{{ $t('ordenarNombre') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="cambiarCriterio('precio')">
            <v-list-item-title>{{ $t('ordenarPrecio') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn @click="cambiarOrden" class="boton-cambiar ml-4">
        <span v-if="ordenAscendente">{{ $t('ascendente') }} ↑</span>
        <span v-else>{{ $t('descendente') }} ↓</span>
      </v-btn>
    </v-row>

    <!-- Vista Malla -->
    <v-row v-if="vistaMalla && !coloniaSeleccionada">
      <v-col v-for="colonia in coloniasOrdenadas" :key="colonia.id" cols="12" sm="6" md="4">
        <v-card @click="mostrarDetalles(colonia)">
          <v-img :src="colonia.imagenUrl" height="300px" cover></v-img>
          <v-card-title>{{ colonia.nombre }}</v-card-title>
          <v-card-subtitle>{{ colonia.ml }} ml</v-card-subtitle>
          <v-card-subtitle class="precio">
  {{ $n(colonia.precioConvertido, 'currency') }}
</v-card-subtitle>
          <v-btn color="primary" @click.stop="agregarAlCarrito(colonia)">{{ $t('agregarCarrito') }}</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vista Lista -->
    <v-row v-if="!vistaMalla && !coloniaSeleccionada">
      <v-col v-for="colonia in coloniasOrdenadas" :key="colonia.id" cols="12">
        <v-card class="d-flex align-center pa-3" @click="mostrarDetalles(colonia)">
          <v-img :src="colonia.imagenUrl" height="100px" width="100px" class="mr-3"></v-img>
          <div>
            <v-card-title>{{ colonia.nombre }}</v-card-title>
            <v-card-subtitle>{{ colonia.ml }} ml</v-card-subtitle>
           <v-card-subtitle class="precio">
  {{ $n(colonia.precioConvertido, 'currency') }}
</v-card-subtitle>

          </div>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click.stop="agregarAlCarrito(colonia)">{{ $t('agregarCarrito') }}</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detalles -->
    <v-container v-else-if="coloniaSeleccionada">
      <v-card>
        <v-img :src="coloniaSeleccionada.imagenSecundaria || coloniaSeleccionada.imagenUrl" height="400px" cover></v-img>
        <v-card-title>{{ coloniaSeleccionada.nombre }}</v-card-title>
        <v-card-subtitle>{{ coloniaSeleccionada.ml }} ml</v-card-subtitle>
        <v-card-subtitle class="precio">
  {{ $n(precioConvertidoSeleccionada, 'currency') }}
</v-card-subtitle>

        <v-card-text>{{ coloniaSeleccionada.descripcion || $t('sinDescripcion') }}</v-card-text>
        <div class="botones-detalle">
          <v-btn color="primary" @click="agregarAlCarrito(coloniaSeleccionada)">
            🛒 {{ $t('agregarCarrito') }}
          </v-btn>
          <v-btn color="red" @click="volverALista">{{ $t('volver') }}</v-btn>
        </div>
      </v-card>
    </v-container>
  </v-container>
</template>



<style scoped>
/* ====== ESTILO DEL BOTÓN DE CAMBIO DE VISTA Y ORDEN ====== */
.boton-cambiar {
  margin-bottom: 20px;
  background-color: #ffcc00;
  color: black;
  font-weight: bold;
  border-radius: 10px;
  padding: 10px 15px;
  transition: 0.3s ease;
}
/* Contenedor de botones dentro de la vista de detalles */
.botones-detalle {
  display: flex;
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Alinear verticalmente */
  gap: 15px; /* Espacio entre los botones */
  margin-top: 20px;
}

/* Asegura que ambos botones sean del mismo tamaño */
.boton-detalle {
  min-width: 200px; /* Igual ancho para ambos */
  height: 48px; /* Igual altura */
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

/* Botón de volver a la lista */
.v-btn.v-btn--disabled {
  background-color: #ccc;
  color: #fff;
  border: none;
  cursor: not-allowed;
  border-radius: 10px
}

.boton-cambiar:hover {
  background-color: #e6b800;
}
 
/* Ajuste de los botones para que queden bien alineados */
.v-row.justify-center {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* ====== CONTENEDOR DE LAS COLONIAS ====== */
.contenedor-colonias {
  margin-top: 100px;
  padding-top: 80px;
}

/* ====== TARJETA DE COLONIA ====== */
.v-card {
  cursor: pointer;
  background: none;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.v-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.3);
}

/* Imagen de la colonia */
.v-img {
  height: 330px !important;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  object-fit: contain;
  padding: 10px;
}

/* Texto dentro de la tarjeta */
.v-card-title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.9);
  padding: 12px;
  text-transform: uppercase;
}

/* ====== PRECIO ====== */
.v-card-subtitle.ml {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  color: #2196f3;
  padding: 5px;
}

.v-card-subtitle.precio {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #0f0e0f;
  padding: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Descripción */
.v-card-text {
  font-size: 1.2rem;
  text-align: center;
  padding: 15px;
  color: rgb(12, 12, 12);
}
</style>