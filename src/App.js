//import logo from './logo.svg';
import React from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "./components/Navbar"; 
import AppRoutes from './routes/AppRoutes';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './utils/AuthContext'; // Importa el contexto de autenticación
function App() {
  return (
    <div className="App">
        
      <Router>
        <AuthProvider> {/* El contexto de autenticación debe estar dentro de Router */}
          <AppRoutes />
        </AuthProvider>
      </Router>
  
      
      
    </div>
  );
}

export default App;
