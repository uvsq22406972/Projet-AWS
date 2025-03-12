// Importation
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './Login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

// Page qui permet de se connecter à un compte existant
function Login({ onCreateAccountClick, onPagePrincipaleClick }) {
  // Initialisation des états
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState('');

  // Pour avoir une couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  // Mise à jour des inputs
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  // Action lorsqu'on clique sur "Se connecter"
  const handleLoginClick = async (e) => {
    e.preventDefault(); // Empêcher le rafraîchissement de la page

    if (!recaptchaValue) {
      toast.error("Veuillez valider le reCAPTCHA !");
      return;
    }

    try {
      const response = await axios.post(`/api/users`, {
        email,
        mdp: password,
        recaptchaToken: recaptchaValue
      });

      if (response.data.status === 200) {
        toast.success("Connexion réussie !");
        setTimeout(onPagePrincipaleClick, 500);
      } else if (response.data.status === 400) {
        toast.error("Veuillez remplir les champs");
      } else if (response.data.status === 401) {
        toast.error("Mot de passe incorrect");
      } else if (response.data.status === 402) {
        toast.error("Utilisateur inexistant");
      }
    } catch (error) {
      toast.error("Erreur serveur.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={gradientStyle}>
          <h2 className="mb-4 fw-bold">Connexion</h2>
          <form className="w-100">
            {/* Input de l'email */}
            <div className="mb-10 input-box">
              <input type="email" value={email} onChange={handleEmailChange} />
              <label>Email</label>
            </div>
            {/* Input du mot de passe */}
            <div className="mb-10 input-box">
              <input type="password" value={password} onChange={handlePasswordChange} />
              <label>Mot de passe</label>
            </div>

            {/* Widget reCAPTCHA */}
            <ReCAPTCHA
              sitekey="6LdtjdcqAAAAAJiQiqVsDxWDDVgDTH_hdzOgRzcP" // Remplace par ta clé
              onChange={handleRecaptchaChange}
            />

            {/* Bouton de connexion */}
            <button type="submit" className="btn custom-btn w-100" onClick={handleLoginClick}>Se connecter</button>

            <p className="mt-3 text-white">
              Pas de compte ?
              <a className="ms-2 footer-link fw-bold" onClick={onCreateAccountClick}>Créer un compte</a>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
