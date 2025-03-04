import React, { useState, useEffect } from 'react';
import "./GamePage.css";

const GamePage = ({ setCurrentPage }) => {
  const [sequence, setSequence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lives, setLives] = useState(2);
  const [socket, setSocket] = useState(null); // WebSocket state
  const [gameOver, setGameOver] = useState(false); // Game over state

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

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (gameOver) return; // Empêcher d'envoyer une réponse si la partie est déjà finie

    try {
        const response = await fetch(`http://localhost:4001/verify-word?word=${inputValue}`);
        const data = await response.json();

        let newLives = lives;

        if (!data.valid) {
            newLives -= 1;
        } else if (!inputValue.includes(sequence)) {
            newLives -= 1;
        } else {
            generateSequence();
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
    </div>
  );
};

export default GamePage;
