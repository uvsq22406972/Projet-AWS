import React from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function CreateAccount({onLoginClick, onPagePrincipaleClick, setCurrentPage}) {
    const gradientStyle = {
        background: "linear-gradient(to top, #3B7088, #4FE9DE)",
      };
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={gradientStyle}>
          <h2 className="mb-4 fw-bold">Créer un compte</h2>
          <form className="w-100">
            <div className="mb-10 input-box">
              <input type="text" required/>
              <label>Nom d'utilisateur</label>
            </div>
            <div className="mb-10 input-box">
              <input type="email" required/>
              <label>Email</label>
            </div>
            <div className="mb-10 input-box">
              <input type="password" required/>
              <label>Mot de passe</label>
            </div>
            <div className="mb-10 input-box">
              <input type="password" required/>
              <label>Confirmer le mot de passe</label>
            </div>
            <button type="submit" className="btn custom-btn w-100" onClick={onPagePrincipaleClick}>
              S'inscrire
            </button>
            <p className="mt-3 text-white">
              Déjà un compte ? 
              {/* eslint-disable-next-line */} 
              <a className="ms-2 footer-link fw-bold" onClick={onLoginClick}>
                Se connecter
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
