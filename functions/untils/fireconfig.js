const firebaseConfig = {
    apiKey: "AIzaSyD0eW1UVeq0a7o6MUh7FO1zrhr3GgXZSi4",
    authDomain: "socialapp-65337.firebaseapp.com",
    databaseURL: "https://socialapp-65337.firebaseio.com",
    projectId: "socialapp-65337",
    storageBucket: "socialapp-65337.appspot.com",
    messagingSenderId: "61119215712",
    appId: "1:61119215712:web:f1dbc6a1e64807991eeb05",
    measurementId: "G-Z7ZPGV2XYB"
  };
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

module.exports = {firebase};