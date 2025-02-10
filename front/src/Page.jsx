import React, { useState } from 'react';
import PagePrincipale from './PagePrincipale.jsx'
import User from './User.jsx'
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function Page() {
  const [currentPage, setCurrentPage] = useState('pagePrincipale');

  const handlePagePrincipaleClick = () => {
    setCurrentPage('pagePrincipale');
  };

  const handleUserClick = () => {
    setCurrentPage('user');
  };



  return (
      <React.StrictMode>
        {currentPage === 'pagePrincipale' ? (
          <PagePrincipale onUserClick={handleUserClick} setCurrentPage={setCurrentPage}/>
        ) : (
          <User onBackToPagePrincipaleClick={handlePagePrincipaleClick} setCurrentPage={setCurrentPage}/>
        )}
      </React.StrictMode>
  )
}

export default Page;