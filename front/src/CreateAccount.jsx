//Importation
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

//Page qui permet de créer un compte
function CreateAccount({onLoginClick, onPagePrincipaleClick, setCurrentPage}) {
  //Initialisation des états
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');

  //Pour avoir un couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  //Mise à jour des inputs
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleRePasswordChange = (e) => {
    setRePassword(e.target.value);
  };

  //Action lorsqu'on clique sur "S'inscrire"
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
    
    //Envoie des valeurs au back pour le stocker dans la bdd
    axios.put('http://localhost:4000/api/users', { pseudo, email, mdp1, mdp2 })
    .then(response => {
      //Affichage des réponses du API
      console.log("Réponse de l'API :", response.data.message);
      if (response.data.message === "Email deja utilisé") {
        toast.error("Utilisateur existant");
      } else if (response.data.message === "Utilisateur créé avec succès") {
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
      else if (response.data.message === "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"){
        toast.error(response.data.message);
      }
    })
    .catch(error => {
        //console.error("Erreur lors de la requête:", error);
    });
  }

  //CSS par ChatGPT, pour un bootstrap plus effectif
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="register-box text-center p-5 shadow-lg rounded" style={gradientStyle}>
          <h2 className="mb-4 fw-bold">Créer un compte</h2>
          <form className="w-100">
            {/* input du nom d'utilisateur */} 
            <div className="mb-10 input-box">
              <input type="text" id='create_pseudo' value={username} onChange={handleUsernameChange}/>
              <label>Nom d'utilisateur</label>
            </div>
            {/* input de l'email */} 
            <div className="mb-10 input-box">
              <input type="email" id='create_email' value={email} onChange={handleEmailChange}/>
              <label>Email</label>
            </div>
            {/* input du mdp */} 
            <div className="mb-10 input-box">
              <input type="password" id='create_mdp1' value={password} onChange={handlePasswordChange}/>
              <label>Mot de passe</label>
            </div>
            {/* input de la confirmation du mdp */} 
            <div className="mb-10 input-box">
              <input type="password" id='create_mdp2' value={repassword} onChange={handleRePasswordChange}/>
              <label>Confirmer le mot de passe</label>
            </div>
            {/* Partie validation isncription/se connecter */} 
            <button type="button" className="btn custom-btn w-100" onClick={handleCreerCompteClick}>
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
      <ToastContainer />
    </div>
  );
}

export default CreateAccount;
