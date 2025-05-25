import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Navigation />
        <main>
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
