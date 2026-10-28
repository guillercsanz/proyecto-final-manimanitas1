<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useFirebaseAuth } from "vuefire";
import { onAuthStateChanged } from "firebase/auth";
import MenuSuperior from "@/components/menu/MenuSuperior.vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["cambioAPerfil", "login", "registro", "cambioAHome", "cambioAContacto","tramitarPedido"]);

const auth = useFirebaseAuth();
const productosCarrito = ref([]);
const subtotal = ref(0);
const total = ref(0);
const usuarioAutenticado = ref(false);
let unsubscribeCarrito = null; 
const envioGratis = ref(60); // Monto necesario para obtener envío gratis
const costoEnvio = ref(3.99); // Costo de envío si no se alcanza el mínimo
const progresoEnvio = ref(0); // Porcentaje de la barra de progreso

const { locale, t, n } = useI18n();

const tasaCambioEuroALibra = 0.85;

function formatoPrecioConConversion(precioEuros) {
  if (locale.value === 'en') {
    // Si es inglés, convierte de € a £
    const precioLibras = precioEuros * tasaCambioEuroALibra;
    return n(precioLibras, 'currency');
  } else {
    // Si es español o cualquier otro idioma, muestra en euros
    return n(precioEuros, 'currency');
  }
}


function cargarCarrito(user) {
  if (user) {
    const carritoRef = collection(db, "Carrito", user.uid, "productos");

    // Eliminar listener anterior si existe
    if (unsubscribeCarrito !== null) {
      unsubscribeCarrito();
    }

    unsubscribeCarrito = onSnapshot(
      carritoRef,
      function (snapshot) {
        const productos = [];
        snapshot.docs.forEach(function (doc) {
          const producto = doc.data();
          producto.id = doc.id;
          if (!producto.cantidad) {
            producto.cantidad = 1;
          }
          productos.push(producto);
        });
        productosCarrito.value = productos;
        calcularTotal();
      },
      function (error) {
        console.error("Error cargando carrito:", error);
      }
    );
  }
}

function eliminarDelCarrito(productoId) {
  const user = auth.currentUser;
  if (user) {
    const productoRef = doc(db, "Carrito", user.uid, "productos", productoId);
    deleteDoc(productoRef)
      .then(function () {
        console.log("Producto eliminado correctamente");
      })
      .catch(function (error) {
        console.error("Error eliminando del carrito:", error);
      });
  }
}

function actualizarCantidad(producto, nuevaCantidad) {
  if (nuevaCantidad < 1) {
    eliminarDelCarrito(producto.id);
    return;
  }

  const user = auth.currentUser;
  if (user) {
    const productoRef = doc(db, "Carrito", user.uid, "productos", producto.id);
    updateDoc(productoRef, { cantidad: nuevaCantidad }).catch(function (error) {
      console.error("Error actualizando cantidad:", error);
    });
  }
}

function calcularTotal() {
  let subtotalTemp = productosCarrito.value.reduce(
    (sum, producto) => sum + (producto.precio || 0) * (producto.cantidad || 1),
    0
  );

  subtotal.value = parseFloat(subtotalTemp.toFixed(2));

  // Aplicar envío si es necesario
  if (subtotal.value >= envioGratis.value) {
    total.value = subtotal.value; // Envío gratuito
  } else {
    total.value = parseFloat((subtotal.value + costoEnvio.value).toFixed(2)); // Sumar costo de envío
  }

  // Calcular progreso de barra de envío gratis
  let progreso = (subtotal.value / envioGratis.value) * 100;
  progresoEnvio.value = Math.min(progreso, 100);
}

function calcularTotalArticulos() {
  let totalArticulos = 0;
  for (let i = 0; i < productosCarrito.value.length; i++) {
    totalArticulos += productosCarrito.value[i].cantidad || 1;
  }
  return totalArticulos;
}

function tramitarPedido() {
  calcularTotal();
  const totalConvertido = locale.value === 'en' ? total.value * tasaCambioEuroALibra : total.value;
  emit("tramitarPedido", parseFloat(totalConvertido.toFixed(2)));
}



onMounted(function () {
  onAuthStateChanged(auth, function (user) {
    if (user) {
      usuarioAutenticado.value = true;
      cargarCarrito(user);
    } else {
      usuarioAutenticado.value = false;
      if (unsubscribeCarrito !== null) {
        unsubscribeCarrito();
      }
      productosCarrito.value = [];
    }
  });
});
</script>

