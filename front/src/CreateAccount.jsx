// Importation
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

// Fonction de validation du mot de passe
const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*?.])[A-Za-z0-9!@#$%^&*?.]{8,}$/;
  return regex.test(password);
};

// Page qui permet de créer un compte
function CreateAccount({ onLoginClick }) {
  // Initialisation des états
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');

  // Mise à jour des inputs
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRePasswordChange = (e) => setRePassword(e.target.value);

  // Action lorsqu'on clique sur "S'inscrire"
  const handleCreerCompteClick = () => {
    // Vérification des champs
    if (!username || !email || !password || !repassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (password !== repassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères, un chiffre et un symbole");
      return;
    }
    
    // Envoi des valeurs au back
    axios.put('/api/users', { pseudo: username, email, mdp1: password, mdp2: repassword })
      .then(response => {
        console.log("Réponse de l'API :", response.data.message);
        if (response.data.message === "Email déjà utilisé") {
          toast.error("Utilisateur existant");
        } else if (response.data.message === "Utilisateur créé avec succès") {
          toast.success("Compte créé avec succès 👍");
          toast.success("Redirection automatique");
          setTimeout(() => { onLoginClick(); }, 3000);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(error => {
        console.error("Erreur lors de la requête:", error);
        toast.error("Erreur lors de la création du compte");
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={{ background: "linear-gradient(to top, #3B7088, #4FE9DE)" }}>
          <h2 className="mb-4 fw-bold">Créer un compte</h2>
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
              <input type="password" id='create_mdp1' value={password} onChange={handlePasswordChange} />
              <label>Mot de passe</label>
            </div>
            <div className="mb-10 input-box">
              <input type="password" id='create_mdp2' value={repassword} onChange={handleRePasswordChange} />
              <label>Confirmer le mot de passe</label>
            </div>
            <button type="button" className="btn custom-btn w-100" onClick={handleCreerCompteClick}>S'inscrire</button>
            <p className="mt-3 text-white">
            Déjà un compte ?  
            <button className="ms-2 footer-link fw-bold btn-link " onClick={onLoginClick}>
            Se connecter
            </button>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CreateAccount;
