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
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Mise à jour des inputs
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRePasswordChange = (e) => setRePassword(e.target.value);
  const handleCodeChange = (e) => setVerificationCode(e.target.value);

  // Action lorsqu'on clique sur "S'inscrire"
  const handleCreerCompteClick = () => {
    //Initialisation des variables
    const pseudo = document.getElementById("create_pseudo").value;
    const email = document.getElementById("create_email").value;
    const mdp1 = document.getElementById("create_mdp1").value;
    const mdp2 = document.getElementById("create_mdp2").value;
    console.log("Pseudo:", pseudo);
    console.log("Email:", email);
    console.log("Mot de passe 1:", mdp1, "Longueur:", mdp1.length);
    console.log("Mot de passe 2:", mdp2, "Longueur:", mdp2.length);

    const sendVerificationCode = async () => {
      try {
        await axios.post('/api/users', { email }); // Déclenche l'envoi du code
      } catch (error) {
        toast.error("Erreur lors de l'envoi du code");
      }
    };
    
    //Envoie des valeurs au back pour le stocker dans la bdd
    axios.put('/api/users', { pseudo, email, mdp1, mdp2 })
    .then(response => {
      //Affichage des réponses du API
      console.log("Réponse de l'API :", response.data.message);
      if (response.data.message === "Email deja utilisé") {
        toast.error("Utilisateur existant");
      } else if (response.data.message === "Utilisateur créé avec succès") {
        setIsVerificationSent(true);
        sendVerificationCode();
        toast.success("Compte créé avec succès 👍");
        toast.success("Redirection automatique");        
        setTimeout(() => {onLoginClick();}, 5100);
      } else if (response.data.message === "Les mots de passe ne correspondent pas") {
        toast.error("Mot de passe different");
      } else if (response.data.message === "Tous les champs sont nécessaires"){
        toast.error("Veuillez remplir tout les champs");
      }
      else if (response.data.message === "L'email n'est pas valide"){
        toast.error("L'email n'est pas valide");
      }
      else if (response.data.message === "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole"){
        toast.error(response.data.message);
      }
    })
    .catch(error => {
        //console.error("Erreur lors de la requête:", error);
    });
  }

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post('/api/verify-code', { code: verificationCode }); // Envoie uniquement le code
      if (response.data.status === 200) {
        toast.success("Connexion réussie !");
        onLoginClick();
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
                <input type="password" id='create_mdp1' value={password} onChange={handlePasswordChange} />
                <label>Mot de passe</label>
              </div>
              <div className="mb-10 input-box">
                <input type="password" id='create_mdp2' value={repassword} onChange={handleRePasswordChange} />
                <label>Confirmer le mot de passe</label>
              </div>
              <div className="password-recommendations">
                <h6>Recommandations pour le mot de passe :</h6>
                <ul style={{ fontSize: '0.7em' }}> {/* Ajustez la taille selon vos besoins */}
                  <li>Au moins une lettre majuscule</li>
                  <li>Au moins une lettre minuscule</li>
                  <li>Au moins un chiffre</li>
                  <li>Au moins un symbole</li>
                  <li>Au moins 8 caractères</li>
                </ul>
              </div>
              <button type="button" className="btn custom-btn w-100" onClick={handleCreerCompteClick}>S'inscrire</button>
              <p className="mt-3 text-white">
              Déjà un compte ?  
              <button className="ms-2 footer-link fw-bold btn-link " onClick={onLoginClick}>
              Se connecter
              </button>
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

export default CreateAccount;