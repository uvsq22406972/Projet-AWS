import { useEffect, useState } from "react";
import axios from 'axios';

const ws = new WebSocket("ws://localhost:4001");

const GameRoom = ({ setCurrentPage }) => {  // <-- Ajout de setCurrentPage
    const [room, setRoom] = useState("");
    const [users, setUsers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [userid, setUserid] = useState("");
    const [isUserReady, setIsUserReady] = useState(false);

    // Vérifier si une session est déjà ouverte
    useEffect(() => {
        async function checkSession() {
            try {
                const response = await axios.get('/api/session');
                setUserid(response.data.userid);
                setIsUserReady(true);
            } catch (error) {
                console.log("Erreur, la session a expiré");
            }
        }

        checkSession();

        if (isUserReady && userid) {
            createRoom();
        }

        // Gérer les messages du serveur WebSocket
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message reçu:', message);

            if (message.type === 'game_started') {
                alert(`Le jeu a commencé dans la room ${message.room}`);
            }

            setRoom(message.room);
            setUsers(message.users);
        };

    }, [userid, isUserReady]);

    // Créer une room
    const createRoom = () => {
        const generatedRoomName = 'room-' + Math.random().toString(36).substring(2, 8);
        console.log("Room générée:", generatedRoomName);

        const message = {
            type: "create_room",
            room: generatedRoomName,
            user: userid,
        };
        ws.send(JSON.stringify(message));
    };


// pour ajouter un joueur au jeu
    const addPlayer = () => {
        const randomUsername = 'Player-' + Math.random().toString(36).substring(2, 8);
        console.log("Ajout du joueur:", randomUsername);

        const message = {
            type: "join_room",
            room,
            user: randomUsername,
        };
        ws.send(JSON.stringify(message));

        setTimeout(() => {
            fetchUsersInRoom();
        }, 200);
    };

    // Récupérer les utilisateurs dans la room
    const fetchUsersInRoom = () => {
        const message = { type: "get_users", room };
        ws.send(JSON.stringify(message));

        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'users_list') {
                console.log('Utilisateurs mis à jour:', response.users);
                setUsers(response.users);
            }
        };
    };

    // Démarrer le jeu
    const startGame = () => {
        console.log("Le bouton 'Démarrer le jeu' a été cliqué !");
        ws.send(JSON.stringify({ type: "start_game", room }));
        setGameStarted(true);
        setCurrentPage('gamepage');  // <-- Affiche la page GamePage
    };

    return (
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

                    {/* Bouton démarrer */}
                    <button className="custom-btn w-100" onClick={startGame}>
                        Démarrer le jeu
                    </button>
                </div>
            </div>

            {/* Bouton ajouter un joueur */}
            <button className="custom-btn w-100 mt-3" onClick={addPlayer}>
                Ajouter un joueur
            </button>
        </div>
    );
};

export default GameRoom;
