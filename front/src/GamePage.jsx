import React, { useState, useEffect,useRef } from 'react';
import "./GamePage.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const axios = require("axios");
function removeAccents(str) {
  // Normalise la chaîne et enlève les diacritiques
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const GamePage = ({setCurrentPage, initialLives, initialTime, livesLostThreshold }) => {
  let storedUsers;
  try {
    storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    if (!Array.isArray(storedUsers)) {
      storedUsers = [];
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des utilisateurs depuis localStorage:", error);
    storedUsers = [];
  }
  const storedUID = localStorage.getItem("myUser");
  const [lives, setLives] = useState(
    storedUsers.map(user => ({ id: user.id, lives: initialLives }))
  );
  const [sequence, setSequence] = useState("");
  const [users, setUsers] = useState(storedUsers);
  const [inputValue, setInputValue] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(storedUsers.length > 0 ? storedUsers[0] : null);
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [timer, setTimer] = useState(initialTime);
  const [timerInterval, setTimerInterval] = useState(null); // Intervalle pour le timer
  const [lostLivesCount, setLostLivesCount] = useState(0);
  
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [blackenedLetters, setBlackenedLetters] = useState(new Set());
  const ws = useRef(null);
 
  const currentPlayerLives = lives.find(user => user.id === currentPlayer)?.lives || 0;
  // Connecter au WebSocket backend
  useEffect(() => {
  

    console.log("User ID disponible :", storedUID);

    ws.current = new WebSocket("ws://localhost:4002");
    ws.current.onopen = () => {
      console.log("WebSocket connecté !");
    };
    ws.current.onerror = (error) => {
      console.log("Erreur WebSocket :", error);
    };
    
    ws.current.onclose = (event) => {
      console.log("Connexion WebSocket fermée", event);
    };
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message reçu du serveur :", data);

      if (data.type === 'game_over') {
        //setGameOver(true);
        setCurrentPage("final");
        localStorage.setItem('winner',JSON.stringify(data.winner.id))
      }

      if (data.type === 'get_sequence') {
       setSequence(data.sequence)
      }

      if (data.type === 'get_inputValue') {
        setInputValue(data.value)
       }

      if (data.type === 'reset_timer') {
        //setGameOver(true);
        console.log("recu :",data.users, " Encodé ", JSON.stringify(data.users))
        setTimer(initialTime);
        
        localStorage.setItem('users',JSON.stringify(data.users));
        try {
          storedUsers = JSON.parse(localStorage.getItem('users')) || [];
          if (!Array.isArray(storedUsers)) {
            storedUsers = [];
          }
          setLives(
            storedUsers.map(user => ({ id: user.id, lives: user.lives }))
          );
          setUsers(storedUsers)
          setCurrentPlayer(data.newCurrentPlayer);
          console.log("théorie : ",data.newCurrentPlayer)
        } catch (error) {
          console.error("Erreur lors de la lecture des utilisateurs depuis localStorage:", error);
          storedUsers = [];
        }
        console.log("modif : ", storedUsers, "  - ", currentPlayer);
        
        
      }
    };

    return () => {
      
    };
  }, []);

  // Fonction pour récupérer une séquence depuis l'API
  const generateSequence = async () => {
    try {
      const response = await fetch("http://localhost:4001/random-sequence");
      const data = await response.json();
      setSequence(data.sequence);
      //On envoie la séquence pour les autres clients
      const message = {
        type: "sequence",
        seq: data.sequence,
      };
      ws.current.send(JSON.stringify(message));
    } catch (error) {
      console.error("Erreur lors de la récupération de la séquence :", error);
    }
  };

  useEffect(() => {
  //  if(currentPlayer?.id === storedUID) {
      console.log(currentPlayer?.id , "  === ", storedUID);
      generateSequence();
    //}
    
  }, [currentPlayer]);

  // Fonction pour gérer le timer
  useEffect(() => {
    if (gameOver) return;

    if (timer === 0) {
      // Réinitialiser le timer
      const message = {
        type: "lose_life",
        room: localStorage.getItem("room"),
        user: currentPlayer?.id,
      };
      console.log(JSON.stringify(message));
      ws.current.send(JSON.stringify(message));

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
  }, [timer, gameOver, initialTime,currentPlayer]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (gameOver) return; // Empêcher d'envoyer une réponse si la partie est déjà finie
  
    try {
      const response = await fetch(`http://localhost:4001/verify-word?word=${inputValue}`);
      const data = await response.json();
  
      if (data.valid && inputValue.includes(sequence)) {
        // Mot valide => on réinitialise le timer, on génère une nouvelle séquence, etc.
        const message = {
          type: "update_timer",
          room: localStorage.getItem("room"),
          user: currentPlayer?.id,
          iv: inputValue
        };
        ws.current.send(JSON.stringify(message));

        blackenLetters(inputValue);
      } else {
        console.log("Mot invalide. Réessayez !");
      }

      /**  Vérifier si on a perdu X vies au total (d’affilée ou non)
      if ((lostLivesCount + 1) % livesLostThreshold === 0) {
        // On change le bout de mot
        console.log(`On a perdu ${livesLostThreshold} vies, on change la séquence !`);
        generateSequence();

        // On remet le compteur à 0 (ou on le laisse continuer)
        setLostLivesCount(0);
      }**/
  
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
    <div className="game-and-users-container">
      {/* Conteneur pour les utilisateurs */}
      <div className="users-container">
        <h4 className="text-black">Utilisateurs dans la room :</h4>
        <ul className="list-group">
        {Array.isArray(users) && users.length > 0 ? (
          users.map((element, index) => {
            const colors = ["#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#FFCC5C", "#D65076", "#45B8AC"];
            const userColor = colors[index % colors.length];

            // Déterminer si l'utilisateur est mort
            const isDead = element.lives <= 0;

            return (
              <li
                key={element.id}
                className="list-group-item"
                style={{
                  backgroundColor: isDead ? "black" : userColor, // Fond noir si l'utilisateur est mort
                  color: "white",
                  border: "none",
                }}
              >
                {/* Nom d'utilisateur */}
                <div style={{ fontWeight: "bold" }}>
                  {element.id} {element.id === currentPlayer?.id && "⭐"}
                </div>

                {/* Affichage des vies ou du crâne de mort */}
                {isDead ? (
                  <div style={{ fontSize: "1.2em" }}>💀</div> // Crâne de mort si l'utilisateur est mort
                ) : (
                  <div>Vies : {element.lives}</div> // Afficher les vies si l'utilisateur est vivant
                )}
              </li>
            );
          })
        ) : (
          <li className="list-group-item text-muted">Aucun utilisateur pour l'instant</li>
        )}
        </ul>
      </div>
  
      {/* Conteneur pour le jeu */} 
      <div className="game-container">
        <h1>BombParty</h1>
 
          {/* Afficher le joueur actuel et ses vies */}
          <div className="current-player">

            {currentPlayer?.id} : {Array(currentPlayer?.lives).fill("❤️").join(" ")}

          </div>

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
            {letters.map((letter, index) => {
              const isBlackened = blackenedLetters.has(letter);
              return (
                <div
                  key={index}
                  className={`key ${isBlackened ? 'blackened' : ''}`}
                >
                  {letter}
                </div>
              );
            })}
          

        </div> <button onClick={handleReturn}>Retour</button>
        
  
       
        {gameOver && <div>Jeu terminé !</div>}
  
        {/* Afficher la bombe avec le timer */}
        <div className="bomb-container">
          <img src="/images/bomb-icon.png" alt="Bombe" className="bomb-icon" />
          <div className="timer">{timer}</div>
        </div>
        </div>
        <ToastContainer />
      </div>

  );
};

export default GamePage;