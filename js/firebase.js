// ============================================================
// firebase.js — configuración e inicialización compartida
// ============================================================

import { initializeApp }        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }              from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Reemplaza con tus datos de Firebase ──
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// Lista blanca de correos autorizados
export const WHITELIST = [
  'kayrafullparty@gmail.com',
  'kayravale14@gmail.com',
  'oliverjunior071914@gmail.com',
];

// Prefijo de numeración de cotizaciones
export const COT_PREFIX = 'KFP';
