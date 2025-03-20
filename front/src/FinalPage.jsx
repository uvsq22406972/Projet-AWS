import React from 'react';

const FinalPage = ({ setCurrentPage }) => {
  let winner = JSON.parse(localStorage.getItem('winner'));
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

        {/* Bouton pour retourner au lobby */}
        <button
          className="custom-btn w-100 mb-3"
          onClick={() => {
            localStorage.removeItem('winner');
            setCurrentPage('gameroom')
          }} // Redirige vers la page du lobby
        >
          Retour au Lobby
        </button>

        {/* Bouton pour quitter la partie */}
        <button
          className="custom-btn w-100"
          onClick={() => {
                        setCurrentPage('pagePrincipale');
                        localStorage.removeItem("room");
                        localStorage.removeItem('winner');}} // Redirige vers la page principale
        >
          Quitter la Partie
        </button>
      </div>
    </div>
  );
};

export default FinalPage;