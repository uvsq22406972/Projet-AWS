import { useEffect, useState, useRef } from "react";
import axios from 'axios';

const GameRoom = ({ setCurrentPage}) => {  // <-- Ajout de setCurrentPage
    const storedRoom = localStorage.getItem("room");
    const [room, setRoom] = useState(storedRoom);
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);
    const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);
    const ws = useRef(null);
    // Vérifier si une session est déjà ouverte
    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:4002");
        async function checkSession() {
            try {
                const response = await axios.get('/api/session');
                setUserid(response.data.userid);
                setIsUserReady(true);
            } catch (error) {
                console.log("Erreur, la session a expiré");
            }
        }
        ws.current.onopen = () => {
            console.log("WebSocket connecté !");
            setIsWebSocketOpen(true);
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                if (!storedRoom) {
                   createRoom();  
                }
                else {
                    joinRoom();
                }
            } else {
                console.warn("WebSocket n'est pas encore prêt, re-essai dans 500ms...");
                setTimeout(createRoom, 500); // Réessaye après 500ms
            }
        };
        checkSession();
        console.log("code de room ; ",room);
        
        // Gérer les messages du serveur WebSocket
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message reçu:', message);

            if (message.type === 'game_started') {
                alert(`Le jeu a commencé dans la room ${message.room}`);
            }
            if (message.type === 'generatedRoom') {
                localStorage.setItem("room", message.room);
                setRoom(message.room);
                setUsers(message.users);
            }
            
           
        };

        ws.current.onclose = (event) => {
            console.warn("⚠️ WebSocket fermé :", event);
            setIsWebSocketOpen(false);
            // Auto-reconnexion après 3 secondes
            setTimeout(() => {
                console.log("🔄 Tentative de reconnexion...");
                ws.current = new WebSocket("ws://localhost:4001");
            }, 3000);
        };

    }, [room, userid, isUserReady]);

    // Créer une room
    const createRoom = () => {
        if (!isWebSocketOpen) {
            console.warn("WebSocket pas encore prêt, impossible de démarrer le jeu.");
            return;
        }
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
    
            const message = {
                type: "create_room",
                user: userid,
            };
            ws.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket n'est pas encore prêt, re-essai dans 500ms...");
            setTimeout(createRoom, 500); // Réessaye après 500ms
        }
    };


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
                user: userid,
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
        
        ws.current.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'users_list') {
                console.log('Utilisateurs mis à jour:', response.users);
                setUsers(response.users);
            }
            else if (response.type === "error"){console.log("oula");}
            
        };
        console.log("Stored Room avant envoi :", storedRoom);
        if (!storedRoom) {
            console.warn("La room est vide, impossible d'envoyer la requête.");
            return;
        }
   
        const message = { type: "get_users", room: room };
        ws.current.send(JSON.stringify(message));
        

        
    };

    const leaveRoom = () => {
        if (!isWebSocketOpen || !ws.current) {
          console.warn("WebSocket n'est pas ouvert, impossible de quitter la salle.");
          return;
        }
      
        //le joueur quitte la salle envoyé au serveur
        const message = {
          type: "leave_room",
          room: storedRoom,  
          user: userid,  
        };
        ws.current.send(JSON.stringify(message));
        console.log(`Le joueur ${userid} quitte la room ${storedRoom}`);
        
       // redirection
        setCurrentPage("pagePrincipale");
        localStorage.removeItem("room");
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
        setCurrentPage('gamepage');  // <-- Affiche la page GamePage
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
