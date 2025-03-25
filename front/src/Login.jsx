import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Connexion avec le back
axios.defaults.baseURL = 'https://bombpartyy.duckdns.org';
axios.defaults.withCredentials = true;

function Login({ onCreateAccountClick, onPagePrincipaleClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleShowPasswordChange = () => {
    setShowPassword(!showPassword);
  };
  const handleRecaptchaChange = (value) => setRecaptchaValue(value);

  const handleLoginClick = async (e) => {
    e.preventDefault();

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
        toast.success("Login validé");
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
            <div className="mb-10 input-box">
              <input type="email" value={email} onChange={handleEmailChange} />
              <label>Email</label>
            </div>
            <div className="mb-10 input-box">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
              />
              <label>Mot de passe</label>
              <span 
                className="position-absolute end-0 top-50 translate-middle-y me-3"
                style={{ cursor: 'pointer' }}
                onClick={handleShowPasswordChange}
              >
                {showPassword ? (
                  <FaEyeSlash size={20} className="password-toggle-icon" />
                ) : (
                  <FaEye size={20} className="password-toggle-icon" />
                )}
              </span>
            </div>
            <ReCAPTCHA
              sitekey="6LdtjdcqAAAAAJiQiqVsDxWDDVgDTH_hdzOgRzcP"
              onChange={handleRecaptchaChange}
            />
            <button type="submit" className="btn custom-btn w-100" onClick={handleLoginClick}>
              Se connecter
            </button>
            <p className="mt-3 text-white">
              Pas de compte ? <a className="ms-2 footer-link fw-bold" onClick={onCreateAccountClick}>Créer un compte</a>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;