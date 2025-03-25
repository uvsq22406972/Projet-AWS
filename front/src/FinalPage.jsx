import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinalPage = ({ setCurrentPage }) => {
  let winner = JSON.parse(localStorage.getItem('winner'));
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  const handleQuit = async () => {
    try {
      const room = localStorage.getItem("room");
      const user = localStorage.getItem("myUserrr"); // ou "myUser" selon votre code
  
      // Si on a bien room + user, on appelle l'API pour retirer l'utilisateur
      if (room && user) {
        await axios.post('/api/removeUserFromRoom', { 
          room, 
          user 
        });
      }
    } catch (error) {
      console.error("Erreur lors du removeUserFromRoom:", error);
    } finally {
      // Quoi qu'il arrive, on nettoie le localStorage et on revient
      localStorage.removeItem("room");
      localStorage.removeItem("winner");
      setCurrentPage("pagePrincipale");
    }
  };  

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer); //On arrete le TImer
          handleQuit();
          return 0;
        }
        return prevSeconds - 1; 
      });
    }, 1000); 
    return () => clearInterval(timer);
  }, [setCurrentPage]);


  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="register-box text-center p-5 shadow-lg rounded" style={{ background: "linear-gradient(to top, #3B7088, #4FE9DE)", width: "400px" }}>
        <h2 className="mb-4 fw-bold text-white">Fin de la Partie</h2>

        {/* Affichage du gagnant */}
        <div className="text-center mb-4">
          <h4 className="text-white">Le gagnant est :</h4>
          <div className="winner-name text-white" style={{ fontSize: "24px", fontWeight: "bold", marginTop: "20px" }}>
              {winner ||"Aucun gagnant"} {/* Affiche "Aucun gagnant" si winner n'est pas défini */}
          </div>
        </div>

        {/* affichage our le compteur */}
        
        <div className="text-center mb-4">
          <h4 className="text-white">Redirection Automatique dans:</h4>
          <div className="text-white" style={{ fontSize: "24px", fontWeight: "bold", marginTop: "20px" }}>
            {secondsRemaining} secondes
          </div>
        </div>

        {/* Bouton pour quitter la partie */}
        <button
          className="custom-btn w-100"
          onClick={handleQuit} // Redirige vers la page principale
        >
          Quitter la Partie
        </button>
      </div>
    </div>
  );
};

export default FinalPage;