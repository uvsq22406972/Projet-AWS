// Importation
import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Connexion avec le back
axios.defaults.baseURL = 'https://bombpartyy.duckdns.org';
axios.defaults.withCredentials = true;

// Fonction de validation du mot de passe
function checkPasswordCriteria(password) {
  return {
    hasMinLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecial: /[!@#$%^&*?.]/.test(password)
  };
}

function circleStyle(condition) {
  return {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '8px',
    backgroundColor: condition ? 'green' : 'red'
  };
}

// Page qui permet de créer un compte
function CreateAccount({ onLoginClick }) {
  // Initialisation des états
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [repassword, setRePassword] = useState('');
  const [showRePassword, setShowRePassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const { hasMinLength, hasLowerCase, hasUpperCase, hasDigit, hasSpecial } = checkPasswordCriteria(password);

  // Mise à jour des inputs
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRePasswordChange = (e) => setRePassword(e.target.value);
  const handleCodeChange = (e) => setVerificationCode(e.target.value);
  const handleShowPasswordChange = () => {
    setShowPassword(!showPassword);
  };
  const handleShowRePasswordChange = () => {
    setShowRePassword(!showRePassword);
  };

  // Action lorsqu'on clique sur "S'inscrire"
  const handleCreerCompteClick = async () => {
    const pseudo = username;
    const emailVal = email;
    const mdp1 = password;
    const mdp2 = repassword;
  
    try {
      const response = await axios.put('/api/users', { pseudo, email: emailVal, mdp1, mdp2 });
      
      if (response.data.message === "Code envoyé avec succès") {
        setIsVerificationSent(true);
        toast.success("Code envoyé, vérifiez votre email.");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la création du compte.");
    }
  };  

  const handlePaste = (e) => {
    e.preventDefault(); // Empêche l'action de coller
  };

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post('/api/verify-code', { code: verificationCode });
      if (response.data.status === 200) {
        toast.success("Compte vérifié et créé avec succès !");
        setTimeout(() => {onLoginClick();}, 3000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification.");
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={{ background: "linear-gradient(to top, #3B7088, #4FE9DE)" }}>
          <h2 className="mb-4 fw-bold">Créer un compte</h2>
          {!isVerificationSent ? (
            <form className="w-100">
              <div className="mb-10 input-box">
                <input type="text" id='create_pseudo' value={username} onChange={handleUsernameChange} />
                <label>Nom d'utilisateur</label>
              </div>
              <div className="mb-10 input-box">
                <input type="email" id='create_email' value={email} onChange={handleEmailChange} />
                <label>Email</label>
              </div>
              <div className="mb-10 input-box">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onPaste={handlePaste}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
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
              {isPasswordFocused && (
                <div
                  style={{
                    backgroundColor: "#fff",
                    color: "#000", // pour que le texte soit bien lisible sur fond blanc
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    textAlign: "left",
                    border: "2px solid black"
                  }}
                >
                  <div style={{ marginBottom: "5px" }}>
                    <span style={circleStyle(hasMinLength)}></span>
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={circleStyle(hasLowerCase)}></span>
                    <span>Au moins 1 lettre minuscule</span>
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={circleStyle(hasUpperCase)}></span>
                    <span>Au moins 1 lettre majuscule</span>
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={circleStyle(hasDigit)}></span>
                    <span>Au moins 1 chiffre</span>
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <span style={circleStyle(hasSpecial)}></span>
                    <span>Au moins 1 caractère spécial: (!@#$%^&*?.)</span>
                  </div>
                </div>
              )}
              <div className="mb-10 input-box">
                <input
                  type={showRePassword ? "text" : "password"}
                  value={repassword}
                  onPaste={handlePaste}
                  onChange={handleRePasswordChange}
                />
                <label>Confirmer le mot de passe</label>
                <span 
                  className="position-absolute end-0 top-50 translate-middle-y me-3"
                  style={{ cursor: 'pointer' }}
                  onClick={handleShowRePasswordChange}
                >
                  {showRePassword ? (
                    <FaEyeSlash size={20} className="password-toggle-icon" />
                  ) : (
                    <FaEye size={20} className="password-toggle-icon" />
                  )}
                </span>
              </div>
              <button type="button" className="btn custom-btn w-100" onClick={handleCreerCompteClick}>S'inscrire</button>
              <p className="mt-3 text-white">
              Déjà un compte ? <a className="ms-2 footer-link fw-bold" onClick={onLoginClick}>Se connecter</a>
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
              <a className="btn custom-btn w-100" onClick={handleVerifyClick}>
                Vérifier
              </a>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CreateAccount;