import React from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App';
import { BrowserRouter } from 'react-router-dom';
console.log("PAYPAL ID:", process.env.REACT_APP_PAYPAL_CLIENT_ID);

const initialOptions = {
  "client-id":process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: "ILS",
  intent: "capture",
  components: "buttons",   
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <PayPalScriptProvider options={initialOptions}>
      <App />
    </PayPalScriptProvider>
  </BrowserRouter>
);
