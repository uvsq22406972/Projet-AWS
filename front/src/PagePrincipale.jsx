//Importation
import React, { useState,useEffect } from 'react';
import { FaUserCircle } from "react-icons/fa";
import "./PagePrincipale.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


//Connexion avec le back
axios.defaults.baseURL = 'https://bombpartyy.duckdns.org';
axios.defaults.withCredentials = true;

//Page qui permet d'être sur la page principale
function PagePrincipale({onUserClick, onLoginClick, setIsConnected, setCurrentPage}) {
  //Initialisation des états
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [compte, setCompte] = useState([]);
  const [roomCode, setRoomCode] = useState("");   


  //Pour avoir un couleur unique
  const gradientStyle = {
      background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  //Action lorsqu'on clique sur "Se déconnecter"
  const handleLogoutClick = async () => {
    try {
      //Envoie une requête à l'API pour détruire la session (le cookie)
      await axios.post('https://bombpartyy.duckdns.org/api/logout');
      
      //Met à jour l'état pour indiquer que l'utilisateur est déconnecté
      setIsConnected(false);
      //Redirige l'utilisateur vers la page de connexion
      setCurrentPage('login');

    } catch (error) {
        //console.error('Erreur lors de la déconnexion :', error);
    }
  };

  // Vérifier si une session est déjà ouverte ou pas
  async function checkSession() {
    try {
      // Récupérer le userid dans la session
      const response = await axios.get('/api/session');
      let userid = response.data.userid;

      if (userid) {
        console.log("c'est moi", userid);
        setIsConnected(true);
        setCurrentPage('pagePrincipale');
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
  // Exécution des fonctions asynchrones
  useEffect(() => {
    checkSession();
    fetchAccount();
    // eslint-disable-next-line
  }, []);

  //  on gère les inputs utilisateurs et on passe a la game Room 
  const handleJoinRoom = () => {

    const socket = new WebSocket("wss://bombpartyy.duckdns.org/ws/");
    localStorage.setItem("room", roomCode);
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data recu on message",data.message);
        if (data.type === 'no_room') {
          console.log("Aucune room trouvé");
          toast.error("Aucun salle de jeu ne porte ce nom");

        } else {
          setCurrentPage('gameroom',roomCode );
          socket.close();
          console.log("connexion fermée");
        }
      };
    //quand la connexion est faite
    socket.onopen = () => {
      console.log('Connexion WebSocket établie');
      console.log("valeur récupérer :" , roomCode);
      // Envoie du message pour rejoindre la room
      socket.send(
        JSON.stringify({
          type: 'join_room',
          room: roomCode,
          user: compte.username,
        })
      );
      
  };
  }
  //CSS par ChatGPT, pour un bootstrap plus effectif
  return (
    <div>
    <div className="d-flex flex-column min-vh-100">
      {/* Haut de la page */}
      <nav className="navbar navbar-expand-lg sticky-top" style={gradientStyle}>
        <div className="container-fluid">
          <div className="navbar-brand text-white fw-bold" onClick={() => setShowLogoutConfirmation(false)}>
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50"/>
            bran.fun
          </div>
          {/* Hover menu choix utilisateur */}
          <div className="ms-auto me-4 position-relative user-hover-area d-flex align-items-center">
            <FaUserCircle size={40} className="me-3 text-white"/>
            <span className="text-white">{compte.username}</span>
            {/* Affichage menu choix utilisateur */}
            <div className="hover-box position-absolute">
              <div className="menu-box border-box-top" onClick={onUserClick}>
                Information du compte
              </div>
              <div className="menu-box border-box-bottom" onClick={() => setShowLogoutConfirmation(true)}>
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
              <button onClick={handleLogoutClick} className="btn">
                Oui
              </button>
              <button className="btn" onClick={() => setShowLogoutConfirmation(false)}>
                Non
              </button>
            </div>
          </div>
        </div>
      )}
      {/* L'élément principale */}
      <div id="main_container" className="container py-5 flex-grow-1">
        <div className="row g-4">
          {/* BombParty */}
          <div className="col-md-6">
            <div className="game-card">
              <img src="/images/bombparty.jpg" alt="Bomb Party" height="150"/>
              <button className="btn mb-3" onClick={() => setCurrentPage("gameroom",{roomCode:null})}>Créer une salle</button>
              <p className="fw-bold">Ou</p>
              <h5 className="fw-bold mb-2">Rejoindre une salle existante</h5>
              <div className="input-group mb-3 w-75 mx-auto">
                <input type="text"  
                onChange={(e) => setRoomCode(e.target.value)} value={roomCode}
                className="form-control" placeholder="Code de la salle"/>

                <button className="btn"  onClick={handleJoinRoom}
                >Rejoindre</button>
              </div>
            </div>
          </div>
          {/* Jeu2 */}
          <div className="col-md-6">
            <div className="game-card">
              <img src="/images/Jeu2.jpg" alt="Jeu 2" height="150"/>
              <button className="btn mb-3">Créer une salle</button>
              <p className="fw-bold">Ou</p>
              <h5 className="fw-bold mb-2">Rejoindre une salle existante</h5>
              <div className="input-group mb-3 w-75 mx-auto">
                <input type="text" className="form-control" placeholder="Code de la salle"/>
                <button className="btn">Rejoindre</button>
              </div>
            </div>
          </div>
        </div>
        {/* Rejoindre salles existantes */}
        <div className="text-center mt-5">
          <h4>Rejoindre directement les salles publiques ouvertes actuellement:</h4>
          <button className="btn mt-3">AOSKP</button>
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
    </div>
    <ToastContainer/>
    </div>
  )
}

export default PagePrincipale;