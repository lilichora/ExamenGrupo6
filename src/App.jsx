import React, { useState, useEffect } from 'react';
import './App.css';
import logo from'./imagenes/logo_espe.png';
import fondo from'./imagenes/fondo_grupo6.jpg';
import { createClient } from '@supabase/supabase-js';
import ProductForm from './components/products/ProductForm';
import TransactionForm from './components/transactions/TransactionForm';

// Configurar el cliente Supabase
const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession();
    setUser(session?.user);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        switch (event) {
          case "SIGNED_IN":
            setUser(session?.user);
            break;
          case "SIGNED_OUT":
            setUser(null);
            break;
          default:
        }
      }
    );
    return () => {
      supabase.auth.onAuthStateChange((event, session) => {
      });
    };
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
    });
  };
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div  style={{ 
     
     
      position: 'relative', // Asegura que el div sea posicionado de forma relativa
      width: '100vw', // Establece el ancho del fondo al ancho de la ventana
      height: '100vh', // Establece la altura del fondo al alto de la ventana
    }}>
      <img src={fondo} alt="fondo" style={{ 
        position: 'absolute', // Posiciona la imagen de fondo de forma absoluta
        top: 0, // Alinea la imagen de fondo con la parte superior del div contenedor
        left: 0, // Alinea la imagen de fondo con la parte izquierda del div contenedor
        width: '100%', // Ajusta el ancho de la imagen de fondo al 100% del div contenedor
        height: '100%', // Ajusta la altura de la imagen de fondo al 100% del div contenedor
        zIndex: -1, // Establece un valor de z-index para que la imagen de fondo esté detrás del contenido
      }} />
        <img src={logo} alt="logo" style={{ width: '50%', height: '50%' }}   />
        <h1 className="text-center mt-4" style={{ color: 'blue' }}>Sistema de Inventario de Comida</h1>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
         
            Grupo 6
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
             
            </ul>
            {user ? (
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                   <button className="btn btn-light-warning" onClick={logout}>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="navbar-nav ms-auto">
                
                <button className="btn btn-success" onClick={login} style={{ backgroundColor: 'green', color: 'white' }}>
                      Ingrese con Github
                </button>

              </ul>
            )}
          </div>
        </div>
      
      </nav>

      {user ? (
        <div className="container mt-5" id="productos">
         
         
          <div className="row">
            <div className="col-md-6">
              <ProductForm supabase={supabase} />
            </div>
            <div className="col-md-6">
              <TransactionForm supabase={supabase} />
            </div>
          </div>
        </div>
      ) : (
        <div className="container mt-5">
          
        </div>
      )}
    </div>
  );
}