<template>
  <MenuSuperior 
    @mostrarHome="emit('cambioAHome')"
    @cambioAPerfil="emit('cambioAPerfil')"
    @login="emit('login')"
    @registro="emit('registro')"
    @cambioAContacto="emit('cambioAContacto')" 
  />
  
  <h1 class="titulo-carrito">
    {{ $t('carrito.titulo') }}
  </h1>

  <v-container class="contenedor-carrito">
    <v-row>
      <!-- Si el usuario NO ha iniciado sesión -->
      <v-col v-if="!usuarioAutenticado" cols="12" class="carrito-vacio">
        <img src="@/assets/carrito-vacio.png" alt="Carrito Vacío" />
        <p>{{ $t('carrito.sinArticulos') }}</p>
        <p>{{ $t('carrito.iniciarSesion') }}</p>
        <v-btn color="black" class="boton-login" @click="emit('login')">{{ $t('botones.iniciarSesion') }}</v-btn>
        <v-btn class="boton-registro" @click="emit('registro')">{{ $t('botones.crearCuenta') }}</v-btn> 
      </v-col>

      <!-- Si el usuario tiene sesión pero el carrito está vacío -->
      <v-col v-else-if="productosCarrito.length === 0" cols="12" class="carrito-vacio">
        <img src="@/assets/carrito-vacio.png" alt="Carrito Vacío" />
        <h2>{{ $t('carrito.vacio') }}</h2>
        <p>{{ $t('carrito.sinArticulos') }}</p>
      </v-col>

      <!-- Si hay productos en el carrito -->
      <template v-else>
        <!-- Columna izquierda: Productos en el carrito -->
        <v-col cols="12" md="8">
          <v-card v-for="producto in productosCarrito" :key="producto.id" class="producto-card">
            <v-row align="center">
              <v-col cols="3">
                <v-img :src="producto.imagenUrl" class="imagen-producto"></v-img>
              </v-col>
              <v-col cols="5">
                <div class="producto-info">
                  <h3 class="titulo-producto">{{ producto.nombre }}</h3>
                  <p class="detalle-producto">{{ $t('carrito.volumen') }} (ML): {{ producto.volumen }}</p>
                  <div class="acciones">
                    <span class="eliminar" @click="eliminarDelCarrito(producto.id)">{{ $t('carrito.quitarArticulo') }}</span>
                  </div>
                </div>
              </v-col>
              <v-col cols="2">
                <div class="cantidad-control">
                  <v-btn class="boton-cantidad" @click="actualizarCantidad(producto, producto.cantidad - 1)">-</v-btn>
                  <span class="cantidad">{{ producto.cantidad }}</span>
                  <v-btn class="boton-cantidad" @click="actualizarCantidad(producto, producto.cantidad + 1)">+</v-btn>
                </div>
              </v-col>
              <v-col cols="2">
                <p class="precio-producto">{{ formatoPrecioConConversion(producto.precio) }}</p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Columna derecha: Resumen del pedido -->
        <v-col cols="12" md="4">
          <v-card class="resumen-carrito">
            <v-card-title>{{ $t('carrito.resumen') }}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <p v-if="subtotal < envioGratis" class="envio-gratis">
                {{ t('carrito.anadirMas') }} <strong>{{ formatoPrecioConConversion(envioGratis - subtotal) }}</strong> {{ t('carrito.envioGratis') }}
                <v-icon color="green">mdi-truck-fast</v-icon>
              </p>
              <p v-else class="envio-gratis">
                {{ $t('carrito.envioGratisFelicidades') }}
                <v-icon color="green">mdi-truck-fast</v-icon>
              </p>
              
              <v-progress-linear :value="progresoEnvio" color="green"></v-progress-linear>
              
              <p>{{ t('carrito.subtotal') }}: <strong>{{ formatoPrecioConConversion(subtotal) }}</strong></p>
              
              <p>
                {{ $t('carrito.gastosEnvio') }}: 
                <span v-if="subtotal < envioGratis">
                   <strong>{{ formatoPrecioConConversion(costoEnvio) }}</strong>
                </span>
                <span v-else style="text-decoration: line-through; color: gray;">{{ formatoPrecioConConversion(costoEnvio) }}</span>
  <span v-if="subtotal >= envioGratis"> <strong>€0.00</strong></span>
              </p>

              <p>{{ t('carrito.total') }}: <strong>{{ formatoPrecioConConversion(total) }}</strong></p>
            </v-card-text>
            <v-btn color="red" block class="boton-tramitar" @click="tramitarPedido">
              <v-icon left>mdi-truck-fast</v-icon> {{ $t('botones.tramitarPedido') }} ({{ calcularTotalArticulos() }} {{ $t('carrito.articulos') }})
            </v-btn>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>


