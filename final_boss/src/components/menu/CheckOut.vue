<script setup>
import { ref, computed, onMounted } from "vue";
import { useFirebaseAuth } from "vuefire";
import { getFirestore, doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { onSnapshot, deleteDoc } from "firebase/firestore";
import { loadScript } from "@paypal/paypal-js";

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
});

const paypalContainer = ref(null);

const emit = defineEmits(["cancelar", "pedidoOK"]);

const auth = useFirebaseAuth();
const db = getFirestore();

const userData = ref({
  name: "",
  email: "",
  phone: "",
  direccion: "",
});

const otraDireccion = ref(false);
const nuevaDireccion = ref("");
const nuevoTelefono = ref("");

function obtenerDatosUsuario() {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, "Profiles", user.uid);

    getDoc(userDocRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          userData.value.name = data.name || user.displayName || "No especificado";
          userData.value.email = data.email || user.email || "No especificado";
          userData.value.phone = data.phone || "No especificado";
          userData.value.direccion = data.direccion || "No especificado";
        }
      })
      .catch((error) => {
        console.error("Error al obtener datos del usuario:", error);
      });
  }
}

onMounted(obtenerDatosUsuario);

const formularioCompleto = computed(() => {
  const direccionValida = otraDireccion.value ? nuevaDireccion.value.trim() !== "" : userData.value.direccion.trim() !== "";
  return (
    userData.value.name.trim() !== "" &&
    userData.value.email.trim() !== "" &&
    userData.value.phone.trim() !== "" &&
    direccionValida
  );
});

function guardarPedido() {
  if (!auth.currentUser) return;

  return addDoc(collection(db, "Pedidos"), {
    usuarioID: auth.currentUser.uid,
    name: userData.value.name,
    email: userData.value.email,
    phone: userData.value.phone,
    direccion: otraDireccion.value ? nuevaDireccion.value : userData.value.direccion,
    total: props.total,
    metodoPago: "PayPal",
    fecha: Timestamp.now(),
    estado: "pendiente",
  })
  .then((docRef) => {
    alert("Pedido guardado correctamente.");
    return docRef.id;
  })
  .catch((error) => {
    alert("Error al guardar el pedido.");
    throw error;
  });
}

function volver() {
  emit("cancelar");
}

function vaciarCarrito() {
  const user = auth.currentUser;
  if (user) {
    const carritoRef = collection(db, "Carrito", user.uid, "productos");
    onSnapshot(carritoRef, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    });
    emit("pedidoOK");
  }
}

onMounted(() => {
  loadScript({
    "client-id": "Abs3BmZbYK4a2QvgCMVaRK4oJn5_VBrL9t6DNazSyNe_9M4QK0HEv0Ij3cXQSxvw3paD-013CIc2YX7t",
    currency: "EUR",
  }).then((paypal) => {
    if (!paypal) return;

    paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: props.total.toFixed(2) } }],
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then((details) => {
          alert('Pago completado por ${details.payer.name.given_name}');
          vaciarCarrito();
          return guardarPedido();
        });
      },
      onError: (err) => {
        console.error("Error en PayPal:", err);
      },
    }).render(paypalContainer.value);
  }).catch((error) => {
    console.error("Error al cargar PayPal:", error);
  });
});
</script>

<template>
  <v-app-bar app color="black" dark class="custom-app-bar">
    <v-container class="d-flex align-center">
      <img src="@/assets/utunbu.png" alt="Logo" class="logo" />
      <v-spacer></v-spacer>
      <h1 class="eslogan">{{ $t('slogan') }}</h1>
      <v-spacer></v-spacer>
    </v-container>
  </v-app-bar>

  <v-container class="checkout-container">
    <div class="checkout-grid">
      <v-card class="checkout-card">
        <v-card-title class="titulo-pago">🛒 {{ $t('checkout.title') }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="detalles-pago">
          <p><v-icon color="green">mdi-account</v-icon> {{ $t('checkout.customerInfo') }}</p>
          <v-text-field v-model="userData.name" :label="$t('checkout.fullName')" outlined required></v-text-field>
          <v-text-field v-model="userData.email" :label="$t('checkout.email')" type="email" outlined required></v-text-field>
          <v-text-field v-model="userData.phone" :label="$t('checkout.phone')" type="tel" outlined required></v-text-field>
        </v-card-text>

        <v-card-text class="detalles-pago">
          <p><v-icon color="green">mdi-home-map-marker</v-icon> {{ $t('checkout.shippingAddress') }}</p>
          <v-text-field v-model="userData.direccion" :label="$t('checkout.address')" outlined required></v-text-field>

          <v-checkbox v-model="otraDireccion" :label="$t('checkout.shipToOther')"></v-checkbox>

          <div v-if="otraDireccion">
            <v-text-field v-model="nuevaDireccion" :label="$t('checkout.newAddress')" outlined required></v-text-field>
            <v-text-field v-model="nuevoTelefono" :label="$t('checkout.newPhone')" type="tel" outlined required></v-text-field>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="checkout-card resumen-pedido">
        <v-card-title>{{ $t('checkout.orderSummary') }}</v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <p><strong>{{ $t('checkout.total') }}:</strong> {{ $n(props.total, 'currency') }}</p>
        </v-card-text>

        <v-card-text>
          <div ref="paypalContainer"></div>
          <v-btn @click="vaciarCarrito">{{ $t('checkout.simulatePayment') }}</v-btn>
        </v-card-text>

        <v-card-actions class="acciones-pago">
          <v-btn color="gray" block class="boton-cancelar" @click="volver">
            <v-icon left>mdi-arrow-left</v-icon> {{ $t('checkout.backToCart') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lemon&family=Sigmar&display=swap');

.custom-app-bar {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: black;
  border-bottom: 2px solid #ffffff33;
}

.logo {
  width: 80px;
  height: 70px;
  transition: transform 0.3s ease-in-out;
}

.logo:hover {
  transform: scale(1.1);
}

.eslogan {
  font-family: 'Sigmar', cursive;
  font-size: 30px;
  font-weight: bold;
  color: white;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

.checkout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  align-items: center;
}

.checkout-grid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  max-width: 1200px;
  flex-grow: 1;
  flex-wrap: wrap;
  margin-top: 130px;
}

.checkout-card {
  flex: 1;
  min-width: 400px;
  padding: 20px;
}

@media (max-width: 900px) {
  .checkout-grid {
    flex-direction: column;
    align-items: center;
  }

  .checkout-card {
    width: 100%;
    min-width: auto;
  }
}

.acciones-pago {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.boton-cancelar {
  background-color: #bbb;
  color: black;
}
</style>