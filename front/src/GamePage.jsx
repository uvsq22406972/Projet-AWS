import React, { useState, useEffect } from 'react';
import "./GamePage.css";

const GamePage = ({ setCurrentPage }) => {
  const [sequence, setSequence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(2);
  const [socket, setSocket] = useState(null); // WebSocket state
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [timer, setTimer] = useState(10); // Timer initialisé à 10 secondes
  const [timerInterval, setTimerInterval] = useState(null); // Intervalle pour le timer

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Connecter au WebSocket backend
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4002");
    setSocket(ws);
    
    ws.onopen = () => {
      console.log("WebSocket connecté !");
    };
    
    ws.onerror = (error) => {
      console.log("Erreur WebSocket :", error);
    };
    
    ws.onclose = (event) => {
      console.log("Connexion WebSocket fermée", event);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message reçu du serveur :", data);

      if (data.type === 'game_over') {
        setGameOver(true);
        alert("Le jeu est terminé!");
      }

      if (data.type === 'update_lives') {
        setLives(data.lives);
      }
    };

    return () => {
      ws.close(); // Fermer la connexion lors de la fermeture du composant
    };
  }, []);

  // Fonction pour récupérer une séquence depuis l'API
  const generateSequence = async () => {
    try {
      const response = await fetch("http://localhost:4001/random-sequence");
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
      // Lorsque le timer atteint 0, on perd une vie et on réinitialise le timer
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives <= 0) {
          setGameOver(true);
          alert("Le jeu est terminé !");
        }
        return newLives;
      });
      
      // Réinitialiser le timer
      setTimer(10);
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
  }, [timer, gameOver]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (gameOver) return; // Empêcher d'envoyer une réponse si la partie est déjà finie
  
    try {
      const response = await fetch(`http://localhost:4001/verify-word?word=${inputValue}`);
      const data = await response.json();
  
      let newLives = lives;
  
      if (!data.valid || !inputValue.includes(sequence)) {
        newLives -= 1;
      } else {
        generateSequence();
        setTimer(10); // Réinitialisation du timer lorsque le mot est correct
      }
  
      setLives(newLives);
  
      if (newLives <= 0) {
        setGameOver(true);
        socket.send(JSON.stringify({ type: 'game_over' }));
        alert("Fin de la partie !");
      } else {
        socket.send(JSON.stringify({
          type: 'update_lives',
          lives: newLives,
        }));
      }
  
      setInputValue("");
    } catch (error) {
      console.error("Erreur lors de la vérification du mot :", error);
    }
  };  
  
  const handleReturn = () => {
    setCurrentPage('gameroom');
  };

  return (
    <div className="game-container">
      <h1>BombParty</h1>
      <div className="lives">{Array(lives).fill("❤️").join(" ")}</div>
      <div className="sequence">{sequence}</div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Entrez un mot contenant la séquence..."
        disabled={gameOver}
      />
      <button onClick={handleSubmit} disabled={gameOver || !inputValue}>
        Valider
      </button>
      <div className="keyboard">
        {letters.map((letter, index) => (
          <div key={index} className="key">{letter}</div>
        ))}
      </div>
      <button onClick={handleReturn}>Retour</button>
      {gameOver && <div>Jeu terminé !</div>}

      {/* Afficher la bombe avec le timer */}
      <div className="bomb-container">
        <img src="/images/bomb-icon.png" alt="Bombe" className="bomb-icon" />
        <div className="timer">{timer}</div>
      </div>
    </div>
  );
};

export default GamePage;