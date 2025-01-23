importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Configuração do Firebase
firebase.initializeApp({
  apiKey: "AIzaSyD8yB8AoIID4D_6uNjjxASlVDzoR3VFWXg",
  authDomain: "deliveryaki-b249e.firebaseapp.com",
  projectId: "deliveryaki-b249e",
  storageBucket: "deliveryaki-b249e.appspot.com",
  messagingSenderId: "198765388311",
  appId: "1:198765388311:web:7f3a6ffbada3736154f252",
  measurementId: "G-G6NCW8KKGE",
});

const messaging = firebase.messaging();

// Listener para mensagens em segundo plano
/*messaging.onBackgroundMessage((payload) => {
  console.log("Mensagem recebida em segundo plano:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    //icon: "/firebase-logo.png", // Ícone opcional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});*/
