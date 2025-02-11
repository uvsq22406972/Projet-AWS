import React, { useState } from 'react';
import PagePrincipale from './PagePrincipale.jsx';
import CreateAccount from './CreateAccount.jsx';
import Loading from './Loading.jsx';
import Login from './Login.jsx';
import User from './User.jsx';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function Page() {
  const [currentPage, setCurrentPage] = useState('createAccount');

  const handlePagePrincipaleClick = () => {
    setCurrentPage('pagePrincipale');
  };

  const handleUserClick = () => {
    setCurrentPage('user');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  }

  const handleCreateAccountClick = () => {
    setCurrentPage('createAccount')
  }



  return (
      <React.StrictMode>
        {currentPage === 'pagePrincipale' ? (
          <PagePrincipale onUserClick={handleUserClick} onLoginClick={handleLoginClick} setCurrentPage={setCurrentPage}/>
        ) : currentPage === 'user' ? (
          <User onBackToPagePrincipaleClick={handlePagePrincipaleClick} onLoginClick={handleLoginClick} setCurrentPage={setCurrentPage}/>
        ) : currentPage === 'login' ? (
          <Login onCreateAccountClick={handleCreateAccountClick} onPagePrincipaleClick={handlePagePrincipaleClick} setCurrentPage={setCurrentPage}/>
        ) : currentPage === 'createAccount' ? (
          <CreateAccount onLoginClick={handleLoginClick} onPagePrincipaleClick={handlePagePrincipaleClick} setCurrentPage={setCurrentPage}/>
        ) : (
          <Loading/>
        )}
      </React.StrictMode>
  )
}

export default Page;