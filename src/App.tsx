import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CarritoConsulta } from "./pages/Cart";
import Category from "./pages/Category";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/carrito" element={<CarritoConsulta />} />
          <Route path="*" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:categoryId" element={<Category />} />
          <Route path="/analitica" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
