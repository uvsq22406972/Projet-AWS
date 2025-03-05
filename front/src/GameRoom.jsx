import { useEffect, useState } from "react";
import axios from 'axios';

const ws = new WebSocket("ws://localhost:4001");

const GameRoom = () => {
    const [room, setRoom] = useState("");
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [gameStarted, setGameStarted] = useState(null);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);

    // Vérifier si une session est déjà ouverte ou pas
  async function checkSession() {
    try {
      // Récupérer le userid dans la session
      const response = await axios.get('/api/session');
       setUserid(response.data.userid);
       
    } catch (error) {
      console.log("Erreur, la session a expiré");
    }
  }

  useEffect(() => {
    /** On va vérifier avant de créer la room que l'on dispose du userid  */

    async function checkSession() {
        try {
            const response = await axios.get('/api/session');
            setUserid(response.data.userid);
            setIsUserReady(true); // on met prêt afin de créer la room
        } catch (error) {
            console.log("Erreur, la session a expiré");
        }
    }

    checkSession();  // Lancer la vérification de la session dès le début

    if (isUserReady && userid) {
        createRoom();
    }

    // Gérer la réception de messages depuis le serveur WebSocket
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message reçu -----------------------------: ', message);

        setRoom(message.room);  // Mettre à jour la room
        setUsers(message.users); // Mettre à jour les utilisateurs

        if (message.type === 'game_started') {
            alert(`Le jeu a commencé dans la room ${message.room}`);
        }
    };

    return () => {
    };
}, [userid, isUserReady]);

    // créer une room
    const createRoom = () => {
        // créer un nom  un peu aléatoire pour la room
        const generatedRoomName = 'room-' + Math.random().toString(36).substring(2, 8);
        console.log(generatedRoomName);
        // On envoie un message au serveur WebSocket
        const message = {
            type: "create_room",
            room: generatedRoomName,
            user: userid,
        };
        ws.send(JSON.stringify(message));
    };

    // récupérer les utilisateurs dans la room
    const fetchUsersInRoom = () => {
        // requete pour demander les utilisateurs dans la room
        const message = { type: "get_users", room };
        ws.send(JSON.stringify(message));
        ws.onmessage = (event) => { // dès qu'on le recoit
            const response = JSON.parse(event.data);
            if (response.type === 'users_list') {
                // mise à jour de la liste des utilisateurs
                
                console.log('Liste des utilisateurs mise à jour : ', response.users);
                setUsers(response.users);
                console.log("Verification de users qui est bien modif - ",users);
            }
        };
        
    };

    //démarrer le jeu
    const startGame = () => {
        ws.send(JSON.stringify({ type: "start_game", room }));
        setGameStarted(true);
    };

// pour ajouter un joueur au jeu
    const addPlayer = () => {

        const randomUsername = 'Player-' + Math.random().toString(36).substring(2, 8);
        console.log("Ajout du joueur : ", randomUsername);
        const message = {
            type: "join_room",
            room,
            user: randomUsername,
        };
        ws.send(JSON.stringify(message));
        // Attendre un court instant avant de rafraîchir la liste des utilisateurs
        setTimeout(() => {
            fetchUsersInRoom();
        }, 200);
            
    };

    
    // rejoindre la room
    const joinRoom = () => {
        if (room) {
            ws.send(JSON.stringify({ type: "join_room", room }));
            fetchUsersInRoom();  // Actualiser la liste des utilisateurs
        }
    };

    // Dégradé de fond
    const gradientStyle = {
        background: "linear-gradient(to top, #3B7088, #4FE9DE)",
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="container d-flex justify-content-center align-items-center">
                <div className="register-box text-center p-5 shadow-lg rounded" style={gradientStyle}>
                    <h2 className="mb-4 fw-bold text-white">Salle de Jeu</h2>

                    {/* Nom de la salle */}
                    <div className = "game-room-salle">
                    {room || "Chargement..."}
                    </div>

                    {/* Liste des utilisateurs dans la room */}
                    <div className="text-start mb-4">
                        <h4 className="text-white">Utilisateurs dans la room :</h4>
                        <ul className="list-group">
                        {Array.isArray(users) && users.length > 0 ? (
                            users.map((user, index) => (
                                <li key={index} className="list-group-item">
                                    {user}
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-muted">Aucun utilisateur pour l'instant</li>
                        )}
                        </ul>
                    </div>

                    {/* bouton pour démarrer le jeu */}
                     
                        <button className="custom-btn w-100" onClick={startGame}>
                            Démarrer le jeu
                        </button>

                    
                </div>
            </div>
             {/* bouton pour ajouter un joueur dans le jeu */}
             <button className="custom-btn w-100" onClick={addPlayer}>
                            ajouter un joueur
                        </button>
        </div>
    );
};

export default GameRoom;
