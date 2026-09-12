import React from 'react';
import { Header } from './components/Header';
import Home from "./pages/Home";

function App(): React.JSX.Element {
  return (
    <>
      <Header />
      <main>
        <Home />
      </main>
    </>
  );
}

export default App;
