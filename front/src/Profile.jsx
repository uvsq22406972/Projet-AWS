//Importation
import React, { useState, useEffect } from 'react';
import { FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

//Page qui permet d'être sur la page menu utilisateur
function Profile({ onBackToPagePrincipaleClick, setIsConnected, setCurrentPage }) {
  //Initialisation des états
  const [activeSection, setActiveSection] = useState('info');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [compte, setCompte] = useState([]);

  // États pour la modification du mot de passe
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');

  //Pour avoir une couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  // Action lorsqu'on clique sur "Se déconnecter"
  const handleLogoutClick = async () => {
    try {
      // Envoie une requête à l'API pour détruire la session (le cookie)
      await axios.post('/api/logout');
      
      // Met à jour l'état pour indiquer que l'utilisateur est déconnecté
      setIsConnected(false);
      // Redirige l'utilisateur vers la page de connexion
      setCurrentPage('login');

    } catch (error) {
      // console.error('Erreur lors de la déconnexion :', error);
    }
  };

  // Vérifier si une session est déjà ouverte ou pas
  async function checkSession() {
    try {
      // Récupérer le userid dans la session
      const response = await axios.get('/api/session');
      let userid = response.data.userid;

      if (userid) {
        setEmail(userid); // Sauvegarde de l'email pour la modification du mdp
        console.log("c'est moi", userid);
        setIsConnected(true);
        setCurrentPage('profile');
      } else {
        setIsConnected(false);
        setCurrentPage('login');
      }
    } catch (error) {
      setIsConnected(false);
      setCurrentPage('login');
    }
  }

  // Récupérer les attributs de la collection Compte sous forme array
  async function fetchAccount() {
    try {
      // Récupérer les attributs dans la bdd
      const response = await axios.get('/api/users/all');
      const fetchedAccount = response.data;

      // Récupérer le userid dans la session
      const responses = await axios.get('/api/session');
      let userid = responses.data.userid;

      // Initialiser les valeurs de chaque attribut
      const Account = fetchedAccount.map(account => ({
        _id: account._id,
        username: account.username,
        password: account.password,
      }));

      // Si des comptes existent dans la BDD
      if (Account.length > 0) {
        const selectedAccount = Account.find((account) => account._id === userid);
        setCompte(selectedAccount);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des infos du compte :', error);
    }
  }

  //Action lorsque'on clique sur "supprimer votre compte"
  const handleDeleteAccount = (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    console.log("test");
    // Initialisation des variables
    const emailInput = document.getElementById("delete-email");
    const loginInput = document.getElementById("delete_username");
    const passwordInput = document.getElementById("delete_password"); // 🛠 Correction ici !
    const confirmDeleteInput = document.getElementById("confirmDelete");
  
    
    // Vérifier si les éléments existent
    if (!emailInput || !loginInput || !passwordInput || !confirmDeleteInput) {
      console.log("test1 - Un ou plusieurs champs sont introuvables !");
      toast.error("Erreur : Un ou plusieurs champs sont introuvables.");
      return;
  }

    // Récupérer les valeurs
    const email = emailInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmDelete = confirmDeleteInput.checked;

    // Vérifier si les éléments existent
    if (!email || !login || !password || !confirmDelete) {
      console.log("test1 - Un ou plusieurs champs sont introuvables !");
      toast.error("Erreur : Un ou plusieurs champs sont introuvables.");
      return;
  }


    if (!confirmDelete) {
      console.log("test3");
      toast.error("Vous devez confirmer la suppression.");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);
    console.log(login);
  
    // Appel à l'API pour supprimer l'utilisateur
    axios.post('http://localhost:4000/api/delete', { email, login, password })
    .then(response => {
      console.log("Réponse de l'API :", response.data.message);
      toast.success(response.data.message); // Afficher un message de succès si tout se passe bien
      setTimeout(() => {handleLogoutClick();}, 1000);
    })
    .catch(error => {
      console.error("Erreur lors de la requête:", error);
      toast.error("Oups ! Il semble y avoir une erreur dans les informations que vous avez saisies. Pourriez-vous vérifier et essayer à nouveau");
    });
  };
  

  // Fonction de soumission pour le changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // Vérifier que le nouveau mot de passe et sa confirmation correspondent
    if (newPassword !== confirmNewPassword) {
      setMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.patch('/api/users/password', { email, oldPassword, newPassword });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Erreur lors de la modification du mot de passe.');
      }
    }
  };

  // Exécution des fonctions asynchrones
  useEffect(() => {
    checkSession();
    fetchAccount();
    // eslint-disable-next-line
  }, []);

  // Affichage des différentes sections
  function renderRightContent() {
    // Affichage menu info du compte
    if (activeSection === 'info') {
      return (
        <div id="section-info" className="mb-5">
          <h3 className="mb-4">Information du compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nom d'utilisateur</label>
              <p className="form-control custom-input">{compte.username}</p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Adresse e-mail</label>
              <p className="form-control custom-input">{compte._id}</p>
            </div>
          </form>
        </div>
      );
    // Affichage menu modifier le mot de passe
    } else if (activeSection === 'password') {
      return (
        <div id="section-password" className="mb-5">
          <h3 className="mb-4">Modifier votre mot de passe</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Mot de passe actuelle</label>
              <input 
                type="password" 
                className="form-control custom-input" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nouveau mot de passe</label>
              <input 
                type="password" 
                className="form-control custom-input" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Resaisir votre nouveau mot de passe</label>
              <input 
                type="password" 
                className="form-control custom-input" 
                value={confirmNewPassword} 
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      );
    // Affichage menu supprimer le compte
    } else if (activeSection === 'delete') {
      return (
        <div id="section-delete" className="mb-5">
          <h3 className="mb-4">Supprimer votre compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Saisissez votre nom d'utilisateur
              </label>
              <input type="text" id = "delete_username" className="form-control custom-input" />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Saisissez votre email
              </label>
              <input type="text" id = "delete-email" className="form-control custom-input" />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Saisissez votre mot de passe</label>
              <input type="password" id="delete_password" className="form-control custom-input" />
            </div>
            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="confirmDelete" />
              <label className="form-check-label" htmlFor="confirmDelete">
                Je confirme de vouloir supprimer mon compte
              </label>
            </div>
            <button type="submit" className="btn btn-secondary" onClick={handleDeleteAccount}>
              Supprimer mon compte
            </button>
          </form>
        </div>
      );
    }
  }

  // Déterminer l'affichage correct du menu
  function handleMenuClick(section) {
    setActiveSection(section);
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Haut de la page */}
      <nav className="navbar navbar-expand-lg sticky-top" style={gradientStyle}>
        <div className="container-fluid">
          <div className="navbar-brand text-white fw-bold" onClick={onBackToPagePrincipaleClick}>
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50"/>
            bran.fun
          </div>
          <div className="ms-auto me-4 position-relative user-hover-area d-flex align-items-center">
            <FaUserCircle size={40} className="me-3 text-white"/>
            <span className="text-white">{compte.username}</span>
            {/* Affichage menu choix utilisateur */}
            <div className="hover-box position-absolute">
              <div className="menu-box border-box-top" onClick={() => setShowLogoutConfirmation(true)}>
                Se déconnecter
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Confirmation logout: S'afficher lorsque showLogoutConfirmation = true */}
      {showLogoutConfirmation && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="close-btn" onClick={() => setShowLogoutConfirmation(false)}>
              X
            </button>
            <h4>Voulez-vous se déconnecter?</h4>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn" onClick={handleLogoutClick}>
                Oui
              </button>
              <button className="btn" onClick={() => setShowLogoutConfirmation(false)}>
                Non
              </button>
            </div>
          </div>
        </div>
      )}
      {/* L'élément principal */}
      <div className="container flex-grow-1 my-5">
        <div className="row">
          {/* Menu à gauche */}
          <div className="col-md-3">
            <div className={`menu-box mb-3 ${activeSection === 'info' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('info')}>
              <strong>Information du compte</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'password' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('password')}>
              <strong>Modifier votre mot de passe</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'delete' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('delete')}>
              <strong>Supprimer votre compte</strong>
            </div>
          </div>
          {/* Menu choisies */}
          <div className="col-md-9">
            {renderRightContent()}
          </div>
        </div>
      </div>
      {/* Bas de la page */}
      <footer className="py-3 fixed-bottom w-100 d-flex align-items-center" style={gradientStyle}>
        <div className="ms-3">
          {/* eslint-disable-next-line */}
          <a className="me-3 footer-link">
            Contactez-nous
          </a>
          {/* eslint-disable-next-line */}
          <a className="footer-link">
            Aide
          </a>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}

export default Profile;
