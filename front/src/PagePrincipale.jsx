//Importation
import React, { useState,useEffect } from 'react';
import { FaUsers, FaUserCircle } from "react-icons/fa";
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
  const [publicRooms, setPublicRooms] = useState([]);

  const [userCoins, setUserCoins] = useState(0); 

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
        avatar: account.avatar,
        coins: account.coins
      }));

      // Si des comptes existent dans la BDD
      if (Account.length > 0) {
        const selectedAccount = Account.find((account) => account._id === userid);
        setCompte(selectedAccount);
        setUserCoins(selectedAccount.coins);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des infos du compte :', error);
    }
  }

  const fetchPublicRooms = async () => {
    try {
      const response = await axios.get('/api/rooms/public');
      setPublicRooms(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des salles');
    }
  };

  // Exécution des fonctions asynchrones
  useEffect(() => {
  
    checkSession();
    fetchAccount();
    fetchPublicRooms();

    localStorage.removeItem('room');
    localStorage.removeItem('users');
    localStorage.removeItem('winner');

    const interval = setInterval(fetchPublicRooms, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (roomCode) {
      console.log("✅ Mise à jour de roomCode :", roomCode);
      handleJoinRoom(roomCode);
    }
  }, []);

  useEffect(() => {
    // 1) Ouvrir la connexion
    const wsPublic = new WebSocket('wss://bombpartyy.duckdns.org/ws/');

    wsPublic.onopen = () => {
      console.log("WS publicRooms connecté !");
    };
  
    // 2) Gérer les messages
    wsPublic.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "room_deleted") {
        // Retirer la room supprimée de la liste actuelle
        setPublicRooms((prevRooms) => 
          prevRooms.filter(r => r.name !== data.room)
        );
      }
    };

    wsPublic.onclose = () => {
      console.warn("WS publicRooms fermé");
    };
    // 3) Cleanup
    return () => {
      wsPublic.close();
    };
  }, []);

  //  on gère les inputs utilisateurs et on passe a la game Room 
  const handleJoinRoom = async (roomName) => {
      if (!roomName){
        toast.error("Veuillez entrer un code de salle");
        return;
      }

      try {
        const resp = await axios.get(`/api/roomExists?room=${roomName}`);
        if (!resp.data.ok) {
          toast.error("Cette salle n'existe pas !");
          return;
        }
        // Sinon, la salle existe
        localStorage.setItem("room", roomName);
        setCurrentPage("gameroom");
      } catch (error) {
        toast.error("Erreur technique");
      }
  };
  
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
            <span className="text-white me-4">{userCoins} &nbsp;🪙</span>
            {compte.avatar ? (
              <img 
                src={compte.avatar} 
                alt="Avatar utilisateur" 
                className="me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid black',
                  backgroundColor:'rgba(255, 255, 255, 0.9)'
                }}
              />
            ) : (
            <FaUserCircle size={40} className="me-3 text-white"/>
            )}
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
          <div className="game-card">
            <img src="/images/bombparty.jpg" alt="Bomb Party" height="150"/>
            <button className="btn mb-3" onClick={() => setCurrentPage("gameroom",{roomCode:null})}>Créer une salle</button>
            <p className="fw-bold">Ou</p>
            <h5 className="fw-bold mb-2">Rejoindre une salle existante</h5>
            <div className="input-group mb-3 w-75 mx-auto">
              <input type="text"  
              onChange={(e) => setRoomCode(e.target.value)} value={roomCode}
              className="form-control" style={{height:39}} placeholder="Code de la salle"/>
              <button className="btn"  onClick={() => handleJoinRoom(roomCode)}
              >Rejoindre</button>
            </div>
          </div>
        </div>
        {/* Rejoindre salles existantes */}
        <div className="text-center mt-5">
          <h4>
            <FaUsers className="me-2" />
            Salles publiques actives
          </h4>

          {publicRooms.length === 0 ? (
            <div className="text-muted mt-3">Aucune salle publique ouverte</div>
          ) : (
            <div className="container mt-3">
              <div className="row gx-3"> {/* 🔥 Ajoute un espace horizontal entre les salles */}
                {publicRooms.map((room) => (
                  <div key={room.name} className="col-12 col-md-6 mb-3">
                    <div 
                      className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 room-item border rounded"
                      style={{ cursor: "pointer", padding: "10px 15px" }}
                      onClick={() => handleJoinRoom(room.name)}
                    >
                      {/* Nom de la salle */}
                      <span className="fw-bold text-center text-md-start">{room.name}</span>
                
                      {/* Conteneur aligné à droite sur PC */}
                      <div className="d-flex flex-column flex-md-row justify-content-end align-items-center gap-3 mt-2 mt-md-0">
                        {/* Icône + Texte joueurs alignés */}
                        <div className="d-flex align-items-center text-muted" style={{ minWidth: "100px" }}>
                          <FaUsers className="me-1" size={18} />
                          {room.players} joueur{room.players > 1 ? 's' : ''}
                        </div>
                
                        {/* Bouton Rejoindre */}
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={(e) => { e.stopPropagation(); handleJoinRoom(room.name); }}
                          style={{ minWidth: "90px", backgroundColor: "#E98B2A", borderColor: "#E98B2A", color: "black", marginTop: "20px" }}
                        >
                          Rejoindre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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