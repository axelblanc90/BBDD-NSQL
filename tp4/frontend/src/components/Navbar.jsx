import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <span className="marvel-text">MARVEL</span>
        <span className="dc-text">DC</span>
        <span>App Superhéroes</span>
      </div>
      
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/marvel" className={({ isActive }) => isActive ? 'active' : ''}>
            Marvel
          </NavLink>
        </li>
        <li>
          <NavLink to="/dc" className={({ isActive }) => isActive ? 'active' : ''}>
            DC
          </NavLink>
        </li>
        <li>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'active' : ''}>
            Agregar Héroe
          </NavLink>
        </li>
      </ul>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </nav>
  );
};

export default Navbar;
