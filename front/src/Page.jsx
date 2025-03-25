//Importation
import React, { useState,useEffect } from 'react';
import PagePrincipale from './PagePrincipale.jsx';
import CreateAccount from './CreateAccount.jsx';
import Loading from './Loading.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';
import GameRoom from './GameRoom.jsx';
import GamePage from './GamePage.jsx';
import FinalPage from './FinalPage.jsx';
import axios from 'axios';

//Connexion avec le back
axios.defaults.baseURL = 'https://bombpartyy.duckdns.org';
axios.defaults.withCredentials = true;

//Gestion des pages affichés
function Page() {
  //Initialisation des états
  const [currentPage, setCurrentPage] = useState('loading');
  // eslint-disable-next-line
  const [isConnected, setIsConnected] = useState(false);

  //Vérifier si une session est déjà ouvert ou pas
  async function checkSession() {
    try {
      //Récupérer le userid dans la session
      const response = await axios.get('https://bombpartyy.duckdns.org/api/session');
      let userid = response.data.userid;

      if(userid){
        console.log(userid)
        setIsConnected(true);
        if (currentPage === 'profile'){
          setCurrentPage('profile');
        }
        else {
          setCurrentPage('pagePrincipale');
        }
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

  const handleGamePageClick = () => {
    setCurrentPage('gamepage');
  }

  const handleCreateAccountClick = () => {
    setCurrentPage('createAccount')
  }
  const handleFinalScreenClick = () => {
    setCurrentPage('final')
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
      ) : currentPage.page === 'gamepage' ? (
        <GamePage onBackToGameRoomClick={handleGameRoomClick} onGameRoomClick={handleGamePageClick} onFinalScreenClick={handleFinalScreenClick}  setIsConnected={setIsConnected} setCurrentPage={setCurrentPage} user={currentPage.users || []} initialLives={currentPage.initialLives || 2} initialTime={currentPage.initialTime || 10} livesLostThreshold={currentPage.livesLostThreshold || 2}/>
      ): currentPage === 'final' ? (
        <FinalPage setIsConnected={setIsConnected} setCurrentPage={setCurrentPage} />
      ) : (  
        <Loading/>
      )}    
    </React.StrictMode>
  )
}

export default Page;