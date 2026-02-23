/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCR9GuqnDWFcMtq3bQBEuYWz0UadbBfNW8",
  authDomain: "local-ai-6b086.firebaseapp.com",
  projectId: "local-ai-6b086",
  storageBucket: "local-ai-6b086.firebasestorage.app",
  messagingSenderId: "609510343353",
  appId: "1:609510343353:web:8485667cbce5a35e219168",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "New Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
  };
  self.registration.showNotification(title, options);
});
