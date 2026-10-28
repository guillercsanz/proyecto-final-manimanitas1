import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
const firebaseApp = initializeApp ({
  apiKey: "AIzaSyBCPIKusXknWfwJSI0Ka7HgqTGXOV1KHig",
  authDomain: "finalboss-b0ffd.firebaseapp.com",
  projectId: "finalboss-b0ffd",
  storageBucket: "finalboss-b0ffd.firebasestorage.app",
  messagingSenderId: "239547705292",
  appId: "1:239547705292:web:9ab9b96a383cd43d5edf69",
  measurementId: "G-HBM5DS653E"
});

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp); // Inicializa y exporta Auth
export { firebaseApp};
