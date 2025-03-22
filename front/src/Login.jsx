import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
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
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRecaptchaChange = (value) => setRecaptchaValue(value);
  const handleCodeChange = (e) => setVerificationCode(e.target.value);

  const handleLoginClick = async (e) => {
    e.preventDefault(); // Empêcher le rafraîchissement de la page
    console.log("Login click");

    if (!recaptchaValue) {
      toast.error("Veuillez valider le reCAPTCHA !");
      return;
    }

    console.log("recaptchaValue =", recaptchaValue);

    try {
      const response = await axios.post(`/api/users`, {
        email,
        mdp: password,
        recaptchaToken: recaptchaValue
      });

      if (response.data.status === 200) {
        toast.success("Code de vérification envoyé à votre adresse email !");
        setIsVerificationSent(true);
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

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post('/api/verify-code', { code: verificationCode }); // Envoie uniquement le code
      if (response.data.status === 200) {
        toast.success("Connexion réussie !");
        setTimeout(onPagePrincipaleClick, 500);
      } else {
        toast.error("Code de vérification invalide.");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification.");
    }
  };




  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={gradientStyle}>
          <h2 className="mb-4 fw-bold">Connexion</h2>
          {!isVerificationSent ? (
            <form className="w-100">
              <div className="mb-10 input-box">
                <input type="email" value={email} onChange={handleEmailChange} />
                <label>Email</label>
              </div>
              <div className="mb-10 input-box">
                <input type="password" value={password} onChange={handlePasswordChange} />
                <label>Mot de passe</label>
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
          ) : (
            <div>
              <input 
                type="text" 
                value={verificationCode} 
                onChange={handleCodeChange} 
                placeholder="Entrez le code de vérification" 
                className="form-control mb-3"
              />
              <button className="btn custom-btn w-100" onClick={handleVerifyClick}>
                Vérifier
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
