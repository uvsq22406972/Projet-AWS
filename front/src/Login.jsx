//Importation
import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

//Page qui permet de se connecter à un compte existant
function Login({onCreateAccountClick, onPagePrincipaleClick, setIsConnected, setCurrentPage}) {
  //Initialisation des états
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Pour avoir un couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };
  
  //Mise à jour des inputs
  const handleEmailChange = (e) => {
      setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
      setPassword(e.target.value);
  };

  //Action lorsqu'on clique sur "Se connecter"
  const handleLoginClick = (e) => {
    e.preventDefault(); //Empêcher le rafraîchissement de la page

    //Initialisation des variables
    const email = document.getElementById("login_email").value;
    const mdp = document.getElementById("login_motdepasse").value;

    //Création de la session lorsqu'on réussi à se connecter
    axios.post(`http://localhost:4000/api/users`, { email, mdp })
      .then(response => {
        //Affichage des réponses du API
        if (response.data.status === 200 ) {
            toast.success("Welcome 👍 ");
            setTimeout(() => { onPagePrincipaleClick(); }, 500);
        } else if (response.data.status === 400) {
            toast.error("Veuillez remplir les champs");
        } else if (response.data.status === 401) {
            toast.error("Mot de passe incorrect");
        } else if ( response.data.status === 402 ){
            toast.error("Utilisateur inexistant");
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
          <h2 className="mb-4 fw-bold">Connexion</h2>
          <form className="w-100">
            {/* input de l'email */} 
            <div className="mb-10 input-box">
              <input type="email" id='login_email' value={email} onChange={handleEmailChange}/>
              <label>Email</label>
            </div>
            {/* input du mdp */} 
            <div className="mb-10 input-box">
              <input type="password" id='login_motdepasse' value={password} onChange={handlePasswordChange}/>
              <label>Mot de passe</label>
            </div>
            {/* Partie validation isncription/se connecter */} 
            <button type="submit" className="btn custom-btn w-100" onClick={handleLoginClick}>Se connecter</button>
            <p className="mt-3 text-white">
              Pas de compte ?
              {/* eslint-disable-next-line */}
              <a className="ms-2 footer-link fw-bold" onClick={onCreateAccountClick}>
                Créer un compte
              </a>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Login;