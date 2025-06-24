import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { useCsrfInit } from './hooks/useCsrfInit';
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  useCsrfInit();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
