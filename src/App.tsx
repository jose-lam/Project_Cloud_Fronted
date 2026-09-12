import React from 'react';
import { Header } from './components/Header';
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CarritoConsulta } from "./pages/Cart";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/carrito" element={<CarritoConsulta />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
