// env.js
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8037'
  : 'https://us-central1-j7christcrosswordz.cloudfunctions.net/api';
