//Roaia Habashi and Rawan Habashi
//חיבור ה־frontend ל־backend
import axios from 'axios';
//כל קומפוננטה באפליקציה יכולה לייבא את api ולשלוח בקשות
const api = axios.create({
baseURL: 'http://localhost:5000/api'
,
  headers: {
    'Content-Type': 'application/json',
  },
});
// ✅ אם נרצה לגשת לקבצים סטטיים (תמונות וכו') מתוך תיקיית images בשרת
api.interceptors.request.use(config => {
  if (config.url && config.url.startsWith('/images/')) {
    config.url = config.url.replace('/images/', 'http://localhost:5000/images/');
  }
  return config;
});
export default api;
