import { useEffect, useState, useRef, useCallback } from "react";
import CustomSliderWithTooltip from './CustomSliderWithTooltip.jsx';
import axios from 'axios';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const GameRoom = ({ setCurrentPage}) => {  // <-- Ajout de setCurrentPage
    var storedRoom = localStorage.getItem("room");
    const [room, setRoom] = useState(storedRoom);
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);
    const [compte, setCompte] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);
    const [livesToPlay, setLivesToPlay] = useState(3); // Valeur par défaut modifiable
    const [gameTime, setGameTime] = useState(10);
    const [livesLostThreshold, setLivesLostThreshold] = useState(2);

    const [selectedAvatar, setSelectedAvatar] = useState(null)

    // Chemins des avatars (placer ces images dans public/images)
    const avatars = [
        '/images/avatar1.jpg',
        '/images/avatar2.jpg',
        '/images/avatar3.jpg',
        '/images/avatar4.jpg',
        '/images/avatar5.jpg',
        '/images/avatar6.jpg',
        '/images/avatar7.jpg',
        '/images/avatar8.jpg'
    ];

    const ws = useRef(null);
    const reconnectTimer = useRef(null);

    // Vérifier si une session est déjà ouverte
    const checkSession = async () => {
        try {
            const response = await axios.get('/api/session');
            const user = await axios.get('/api/users/detail');

            console.log("find the user according to the session id : ");
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
        if (isWebSocketOpen) return;
        
        ws.current = new WebSocket("ws://localhost:4002");

        ws.current.onopen = () => {
            console.log("WebSocket connecté !");
            setIsWebSocketOpen(true);

            console.log("storedRoom =", storedRoom);
            handleRoomLogic();
        };
        console.log("code de room ; ",room);
        
        // Gérer les messages du serveur WebSocket
        ws.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log('Message reçu:', message);

            if (message.type === 'generatedRoom') {
                localStorage.setItem("room", message.room);
                storedRoom = message.room;
                await setRoom(message.room);
                await setUsers(message.users);
                await joinRoom();
                fetchUsersInRoom();
            }
            
            if (message.type === 'users_list') {
                console.log('Utilisateurs mis à jour:', message.users);
                await setUsers(message.users);
                console.log(users);
            }

            if(message.type === 'ok') {
                fetchUsersInRoom();
            }

            else if (message.type === "error"){console.log("Erreur Interne");}

            if (message.type === 'game_started') {
               
                console.log("Le jeu a été lancé");
                setGameStarted(true);
                localStorage.setItem("users", JSON.stringify(users));
                setUsers([]);
                setCurrentPage({ page: 'gamepage', initialLives: livesToPlay, initialTime: gameTime, livesLostThreshold: livesLostThreshold });
            }
            
           
        };

        ws.current.onclose = (event) => {
            console.warn("⚠️ WebSocket fermé :", event);
            setIsWebSocketOpen(false);
            // Auto-reconnexion après 3 secondes
            setTimeout(() => {
                console.log("🔄 Tentative de reconnexion...");
                ws.current = new WebSocket("ws://localhost:4002");
            }, 3000);
        };

    }, [room, userid, isUserReady]);

                
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

        const currentRoom = localStorage.getItem("room");
        console.log("storedRoom =", storedRoom);
        if (!currentRoom) {
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
            setIsWebSocketOpen(false);
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
          //localStorage.removeItem("room");
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
    const joinRoom = async () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("Le joueur suivant rejoint la room:", userid," dans ", room);

            const message = {
                type: "join_room",
                room: room,
                user: userid,
            };
            ws.current.send(JSON.stringify(message));
            
        } else {
            console.warn("WebSocket n'est pas encore prêt, re-essai dans 500ms...");
            setTimeout(joinRoom, 500); // Réessaye après 500ms
        }
    };

    const fetchUsersInRoom = () => {
        console.log("fetching");
    
        const attemptFetch = () => {
            if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
                console.warn("WebSocket pas encore prêt, réessai dans 2 secondes...");
                setTimeout(attemptFetch, 2000); // Réessaye après 2 secondes
                return;
            }
    
            console.log(" Room avant envoi :", room);
            console.log("Stored Room avant envoi :", storedRoom);
            if (!storedRoom) {
                console.warn("La room est vide, impossible d'envoyer la requête.");
                return;
            }
    
            const message = { type: "get_users", room: storedRoom };
            ws.current.send(JSON.stringify(message));
        };
    
        // Démarre la première tentative
        attemptFetch();
    };

    const leaveRoom = () => {
        if (!isWebSocketOpen || !ws.current) {
          console.warn("WebSocket n'est pas ouvert, impossible de quitter la salle.");
          return;
        }
      
        //le joueur quitte la salle envoyé au serveur
        const message = {
          type: "leave_room",
          room: room,  
          user: userid,  
        };
        ws.current.send(JSON.stringify(message));
        console.log(`Le joueur ${userid} quitte la room ${room}`);
        
       // redirection
       fetchUsersInRoom();
        setCurrentPage("pagePrincipale");
        localStorage.removeItem("room");
      };
    
   // const showPlayer = () => {
    //    fetchUsersInRoom();
    //    console.log(users);
    //}

    // Démarrer le jeu
    const startGame = () => {
        console.log("Le bouton Démarrer a été cliqué ");
        ws.current.send(JSON.stringify({ type: "start_game", room:room,lives: livesToPlay, }));
        setGameStarted(true);
        // Passe livesToPlay comme prop en plus de changer de page
        console.log("users passe : " , users)
        localStorage.setItem("users", JSON.stringify(users));
        setUsers([]);
        localStorage.setItem("myUser", userid);
        setCurrentPage({ page: 'gamepage', initialLives: livesToPlay, initialTime: gameTime, livesLostThreshold: livesLostThreshold });
    };

    // Fonction pour sélectionner un avatar
    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar); // Met à jour l'état local
        localStorage.setItem('selectedAvatar', avatar); // Enregistre l'avatar dans localStorage
    };

    return (
        <div>
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="register-box text-center p-5 shadow-lg rounded" style={{ background: "linear-gradient(to top, #3B7088, #4FE9DE)", width: "400px" }}>
            <h2 className="mb-4 fw-bold text-white">Salle de Jeu</h2>

            {/* Nom de la salle */}
            <div className="game-room-salle mb-3 text-white">{room || "Chargement..."}</div>

            {/* Liste des utilisateurs */}
            <div className="text-start mb-4">
                <h4 className="text-white">Utilisateurs dans la room :</h4>
                <ul className="list-group">
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map((element, index) => {
                            const colors = ["#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#FFCC5C", "#D65076", "#45B8AC"];
                            const userColor = colors[index % colors.length];
                            return (
                                <li 
                                    key={element.id} 
                                    className="list-group-item" 
                                    style={{ backgroundColor: userColor, color: "white", border: "none" }}
                                >
                                    {element.id}
                                    {selectedAvatar && (
                                                <img 
                                                    src={selectedAvatar} 
                                                    alt="Avatar"
                                                    className="rounded-full ml-2"
                                                    style={{ width: "30px", height: "30px" }}
                                                />
                                            )}
                                </li>
                            );
                        })
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

            {/* Boutons */}
            <button className="custom-btn w-100 mb-3" onClick={startGame}>Démarrer le jeu</button>
            <button className="custom-btn w-100 mb-3" onClick={leaveRoom}>Quitter la salle</button>
            <button className="custom-btn w-100" onClick={addPlayer}>Ajouter un joueur</button>
        </div>
    </div>
</div>

    );
};

export default GameRoom;