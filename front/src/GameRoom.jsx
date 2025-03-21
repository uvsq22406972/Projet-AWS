import { useEffect, useState, useRef, useCallback } from "react";
import CustomSlider from './CustomSlider.jsx';
import CustomSliderWithTooltip from './CustomSliderWithTooltip.jsx';
import axios from 'axios';

const GameRoom = ({ setCurrentPage}) => {  // <-- Ajout de setCurrentPage
    const storedRoom = localStorage.getItem("room");
    const [room, setRoom] = useState(storedRoom);
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);
    const [compte, setCompte] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [livesToPlay, setLivesToPlay] = useState(3); // Valeur par défaut modifiable
    const [gameTime, setGameTime] = useState(10);
    const [livesLostThreshold, setLivesLostThreshold] = useState(2);

    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const isWebSocketOpen = useRef(false);
    // Vérifier si une session est déjà ouverte
    const checkSession = async () => {
        try {
            const response = await axios.get('/api/session');
            setUserid(response.data.userid);
            setIsUserReady(true);
        } catch (error) {
            console.log("Erreur, la session a expiré");
        }
    };

    async function fetchAccount() {
        try {
          const [response, sessionRes] = await Promise.all([
            axios.get('/api/users/all'),
            axios.get('/api/session')
          ]);
          
          const userid = sessionRes.data.userid;
          const account = response.data.find(a => a._id === userid);
          
          if (account) {
            setCompte(account);
            return true; // Retourne un statut de succès
          }
          return false;
        } catch (error) {
          console.error('Erreur:', error);
          return false;
        }
      }

    const connectWS = useCallback(() => {
        if (isWebSocketOpen.current) return;
        
        ws.current = new WebSocket("ws://localhost:4002");

        ws.current.onopen = () => {
            console.log("WebSocket connecté !");
            isWebSocketOpen.current = true;

            console.log("storedRoom =", storedRoom);
            handleRoomLogic();
        };
        console.log("code de room ; ",room);
        
        // Gérer les messages du serveur WebSocket
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message reçu:', message);

            if (message.type === 'generatedRoom') {
                localStorage.setItem("room", message.room);
                setRoom(message.room);
                setUsers(message.users);
            }

            if (message.type === 'users_list') {
                console.log('Utilisateurs mis à jour:', message.users);
                setUsers(message.users);
            }
            else if (message.type === "error"){console.log("oula");}
        };

        ws.current.onclose = (e) => {
            console.warn("⚠️ WS fermé :", e.code, e.reason);
            isWebSocketOpen.current = false;
      
            //Reconnexion auto après 3s
            reconnectTimer.current = setTimeout(() => {
              console.log("🔄 Tentative de reconnexion...");
              connectWS();
            }, 3000);
        };
    }, []);

    const safeSend = useCallback((message, retries = 3) => {
        return new Promise((resolve, reject) => {
            const attempt = (attemptCount) => {
                if (ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify(message));
                    resolve();
                } else if (attemptCount < retries) {
                    setTimeout(() => attempt(attemptCount + 1), 300 * attemptCount);
                } else {
                    reject("Échec d'envoi après " + retries + " tentatives");
                }
            };
            attempt(0);
        });
    }, []);

    const handleRoomLogic = async () => {
        if (!compte?.username || !isWebSocketOpen) return;

        console.log("storedRoom =", storedRoom);
        if (!storedRoom) {
            await createRoom();
        } else {
            await joinRoom();
        }
    };

    useEffect(() => {
        const initialize = async () => {
            await checkSession();
            await fetchAccount(); // Attend que les données du compte soient chargées
            connectWS();
          };
          
        initialize();

    
        // Cleanup
        return () => {
            if (ws.current) ws.current.close();
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            isWebSocketOpen.current = false;
        };
    }, []);

    useEffect(() => {
        if (compte?.username && isWebSocketOpen) {
            handleRoomLogic();
        }
    }, [compte, isWebSocketOpen]); // Déclenché quand compte ou WS change

    useEffect(() => {
        return () => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.close(1000, "Navigation normale");
          }
          localStorage.removeItem("room");
        };
    }, []);

    // Créer une room
    const createRoom = useCallback(async () => {
        if (isCreatingRoom) return;
        setIsCreatingRoom(true);
        try {
            await safeSend({
                type: "create_room",
                user: compte.username
            }, 5); // 🎯 5 tentatives max
        } catch (error) {
            console.error("Échec critique création room:", error);
            alert("Problème de connexion - Veuillez rafraîchir");
        } finally {
            setIsCreatingRoom(false);
        }
    }, [compte.username, safeSend, isCreatingRoom]);

