import React, { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import "./PagePrincipale.css";
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function PagePrincipale({onUserClick, setCurrentPage}) {
  
  const gradientStyle = {
      background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };
  
  {/* CSS par ChatGPT, pour un bootstrap plus effectif. */}
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Haut de la page */}
      <nav className="navbar navbar-expand-lg sticky-top" style={gradientStyle}>
        <div className="container-fluid">
          <a className="navbar-brand text-white fw-bold">
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50"/>
            bran.fun
          </a>
          {/* Hover menu choix utilisateur */}
          <div className="ms-auto me-4 position-relative user-hover-area d-flex align-items-center">
            <FaUserCircle size={35} className="me-2 text-white"/>
            <span className="text-white">User A</span>
            {/* Affichage menu choix utilisateur */}
            <div className="hover-box position-absolute">
              <div className="menu-box border-box-top" onClick={onUserClick}>
                Information du compte
              </div>
              <div className="menu-box border-box-bottom">
                Se déconnecter
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* L'élément principale */}
      <div id="main_container" className="container py-5 flex-grow-1">
        <div className="row g-4">
          {/* BombParty */}
          <div className="col-md-6">
            <div className="game-card">
              <img src="/images/bombparty.jpg" alt="Bomb Party" height="150"/>
              <button className="btn mb-3">Créer une salle</button>
              <p className="fw-bold">Ou</p>
              <h5 className="fw-bold mb-2">Rejoindre une salle existante</h5>
              <div className="input-group mb-3 w-75 mx-auto">
                <input type="text" className="form-control" placeholder="Code de la salle"/>
                <button className="btn">Rejoindre</button>
              </div>
            </div>
          </div>
          {/* Jeu2 */}
          <div className="col-md-6">
            <div className="game-card">
              <img src="/images/Jeu2.jpg" alt="Jeu 2" height="150"/>
              <button className="btn mb-3">Créer une salle</button>
              <p className="fw-bold">Ou</p>
              <h5 className="fw-bold mb-2">Rejoindre une salle existante</h5>
              <div className="input-group mb-3 w-75 mx-auto">
                <input type="text" className="form-control" placeholder="Code de la salle"/>
                <button className="btn">Rejoindre</button>
              </div>
            </div>
          </div>
        </div>
        {/* Rejoindre salles existantes */}
        <div className="text-center mt-5">
          <h4>Rejoindre directement les salles publiques ouvertes actuellement:</h4>
          <button className="btn mt-3">AOSKP</button>
        </div>
      </div>
      {/* Bas de la page */}
      <footer className="py-3 fixed-bottom w-100 d-flex align-items-center" style={gradientStyle}>
        <div className="ms-3">
          <a className="me-3 footer-link">
            Contactez-nous
          </a>
          <a className="footer-link">
            Aide
          </a>
        </div>
      </footer>
    </div>
  )
}

export default PagePrincipale;