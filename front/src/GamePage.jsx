import React, { useState, useEffect } from 'react';
import "./GamePage.css";

function removeAccents(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const GamePage = ({ setCurrentPage, initialLives, initialTime, livesLostThreshold, keyboardColor }) => {
  const [sequence, setSequence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(initialLives);
  const [socket, setSocket] = useState(null);// WebSocket state
  const [gameOver, setGameOver] = useState(false);// Game over state
  const [timer, setTimer] = useState(initialTime);
  const [timerInterval, setTimerInterval] = useState(null); // Intervalle pour le timer
  const [lostLivesCount, setLostLivesCount] = useState(0);
  const [currentKeyboardColor, setCurrentKeyboardColor] = useState(localStorage.getItem("keyboardColor") || keyboardColor);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [blackenedLetters, setBlackenedLetters] = useState(new Set());

  useEffect(() => {
    const savedColor = localStorage.getItem("keyboardColor");
    if (savedColor) {
      setCurrentKeyboardColor(savedColor);
    }
  }, []);
  
    // Connecter au WebSocket backend
  useEffect(() => {
    const ws = new WebSocket("wss://bombpartyy.duckdns.org/ws/");
    setSocket(ws);

    ws.onopen = () => console.log("WebSocket connecté !");
    ws.onerror = (error) => console.log("Erreur WebSocket :", error);
    ws.onclose = (event) => console.log("Connexion WebSocket fermée", event);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_over') setGameOver(true);
      if (data.type === 'update_lives') setLives(data.lives);
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const countdownInterval = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(countdownInterval);
    } else {
      setGameStarted(true);
    }
  }, [countdown]);

  function loseLife() {
    // Réduire le nombre de vies
    setLives(prevLives => {
      const newLives = prevLives - 1;

       // Gérer la fin de partie
      if (newLives <= 0) {
        setGameOver(true);
        socket.send(JSON.stringify({ type: 'game_over' }));
      } else {
        // Mettre à jour le serveur
        socket.send(JSON.stringify({ type: 'update_lives', lives: newLives }));
      }
      return newLives;
    });
    // Incrémenter le compteur de vies perdues
    setLostLivesCount((prevCount) => {
      const updatedCount = prevCount + 1;
  
      // Vérifier si on atteint le seuil
      if (updatedCount === livesLostThreshold) {
        generateSequence();     // Changer la séquence
        return 0;              // Réinitialiser le compteur si vous voulez recommencer à 0
        // return updatedCount; // ou laissez-le si vous ne voulez le faire qu'une seule fois
      }
  
      return updatedCount;
    });
  }
   // Fonction pour récupérer une séquence depuis l'API
  const generateSequence = async () => {
    try {
      const response = await fetch("https://bombpartyy.duckdns.org/random-sequence");
      const data = await response.json();
      setSequence(data.sequence);
    } catch (error) {
      console.error("Erreur lors de la récupération de la séquence :", error);
    }
  };

  useEffect(() => {
    generateSequence();
  }, []);

  // Fonction pour gérer le timer
  useEffect(() => {
    if (gameOver) return;

    if (timer === 0) {
      loseLife();
      // Réinitialiser le timer
      setTimer(initialTime);
    }

    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) return prevTimer - 1;
        return 0;
      });
    }, 1000);

    setTimerInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [timer, gameOver, initialTime]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (gameOver) return; // Empêcher d'envoyer une réponse si la partie est déjà finie
  
    try {
      const response = await fetch(`https://bombpartyy.duckdns.org/verify-word?word=${inputValue}`);
      const data = await response.json();
  
      let newLives = lives;
  
      if (data.valid && inputValue.includes(sequence)) {
        // Mot valide => on réinitialise le timer, on génère une nouvelle séquence, etc.
        generateSequence();
        setTimer(initialTime);
        blackenLetters(inputValue);
      } else {
        console.log("Mot invalide. Réessayez !");
      }
  
      setLives(newLives);

      // Vérifier si on a perdu X vies au total (d’affilée ou non)
      if ((lostLivesCount + 1) % livesLostThreshold === 0) {
        // On change le bout de mot
        console.log(`On a perdu ${livesLostThreshold} vies, on change la séquence !`);
        generateSequence();

        // On remet le compteur à 0 (ou on le laisse continuer, selon votre logique)
        setLostLivesCount(0);
      }
  
      setInputValue("");
    } catch (error) {
      console.error("Erreur lors de la vérification du mot :", error);
    }
  };  
  
  const handleReturn = () => {
    setCurrentPage('gameroom');
  };

  function blackenLetters(word) {
    // Supprimer les accents, mettre en majuscule
    const normalized = removeAccents(word).toUpperCase();
    // On fait une copie du Set actuel
    const updatedSet = new Set(blackenedLetters);

    for (const char of normalized) {
      if (letters.includes(char)) {
        updatedSet.add(char);
      }
    }

    // Vérifier si TOUTES les lettres (A-Z) sont noircies
    if (updatedSet.size === letters.length) {
      // Réinitialiser le Set et ajouter 1 vie
      updatedSet.clear();
      setLives((prev) => prev + 1);
    }

    // Mettre à jour l'état
    setBlackenedLetters(updatedSet);
  }

  return (
    <div className="game-container">
      {countdown > 0 ? (
        <div className="countdown">Début dans {countdown}...</div>
      ) : (
        <>
          <h1>BombParty</h1>
          <div className="lives">{Array(lives).fill("❤️").join(" ")}</div>
          <div className="sequence">{sequence}</div>
          <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Entrez un mot contenant la séquence..." disabled={gameOver} />
          <button onClick={handleSubmit} disabled={gameOver || !inputValue}>Valider</button>
          <div className="bomb-container">
            <img src="/images/bomb-icon.png" alt="Bombe" className="bomb-icon" />
            <div className="timer">{timer}</div>
          </div>
          <div className="keyboard">
            {letters.map((letter, index) => (
              <div
                key={index}
                className={`key ${blackenedLetters.has(letter) ? 'blackened' : ''}`}
                style={{
                  backgroundColor: blackenedLetters.has(letter) ? "gray" : currentKeyboardColor,
                  color: blackenedLetters.has(letter) ? "white" : "black",
                  padding: '10px',
                  borderRadius: '5px',
                  margin: '5px',
                  display: 'inline-block',
                  width: '40px',
                  textAlign: 'center',
                  cursor: blackenedLetters.has(letter) ? "not-allowed" : "pointer"
                }}
              >
                {letter}
              </div>              
            ))}
          </div>
          <button onClick={handleReturn}>Retour</button>
          {gameOver && <div>Jeu terminé !</div>}
        </>
      )}
    </div>
    
  );
};

export default GamePage;