// pour ajouter un joueur au jeu
    const addPlayer = () => {
        if (!isWebSocketOpen) {
            console.warn("WebSocket pas encore prêt, impossible de démarrer le jeu.");
            return;
        }
        const randomUsername = 'Player-' + Math.random().toString(36).substring(2, 8);
        console.log("Ajout du joueur:", randomUsername);

        const message = {
            type: "join_room",
            room,
            user: randomUsername,
        };
        ws.current.send(JSON.stringify(message));

        
        fetchUsersInRoom();
        
    };

    // pour rejoindre une room
    const joinRoom = () => {
        if (!isWebSocketOpen) {
            console.warn("WebSocket pas encore prêt, impossible de démarrer le jeu.");
            return;
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("Ajout du joueur:", userid);

            const message = {
                type: "join_room",
                room: storedRoom,
                user: compte.username,
            };
            ws.current.send(JSON.stringify(message));

            setTimeout(() => {
                fetchUsersInRoom();
            }, 200);
        } else {
            console.warn("WebSocket n'est pas encore prêt, re-essai dans 500ms...");
            setTimeout(joinRoom, 500); // Réessaye après 500ms
        }
    };

    // Récupérer les utilisateurs dans la room
    const fetchUsersInRoom = () => {
        console.log("fetching");
        if (!isWebSocketOpen) {
            console.warn("WebSocket pas encore prêt, impossible de démarrer le jeu.");
            return;
        }

        console.log("Stored Room avant envoi :", storedRoom);
        if (!storedRoom) {
            console.warn("La room est vide, impossible d'envoyer la requête.");
            return;
        }
   
        const message = { type: "get_users", room: room };
        ws.current.send(JSON.stringify(message));
        

        
    };

    const leaveRoom = () => {
        // Envoyer la requête "leave_room" au serveur
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: "leave_room",
            room: storedRoom,
            user: compte.username
          }));
        }
      
        // Reset complet avec callback
        setRoom(prev => {
          localStorage.removeItem("room");
          return null;
        });
        
        setUsers([]);
        setCurrentPage("pagePrincipale");
    };
    
    const showPlayer = () => {
        fetchUsersInRoom();
        console.log(users);
    }

    // Démarrer le jeu
    const startGame = () => {
        console.log("Le bouton Démarrer a été cliqué ");
        ws.current.send(JSON.stringify({ type: "start_game", room }));
        setGameStarted(true);
        // Passe livesToPlay comme prop en plus de changer de page
        setCurrentPage({ page: 'gamepage', initialLives: livesToPlay, initialTime: gameTime, livesLostThreshold: livesLostThreshold });
    };

    return (
        <div>
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="container d-flex justify-content-center align-items-center">
                <div className="register-box text-center p-5 shadow-lg rounded" style={{ background: "linear-gradient(to top, #3B7088, #4FE9DE)" }}>
                    <h2 className="mb-4 fw-bold text-white">Salle de Jeu</h2>

                    {/* Nom de la salle */}
                    <div className="game-room-salle">
                        {room || "Chargement..."}
                    </div>

                    {/* Liste des utilisateurs */}
                    <div className="text-start mb-4">
                        <h4 className="text-white">Utilisateurs dans la room :</h4>
                        <ul className="list-group">
                        {Array.isArray(users) && users.length > 0 ? (
                            users.map(element => (
                            <li key={element} className="list-group-item">
                                {element}
                            </li>
                            ))
                        ) : (
                            <li className="list-group-item text-muted">Aucun utilisateur pour l'instant</li>
                        )}
                        </ul>
                    </div>

                    {/* Nb de vies */}
                    <div style={{ margin: '20px 0' }}>
                      <label htmlFor="livesSlider">
                        Nombre de vies : <strong>{livesToPlay}</strong>
                      </label>
                      <CustomSliderWithTooltip
                        value={livesToPlay}
                        onChange={setLivesToPlay}
                        min={1}
                        max={5}
                      />
                    </div>

                    {/* Choix du temps de jeu */}
                    <div style={{ margin: '20px 0' }}>
                        <label htmlFor="timeSlider">
                          Temps de jeu : <strong>{gameTime} secondes</strong>
                        </label>
                        <CustomSliderWithTooltip
                          value={gameTime}
                          onChange={setGameTime}
                          min={5}
                          max={15}
                        />
                    </div>

                    {/* Choix de changement de séquence */}
                    <div style={{ margin: '20px 0' }}>
                      <label htmlFor="changeSequenceSlider">
                        Changer la séquence : <strong>{livesLostThreshold}</strong> vies perdues
                      </label>
                      <CustomSliderWithTooltip
                        value={livesLostThreshold}
                        onChange={setLivesLostThreshold}
                        min={1}
                        max={5}
                      />
                    </div>

                    {/* Bouton démarrer */}
                    <button className="custom-btn w-100" onClick={startGame}>
                        Démarrer le jeu
                    </button>
                    <button className="custom-btn w-100 mt-3" onClick={leaveRoom}>
                        Quitter la salle
                    </button>

                </div>
            </div>

            {/* Bouton ajouter un joueur */}
            <button className="custom-btn w-100 mt-3" onClick={addPlayer}>
                Ajouter un joueur
            </button>

             {/* Bouton afficher les jouers */}
             <button className="custom-btn w-100 mt-3" onClick={showPlayer}>
                Show joueurs
            </button>
        </div>
    </div>
    );
};

export default GameRoom;
