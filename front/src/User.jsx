import React, { useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import "./User.css";
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function User({onBackToPagePrincipaleClick, setCurrentPage}) {
  const [activeSection, setActiveSection] = useState('info');

  // A simple gradient for navbar & footer
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  {/* CSS par ChatGPT, pour un bootstrap plus effectif. */}
  function renderRightContent() {
    if (activeSection === 'info') {
      return (
        <div id="section-info" className="mb-5">
          <h3 className="mb-4">Information du compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nom d'utilisateur</label>
              <input type="text" className="form-control custom-input" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Adresse e-mail</label>
              <input type="email" className="form-control custom-input" />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Mot de passe</label>
              <input type="password" className="form-control custom-input" />
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
        </div>
      );
    } else if (activeSection === 'password') {
      return (
        <div id="section-password" className="mb-5">
          <h3 className="mb-4">Modifier votre mot de passe</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">Mot de passe actuelle</label>
              <input type="password" className="form-control custom-input" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nouveau mot de passe</label>
              <input type="password" className="form-control custom-input" />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Resaisir votre nouveau mot de passe</label>
              <input type="password" className="form-control custom-input" />
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
        </div>
      );
    } else if (activeSection === 'delete') {
      return (
        <div id="section-delete" className="mb-5">
          <h3 className="mb-4">Supprimer votre compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Saisissez votre nom d'utilisateur
              </label>
              <input type="text" className="form-control custom-input" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Saisissez votre mot de passe</label>
              <input type="password" className="form-control custom-input" />
            </div>
            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="confirmDelete" />
              <label className="form-check-label" htmlFor="confirmDelete">
                Je confirme de vouloir supprimer mon compte
              </label>
            </div>
            <button type="submit" className="btn btn-secondary">
              Supprimer mon compte
            </button>
          </form>
        </div>
      );
    }
  }

  function handleMenuClick(section) {
    setActiveSection(section);
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Haut de la page */}
      <nav className="navbar navbar-expand-lg sticky-top" style={gradientStyle}>
        <div className="container-fluid">
          <a className="navbar-brand text-white fw-bold" onClick={onBackToPagePrincipaleClick}>
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50"/>
            bran.fun
          </a>
          <div className="ms-auto me-4 d-flex align-items-center footer-link">
            <FaUserCircle size={40} className="me-3" />
            <span>User A</span>
          </div>
        </div>
      </nav>

      {/* L'élément principale */}
      <div className="container flex-grow-1 my-5">
        <div className="row">
          {/* Menu à gauche */}
          <div className="col-md-3">
            <div className={`menu-box mb-3 ${activeSection === 'info' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('info')}>
              <strong>Information du compte</strong>
            </div>
            <div
              className={`menu-box mb-3 ${activeSection === 'password' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('password')}>
              <strong>Modifier votre mot de passe</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'delete' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('delete')}>
              <strong>Supprimer votre compte</strong>
            </div>
          </div>

          {/* Menu choisies */}
          <div className="col-md-9">{renderRightContent()}</div>
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
  );
}

export default User;
