import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import Marvel from './pages/Marvel';
import DC from './pages/DC';
import Detail from './pages/Detail';
import Formulario from './pages/Formulario';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <>
      {/* Barra de navegación principal */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">SuperDex</Link>
        <div className="nav-links">
          {/* Enlaces de navegación usando NavLink para aplicar clase 'active' automáticamente */}
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Todos</NavLink>
          <NavLink to="/marvel" className={({isActive}) => `nav-link marvel ${isActive ? 'active' : ''}`}>Marvel</NavLink>
          <NavLink to="/dc" className={({isActive}) => `nav-link dc ${isActive ? 'active' : ''}`}>DC Comics</NavLink>
          <Link to="/create" className="create-btn">+ Nuevo Héroe</Link>
        </div>
      </nav>
      
      <main className="container">
        {/* Definición de todas las rutas de la aplicación */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marvel" element={<Marvel />} />
          <Route path="/dc" element={<DC />} />
          <Route path="/hero/:id" element={<Detail />} />
          <Route path="/create" element={<Formulario />} />
          <Route path="/edit/:id" element={<Formulario />} />
        </Routes>
      </main>
      
      <ToastContainer />
    </>
  );
}

export default App;
