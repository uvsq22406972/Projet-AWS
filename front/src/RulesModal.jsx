// RulesModal.jsx
import React, { useState } from 'react';

const RulesModal = ({ onClose }) => {
  const slides = [
    {
      title: "But du jeu",
      content: (
        <p>
          Chaque joueur doit trouver, dans un temps limité, un mot contenant une séquence de lettres proposée au début de chaque tour.
        </p>
      ),
    },
    {
      title: "Déroulement d’un tour",
      content: (
        <ul>
          <li>Une séquence de lettres est affichée.</li>
          <li>Le joueur dont c’est le tour doit proposer un mot valide contenant cette séquence avant l’explosion de la bombe.</li>
          <li>Si le mot est correct, le tour passe au joueur suivant et une nouvelle séquence est générée.</li>
          <li>Si le joueur ne trouve pas de mot ou propose un mot invalide, il perd une vie.</li>
        </ul>
      ),
    },
    {
      title: "Vies et élimination",
      content: (
        <p>
          Chaque joueur commence avec X vies. Lorsqu’un joueur perd toutes ses vies, il est éliminé. Le dernier joueur encore en lice est déclaré vainqueur.
        </p>
      ),
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="rules-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000,
    }}>
      <div className="rules-modal-content" style={{
        background: 'white', width: '80%', maxWidth: '500px', padding: '20px',
        borderRadius: '8px', position: 'relative',
      }}>
        {/* Bouton pour fermer */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '10px', right: '10px', border: 'none',
            background: 'transparent', fontSize: '18px', cursor: 'pointer' ,color: 'black'
          }}>
          X
        </button>

        <h2>{slides[currentSlide].title}</h2>
        <div>{slides[currentSlide].content}</div>

        <div style={{
          marginTop: '20px', display: 'flex', justifyContent: 'space-between'
        }}>
          <button onClick={prevSlide} disabled={currentSlide === 0}>
            ← Précédent
          </button>
          <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
            Suivant →
          </button>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button disabled={currentSlide !== slides.length - 1} onClick={onClose}>
            J'ai compris !
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;