<style scoped>
.titulo-carrito {
  font-size: 36px;
  font-weight: bold;
  color: #222;
  text-align: center;
  width: 100%;
  margin-top: 100px;
  margin-bottom: 20px;
}
/* 🔹 Contenedor General */
.contenedor-carrito {
  width: 95vw; /* Ajusta el ancho del carrito */
  max-width: 1200px; /* Tamaño máximo */
  margin: auto;
  text-align: center;
  margin-top:20px; /* Ajusta el margen superior */
}

/* 🔹 Carrito Vacío */
.carrito-vacio {
  text-align: center;
}

.carrito-vacio img {
  width: 300px;
}

.carrito-vacio h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.carrito-vacio p {
  color: rgb(44, 44, 44);
  margin-bottom: 10px;
}

.boton-login, .boton-registro {
  margin: 10px;
  width: 200px;
  height: 40px;
  font-weight: bold;
}

/* 🔹 Tarjeta del Producto */
.producto-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px; /* Ajusta el espaciado interno */
  background: white;
  border-radius: 10px; /* Bordes redondeados */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15); /* Sombra ligera */
  width: 100%; /* Ajusta el ancho del recuadro */
  max-width: 1000px; /* Puedes cambiarlo para hacerlo más ancho o angosto */
  margin: 15px auto; /* Centrar y agregar separación entre productos */
}

/* 🔹 Imagen del Producto */
.imagen-producto {
  width: 100px; /* Ajusta el tamaño de la imagen */
  height: auto;
  border-radius: 8px;
}

/* 🔹 Información del Producto */
.producto-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Permite que la información ocupe el espacio disponible */
  text-align: left;
}

/* 🔹 Información del Producto */
.titulo-producto {
  font-size: 1.3rem; /* Más grande */
  font-weight: bold;
  color: #333;
}

.detalle-producto {
  font-size: 1rem;
  color: gray;
}

/* 🔹 Contenedor de cantidad y precio */
.cantidad-precio-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 15px; /* Espaciado superior */
}

/* 🔹 Botones de cantidad */
.cantidad-control {
  display: flex;
  align-items: center;
  gap: 15px; /* Más separación entre los botones */
  margin-right: 300px; /* Mueve los botones hacia la izquierda */
}

.boton-cantidad {
  background-color: #ddd;
  color: black;
  min-width: 40px; /* Ajusta el tamaño del botón */
  height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 5px;
}

/* 🔹 Precio alineado en una sola línea */
.precio-producto {
  font-size: 1.5rem;
  font-weight: bold;
  color: black;
  white-space: nowrap; /* Evita que el precio se divida en dos líneas */
  margin-left: 10px; /* Espacio entre cantidad y precio */
}

/* 🔹 Sección de Resumen */
.resumen-carrito {
  padding: 20px;
  border-radius: 10px;
  background: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
  margin-top: 15px;
}

/* 🔹 Texto de envío gratuito */
.envio-gratis {
  font-size: 1rem;
  color: green;
  font-weight: bold;
}

/* 🔹 Botones de acción */
.boton-aplicar {
  margin-top: 15px;
  background-color: black;
  color: white;
}

.boton-tramitar {
  margin-top: 20px;
  font-weight: bold;
  background-color: red;
  color: white;
}

/* 🔹 Acciones del Producto */
.acciones {
  font-size: 0.9rem;
  color: red;
  margin-top: 8px;
}

.acciones span {
  cursor: pointer;
  margin-right: 10px;
}

/* 🔹 Título Principal del Carrito */
.titulo-carrito {
  font-size: 2.5rem; /* Aumenta el tamaño */
  font-weight: bold; /* Más grosor */
  text-align: center;
  color: #222; /* Color oscuro para mejor contraste */
  text-transform: uppercase; /* Convierte en mayúsculas */
  position: relative;
  padding-bottom: 10px;
}

</style>