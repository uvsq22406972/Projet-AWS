import { useEffect, useState, useRef, useCallback } from "react";
import "./GameRoom.css"
import { FaUsers, FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import CustomSliderWithTooltip from './CustomSliderWithTooltip.jsx';
import axios from 'axios';
import RulesModal from './RulesModal';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const GameRoom = ({ setCurrentPage}) => {  // <-- Ajout de setCurrentPage
    const storedRoom = localStorage.getItem("room");
    const [room, setRoom] = useState(storedRoom);
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);
    const [compte, setCompte] = useState([]);
    const [avatars, setAvatars] = useState({});
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [publicRooms, setPublicRooms] = useState([]);
    const [livesToPlay, setLivesToPlay] = useState(3); // Valeur par défaut modifiable
    const [gameTime, setGameTime] = useState(10);
    const [livesLostThreshold, setLivesLostThreshold] = useState(2);
    const [showRulesModal, setShowRulesModal] = useState(false);

    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const isWebSocketOpen = useRef(false);

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
            localStorage.setItem("myUserrr", account.username);
            console.log("myUser in localStorage =", localStorage.getItem("myUserrr"));
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
        
        ws.current = new WebSocket("wss://bombpartyy.duckdns.org/ws/");

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
          const localRoom = localStorage.getItem("room");
          const sameRoom = (message.room === localRoom);

          if (message.type === 'generatedRoom') {
              localStorage.setItem("room", message.room);
              
              setRoom(message.room);
              setUsers(Array.isArray(message.users) ? message.users : []); 
          }
          if (message.type === 'users_list') {
              if (!sameRoom) {
                console.log("Ignoring users_list for a different room:", message.room);
                return;
              }
              setUsers(Array.isArray(message.users) ? message.users : []);
              console.log('Utilisateurs mis à jour:', message.users);
          }
          if (message.type === 'joined_room_ok') {
            if (!sameRoom) {
              console.log("Ignoring users_list for a different room:", message.room);
              return;
            }
            localStorage.setItem("room", message.room);
            setRoom(message.room);
            fetchUsersInRoom(message.room); 
          }
          if (message.type === 'options_updated') {
            if (!sameRoom) {
              console.log("Ignoring options_updated for a different room:", message.room);
              return;
            }
            setLivesToPlay(message.lives);
            setGameTime(message.time);
            setLivesLostThreshold(message.threshold);
          }
          if (message.type === "game_started") {
            if (!sameRoom) {
              console.log("Ignoring users_list for a different room:", message.room);
              return;
            }
            localStorage.setItem('users', JSON.stringify(message.users));
            setCurrentPage({ 
              page: 'gamepage', 
              initialLives: livesToPlay, 
              initialTime: gameTime,
              livesLostThreshold
            });
            return;
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

    // Pour gérer le changement du slider "livesToPlay"
    const handleLivesChange = (val) => {
      setLivesToPlay(val);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "update_options",
          room,
          lives: val,
          time: gameTime,
          threshold: livesLostThreshold
        }));
      }
    }   

    // Pour gérer le changement du slider "gameTime"
    const handleTimeChange = (val) => {
      setGameTime(val);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "update_options",
          room,
          lives: livesToPlay,
          time: val,
          threshold: livesLostThreshold
        }));
      }
    }   

    // Pour gérer le changement du slider "livesLostThreshold"
    const handleThresholdChange = (val) => {
      setLivesLostThreshold(val);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "update_options",
          room,
          lives: livesToPlay,
          time: gameTime,
          threshold: val
        }));
      }
    };

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
          //localStorage.removeItem("room");
        };
    }, []);

    useEffect(() => {
      const fetchAvatars = async () => {
          if (!Array.isArray(users)) { // ✅ Vérification cruciale
            console.error("Erreur : 'users' n'est pas un tableau", users);
            return;
          }
          const newAvatars = {};
          
          await Promise.all(users.map(async (user) => {
            const username = user.id;
              try {
                  const response = await axios.get('/api/get-avatar-by-username', {
                      params: { username: username.trim() } // Normaliser le nom
                  });
                  if (response.data?.avatar) {
                      newAvatars[username] = response.data.avatar;
                  }
              } catch (error) {
                  newAvatars[username] = "";
              }
          }));
          
          setAvatars(prev => ({ ...prev, ...newAvatars }));
      };
  
      if (users.length > 0) fetchAvatars();
  }, [users]);
    
    
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


    // pour rejoindre une room
    const joinRoom = () => {
        if (!isWebSocketOpen) {
            console.warn("WebSocket pas encore prêt, impossible de démarrer le jeu.");
            return;
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            console.log("Ajout du joueur:", compte.username);

            const message = {
                type: "join_room",
                room: storedRoom,
                user: compte.username,
            };
            ws.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket n'est pas encore prêt, re-essai dans 500ms...");
            setTimeout(joinRoom, 500); // Réessaye après 500ms
        }
    };

    const fetchUsersInRoom = (theRoom) => {
      console.log("fetching");
      if (!isWebSocketOpen.current) {
        console.warn("WebSocket pas encore prêt, impossible de récupérer la liste.");
        return;
      }
      // Soit vous utilisez 'theRoom' s'il est fourni, sinon l'état 'room'
      const targetRoom = theRoom || room;
    
      console.log("Room avant envoi :", targetRoom);
      if (!targetRoom) {
        console.warn("La room est vide, impossible d'envoyer la requête.");
        return;
      }
      const message = { type: "get_users", room: targetRoom };
      ws.current.send(JSON.stringify(message));
    };

    useEffect(() => {
      if (room && isWebSocketOpen.current) {
        fetchUsersInRoom(room);
      }
    }, [room]);
    

    const leaveRoom = () => {
        // Envoyer la requête "leave_room" au serveur
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: "leave_room",
            room,
            user: compte.username
          }));
        }
      
        // Reset complet avec callback
        localStorage.removeItem("room");
        
        setUsers([]);
        setCurrentPage("pagePrincipale");
    };
    
   // const showPlayer = () => {
    //    fetchUsersInRoom();
    //    console.log(users);
    //}

    // Démarrer le jeu
    const startGame = () => {
      if (users.length < 2) {
        alert("Il faut au moins deux joueurs pour démarrer le jeu !");
        return;
      }
      console.log("Le bouton Démarrer a été cliqué ");
      ws.current.send(JSON.stringify({
        type: "start_game",
        room,
        lives: livesToPlay,
        time: gameTime,
        threshold: livesLostThreshold
      }));
      setGameStarted(true);
  };

    return (
      <div className="game-room-container">
      {/* HEADER */}
      <header className="game-room-header" style={{marginTop:"20px"}}>
        <h2>Salle de Jeu</h2>
        <p className="room-name">{room || "Chargement..."}</p>
      </header>
    
      {/* CORPS (deux colonnes) */}
      <div className="game-room-body">
        <div className="game-room-left">
          <h5 className="text-center text-black">Utilisateurs dans la room</h5>
          <div className="d-flex align-items-center justify-content-center text-muted" style={{ minWidth: "100px" }}>
            <FaUsers className="me-1" size={18} />
            {users.length} joueur{users.length > 1 ? 's' : ''}
          </div>
          <ul className="list-group" style={{
            maxHeight: '180px',
            overflowY: 'auto',
            margin: "20px",
            padding: "10px",
            background: "white",
          }}>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user, index) => {
                const username = user.id;
                const colors = ["#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#FFCC5C", "#D65076", "#45B8AC"];
                const userColor = colors[index % colors.length];
                return (
                  <li 
                    key={username} 
                    className="list-group-item" 
                    style={{ backgroundColor: userColor, color: "white", border: "none", width: "80%", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    {avatars[username] ? (
                      <img 
                        src={avatars[username]} 
                        alt="avatar" 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px', backgroundColor:'rgba(255, 255, 255, 0.9)', border:"2px solid black" }}
                      />
                    ) : (
                      <FaUserCircle 
                        style={{
                          width: '50px',
                          height: '50px',
                          color: 'white',
                          marginRight: '10px',
                        }}
                      />
                    )}
                    <span>{username}</span>
                  </li>
                );
              })
            ) : (
              <li className="list-group-item text-muted">Aucun utilisateur pour l'instant</li>
            )}
          </ul>
        </div>
        <div className="game-room-right">
          <h5 className="text-center text-black">Options de jeu</h5>
          <div className="slider-block">
            <label>Nombre de vies : {livesToPlay}</label>
            <CustomSliderWithTooltip
              value={livesToPlay}
              onChange={handleLivesChange}
              min={1}
              max={5}
            />
          </div>
          <div className="slider-block">
            <label>Temps de jeu : {gameTime} secondes</label>
            <CustomSliderWithTooltip
              value={gameTime}
              onChange={handleTimeChange}
              min={5}
              max={15}
            />
          </div>
        </div>
      </div>
    
      {/* FOOTER (boutons) */}
      <footer className="game-room-footer">
        <button onClick={startGame} disabled={users.length < 2}>Démarrer le jeu</button>
        <button onClick={leaveRoom}>Quitter la salle</button>
        <button onClick={() => setShowRulesModal(true)}>Règles du jeu</button>
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
      </footer>
    </div>    

    );
};

export default GameRoom;