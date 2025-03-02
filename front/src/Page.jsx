//Importation
import React, { useState,useEffect } from 'react';
import PagePrincipale from './PagePrincipale.jsx';
import CreateAccount from './CreateAccount.jsx';
import Loading from './Loading.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';
import GameRoom from './GameRoom.jsx';
import axios from 'axios';

//Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

//Gestion des pages affichés
function Page() {
  //Initialisation des états
  const [currentPage, setCurrentPage] = useState('login');
  // eslint-disable-next-line
  const [isConnected, setIsConnected] = useState(false);

  //Vérifier si une session est déjà ouvert ou pas
  async function checkSession() {
    try {
      //Récupérer le userid dans la session
      const response = await axios.get('http://localhost:4000/api/session');
      let userid = response.data.userid;

      if(userid){
        console.log(userid)
        setIsConnected(true);
        setCurrentPage('pagePrincipale');
      }else{
        setIsConnected(false);
        setCurrentPage('login');
      }
    } catch (error) {
        setIsConnected(false);
        setCurrentPage('login');
    }
  }

  //Effectuer les fonction async
  useEffect(() => {
    checkSession();
    //eslint-disable-next-line
  }, []);

  //Initialiser les pages
  const handlePagePrincipaleClick = () => {
    setCurrentPage('pagePrincipale');
  };

  const handleUserClick = () => {
    setCurrentPage('profile');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  }

  const handleGameRoomClick = () => {
    setCurrentPage('gameroom');
  }

  const handleCreateAccountClick = () => {
    setCurrentPage('createAccount')
  }

  return (
    //Affichage de la page selon la valeur du setCurrentPage
    <React.StrictMode>
      {currentPage === 'pagePrincipale' ? (
        <PagePrincipale onUserClick={handleUserClick} onLoginClick={handleLoginClick} setIsConnected={setIsConnected} setCurrentPage={setCurrentPage}/>
      ) : currentPage === 'profile' ? (
        <Profile onBackToPagePrincipaleClick={handlePagePrincipaleClick} onLoginClick={handleLoginClick}  setIsConnected={setIsConnected} setCurrentPage={setCurrentPage}/>
      ) : currentPage === 'login' ? (
        <Login onCreateAccountClick={handleCreateAccountClick} onPagePrincipaleClick={handlePagePrincipaleClick} setIsConnected={setIsConnected} setCurrentPage={setCurrentPage}/>
      ) : currentPage === 'createAccount' ? (
        <CreateAccount onLoginClick={handleLoginClick} onPagePrincipaleClick={handlePagePrincipaleClick} setCurrentPage={setCurrentPage}/>
      ) : currentPage === 'gameroom' ? (
        <GameRoom onBackToPagePrincipaleClick={handlePagePrincipaleClick} onLoginClick={handleGameRoomClick}  setIsConnected={setIsConnected} setCurrentPage={setCurrentPage}/>
      ) : (
        <Loading/>
      )}
    </React.StrictMode>
  )
}

export default Page;