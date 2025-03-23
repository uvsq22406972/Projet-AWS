// Importation
import React, { useState, useEffect } from 'react';
import { FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Connexion avec le back
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

// Page qui permet d'être sur la page menu utilisateur
function Profile({ onBackToPagePrincipaleClick, setIsConnected, setCurrentPage }) {
  // Initialisation des états
  const [activeSection, setActiveSection] = useState('info');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [compte, setCompte] = useState([]);

  // États pour les choix de l'utilisateur
  const [hairType, setHairType] = useState('shortFlat');
  const [hairColor, setHairColor] = useState('2c1b18');
  const [accessories, setAccessories] = useState('none');
  const [facialHair, setFacialHair] = useState('none');
  const [clothes, setClothes] = useState('shirtCrewNeck');
  const [eyes, setEyes] = useState('default');
  const [eyebrows, setEyebrows] = useState('default');
  const [mouth, setMouth] = useState('default');
  const [skinColor, setSkinColor] = useState('edb98a');
  const [facialHairColor, setFacialHairColor] = useState('2c1b18');
  const [clothesColor, setClothesColor] = useState('3c4f5c');
  const [svgDataUri, setSvgDataUri] = useState('');
  const [coins, setCoins] = useState(0);

  // État pour gérer la catégorie avatar active
  const [selectedCategory, setSelectedCategory] = useState('coiffure');

  // États pour la modification du mot de passe
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  

  // Couleur du clavier
  const [keyboardColor, setKeyboardColor] = useState("#FFFFFF");
  const [showColors, setShowColors] = useState(false);

  const colors = [
    { name: "Rouge", hex: "#FF0000" },
    { name: "Bleu", hex: "#0000FF" },
    { name: "Vert", hex: "#008000" },
    { name: "Jaune", hex: "#FFFF00" },
    { name: "Rose", hex: "#FFC0CB" },
    { name: "Violet", hex: "#800080" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Marron", hex: "#A52A2A" },
    { name: "Gris", hex: "#808080" },
    { name: "Noir", hex: "#000000" }
  ];

  // Pour avoir une couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  // Fonction pour acheter une couleur de clavier
  const handleColorSelection = async (color) => {
    try {
      // Vérifier que l'utilisateur a assez de pièces
      const coinsResponse = await axios.get('/api/users/coins', { params: { email } });
      const coins = coinsResponse.data.coins;
      

      if (coins < 20) {
        toast.error("Vous n'avez pas assez de pièces pour acheter cette couleur.");
        return;
      }

      // Acheter la couleur
      const response = await axios.post('/api/users/buy-color', { email, color: color.hex });
      if (response.data.message) {
        toast.success(response.data.message);
      }

      // Mettre à jour l'état local
      setKeyboardColor(color.hex);
      localStorage.setItem("keyboardColor", color.hex); // Sauvegarde dans le localStorage
    } catch (error) {
      toast.error("Erreur lors de l'achat de la couleur : " + error.message);
    }
  };

  // Récupérer la couleur du clavier au chargement de la page
  useEffect(() => {
    const fetchKeyboardColor = async () => {
      try {
        const response = await axios.get('/api/users/keyboard-color', { params: { email } });
        if (response.data.color) {
          setKeyboardColor(response.data.color);
          localStorage.setItem("keyboardColor", response.data.color);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la couleur du clavier :", error);
      }
    };

    if (email) {
      fetchKeyboardColor();
    }
  }, [email]);

  // Action lorsqu'on clique sur "Se déconnecter"
  const handleLogoutClick = async () => {
    try {
      // Envoie une requête à l'API pour détruire la session (le cookie)
      await axios.post('/api/logout');

      // Met à jour l'état pour indiquer que l'utilisateur est déconnecté
      setIsConnected(false);
      // Redirige l'utilisateur vers la page de connexion
      setCurrentPage('login');
    } catch (error) {
      // console.error('Erreur lors de la déconnexion :', error);
    }
  };

  // Vérifier si une session est déjà ouverte ou pas
  async function checkSession() {
    try {
      // Récupérer le userid dans la session
      const response = await axios.get('/api/session');
      let userid = response.data.userid;

      if (userid) {
        setEmail(userid); // Sauvegarde de l'email pour la modification du mdp
        console.log("c'est moi", userid);
        setIsConnected(true);
        setCurrentPage('profile');
      } else {
        setIsConnected(false);
        setCurrentPage('login');
      }
    } catch (error) {
      setIsConnected(false);
      setCurrentPage('login');
    }
  }

  // Récupérer les attributs de la collection Compte sous forme array
  async function fetchAccount() {
    try {
      const response = await axios.get('/api/users/all');
      const fetchedAccount = response.data;

      const userid = (await axios.get('/api/session')).data.userid;
      const selectedAccount = fetchedAccount.find(account => account._id === userid);

      if (selectedAccount?.avatarSettings) {
        // Initialiser les états avec les paramètres sauvegardés
        setHairType(selectedAccount.avatarSettings.hairType || 'shortFlat');
        setHairColor(selectedAccount.avatarSettings.hairColor || '2c1b18');
        setAccessories(selectedAccount.avatarSettings.accessories || 'none');
        setFacialHair(selectedAccount.avatarSettings.facialHair || 'none');
        setClothes(selectedAccount.avatarSettings.clothes || 'shirtCrewNeck');
        setEyes(selectedAccount.avatarSettings.eyes || 'default');
        setEyebrows(selectedAccount.avatarSettings.eyebrows || 'default');
        setMouth(selectedAccount.avatarSettings.mouth || 'default');
        setSkinColor(selectedAccount.avatarSettings.skinColor || 'edb98a');
        setFacialHairColor(selectedAccount.avatarSettings.facialHairColor || '2c1b18');
        setClothesColor(selectedAccount.avatarSettings.clothesColor || '3c4f5c');
      }

      setCompte(selectedAccount || {});
    } catch (error) {
      console.error('Erreur lors de la récupération des infos du compte :', error);
    }
  }

  // Action lorsque'on clique sur "supprimer votre compte"
  const handleDeleteAccount = (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    console.log("test");
    // Initialisation des variables
    const emailInput = document.getElementById("delete-email");
    const loginInput = document.getElementById("delete_username");
    const passwordInput = document.getElementById("delete_password"); // 🛠 Correction ici !
    const confirmDeleteInput = document.getElementById("confirmDelete");

    // Vérifier si les éléments existent
    if (!emailInput || !loginInput || !passwordInput || !confirmDeleteInput) {
      console.log("test1 - Un ou plusieurs champs sont introuvables !");
      toast.error("Erreur : Un ou plusieurs champs sont introuvables.");
      return;
    }

    // Récupérer les valeurs
    const email = emailInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmDelete = confirmDeleteInput.checked;

    // Vérifier si les éléments existent
    if (!email || !login || !password || !confirmDelete) {
      console.log("test1 - Un ou plusieurs champs sont introuvables !");
      toast.error("Erreur : Un ou plusieurs champs sont introuvables.");
      return;
    }

    if (!confirmDelete) {
      console.log("test3");
      toast.error("Vous devez confirmer la suppression.");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);
    console.log(login);

    // Appel à l'API pour supprimer l'utilisateur
    axios.post('http://localhost:4000/api/delete', { email, login, password })
      .then(response => {
        console.log("Réponse de l'API :", response.data.message);
        toast.success(response.data.message); // Afficher un message de succès si tout se passe bien
        setTimeout(() => { handleLogoutClick(); }, 1000);
      })
      .catch(error => {
        console.error("Erreur lors de la requête:", error);
        toast.error("Oups ! Il semble y avoir une erreur dans les informations que vous avez saisies. Pourriez-vous vérifier et essayer à nouveau");
      });
  };

  // Fonction de soumission pour le changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // Vérifier que le nouveau mot de passe et sa confirmation correspondent
    if (newPassword !== confirmNewPassword) {
      setMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.patch('/api/users/password', { email, oldPassword, newPassword });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Erreur lors de la modification du mot de passe.');
      }
    }
  };

  // Exécution des fonctions asynchrones
  useEffect(() => {
    checkSession();
    fetchAccount();
    // eslint-disable-next-line
  }, []);

  const handleSaveAvatar = async () => {
    if (!email) {
      toast.error("Connectez-vous avant de sauvegarder");
      return;
    }

    const accessoriesParam = accessories === "none" ? [] : [accessories];
    const facialHairParam = facialHair === "none" ? [] : [facialHair];

    const svg = createAvatar(avataaars, {
      size: 200,
      top: [hairType],
      hairColor: [hairColor],
      accessories: accessoriesParam,
      accessoriesProbability: accessoriesParam.length > 0 ? 100 : 0,
      facialHair: [facialHair],
      facialHairProbability: facialHairParam.length > 0 ? 100 : 0,
      clothing: [clothes],
      eyes: [eyes],
      eyebrows: [eyebrows],
      mouth: [mouth],
      skinColor: [skinColor],
      facialHairColor: [facialHairColor],
      clothesColor: [clothesColor]
    });

    try {
      await axios.post('/api/save-avatar', {
        avatar: svg.toDataUri(),
        avatarSettings: { // Ajoutez ceci
          hairType,
          hairColor,
          accessories,
          facialHair,
          clothes,
          eyes,
          eyebrows,
          mouth,
          skinColor,
          facialHairColor,
          clothesColor
        },
        email: email
      });
      toast.success("Avatar sauvegardé !");
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      toast.error("Échec de la sauvegarde");
    }
  };

  useEffect(() => {
    const generateAvatar = () => {
      const accessoriesParam = accessories === "none" ? [] : [accessories];
      const facialHairParam = facialHair === "none" ? [] : [facialHair];
      const svg = createAvatar(avataaars, {
        size: 200,
        top: [hairType],            // Coiffure
        hairColor: [hairColor],     // Couleur de cheveux
        accessories: accessoriesParam, // Accessoires (lunettes, etc.)
        accessoriesProbability: accessoriesParam.length > 0 ? 100 : 0, // 100% de chance d'avoir l'accessoire
        facialHair: [facialHair],
        facialHairProbability: facialHairParam.length > 0 ? 100 : 0, // 100% de chance d'avoir une pilosité faciale
        clothing: [clothes],
        eyes: [eyes],
        eyebrows: [eyebrows],
        mouth: [mouth],
        skinColor: [skinColor],
        facialHairColor: [facialHairColor],
        clothesColor: [clothesColor]
      });

      // 4. Convertit le résultat en Data URI pour l’afficher
      const avatarDataUri = svg.toDataUri();
      setSvgDataUri(avatarDataUri); //  
      console.log(svg.toDataUri());
    };

    generateAvatar();
  }, [
    hairType, hairColor, accessories, facialHair, clothes,
    eyes, eyebrows, mouth, skinColor, facialHairColor, clothesColor, email
  ]);

  useEffect(() => {
    if (compte.avatarSettings) {
      setHairType(compte.avatarSettings.hairType || 'shortFlat');
      setHairColor(compte.avatarSettings.hairColor || '2c1b18');
      setAccessories(compte.avatarSettings.accessories || 'none');
      setFacialHair(compte.avatarSettings.facialHair || 'none');
      setClothes(compte.avatarSettings.clothes || 'shirtCrewNeck');
      setEyes(compte.avatarSettings.eyes || 'default');
      setEyebrows(compte.avatarSettings.eyebrows || 'default');
      setMouth(compte.avatarSettings.mouth || 'default');
      setSkinColor(compte.avatarSettings.skinColor || 'edb98a');
    }
  }, [compte]);
  useEffect(() => {
    const fetchCoins = async () => {
      if (email) {
        try {
          const response = await axios.get('/api/users/coins', { params: { email } });
          setCoins(response.data.coins);
        } catch (error) {
          console.error("Erreur lors de la récupération des pièces :", error);
        }
      }
    };
  
    fetchCoins();
  }, [email]);

  useEffect(() => {
    if (email) { // S'assurer que l'email est disponible
      axios.get('/api/get-avatar', { params: { email: email } })
        .then(response => {
          if (response.data.avatar) {
            setSvgDataUri(response.data.avatar);
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération de l'avatar :", error);
        });
    }
  }, [email]); // Déclencher uniquement quand `email` change

  const getCategoryLabel = (cat) => {
    const labels = {
      teint: '🎨 Teint',
      coiffure: '💇 Coiffure',
      vetements: '👕 Vêtements',
      yeux: '👀 Yeux',
      sourcils: '✏️ Sourcils',
      bouche: '👄 Bouche',
      pilosite: '🧔 Pilosité',
      accessoires: '🕶️ Accessoires'
    };
    return labels[cat] || cat;
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'teint':
        return (
          <div className="option-category">
            <h3>Teint</h3>
            <div className="options-row">
              {['614335', 'ae5d29', 'd08b5b', 'edb98a', 'f8d25c', 'fd9841', 'ffdbb4'].map((color) => (
                <button
                  key={color}
                  className={`color-option ${skinColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: `#${color}`, border: skinColor === color ? '2px solid black' : 'none' }}
                  onClick={() => setSkinColor(color)}
                />
              ))}
            </div>
          </div>
        );
      case 'coiffure':
        return (
          <>
            <div className="option-category">
              <h3>Coiffure</h3>
              <div className="options-grid">
                {[
                  "bigHair", 'shortFlat', 'bob', 'bun', 'curly', 'curvy',
                  'fro', 'frida', 'shavedSides', 'hat', 'hijab', 'shaggyMullet',
                  'sides', 'theCaesar', 'shortCurly',
                  'turban', 'winterHat03', 'winterHat02'
                ].map((style) => (
                  <button
                    key={style}
                    className={`style-option ${hairType === style ? 'selected' : ''}`}
                    onClick={() => setHairType(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-category">
              <h3>Couleur des cheveux</h3>
              <div className="options-row">
                {['2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${hairColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: `#${color}`, border: hairColor === color ? '2px solid black' : 'none' }}
                    onClick={() => setHairColor(color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'vetements':
        return (
          <>
            <div className="option-category">
              <h3>Vêtements</h3>
              <div className="options-grid">
                {[
                  "blazerAndShirt", 'blazerAndSweater', 'collarAndSweater',
                  'graphicShirt', 'shirtVNeck', 'hoodie',
                  'shirtCrewNeck', 'shirtScoopNeck', 'overall',
                ].map((style) => (
                  <button
                    key={style}
                    className={`style-option ${clothes === style ? 'selected' : ''}`}
                    onClick={() => setClothes(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-category">
              <h3>Couleur du vêtement</h3>
              <div className="options-row">
                {['3c4f5c', '65c9ff', '262e33', 'a7ffc4', '929598', 'ff5c5c', 'ff488e', 'ffffb1', 'ffffff'].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${clothesColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: `#${color}`, border: clothesColor === color ? '2px solid black' : 'none' }}
                    onClick={() => setClothesColor(color)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      case 'yeux':
        return (
          <div className="option-category">
            <h3>Yeux</h3>
            <div className="options-grid">
              {[
                'default', "cry", 'closed',
                'eyeRoll', 'happy', 'hearts', 'side',
                'squint', 'surprised', 'wink', 'xDizzy'
              ].map((style) => (
                <button
                  key={style}
                  className={`style-option ${eyes === style ? 'selected' : ''}`}
                  onClick={() => setEyes(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        );
      case 'sourcils':
        return (
          <div className="option-category">
            <h3>Sourcils</h3>
            <div className="options-grid">
              {[
                'default', "angry", 'frownNatural',
                'raisedExcited', 'upDown',
                'sadConcerned', 'unibrowNatural',
              ].map((style) => (
                <button
                  key={style}
                  className={`style-option ${eyebrows === style ? 'selected' : ''}`}
                  onClick={() => setEyebrows(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        );
      case 'bouche':
        return (
          <div className="option-category">
            <h3>Bouche</h3>
            <div className="options-grid">
              {[
                'default', "concerned", 'disbelief',
                'eating', 'sad',
                'serious', 'smile', 'tongue',
              ].map((style) => (
                <button
                  key={style}
                  className={`style-option ${mouth === style ? 'selected' : ''}`}
                  onClick={() => setMouth(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        );
      case 'pilosite':
        return (
          <>
            <div className="option-category">
              <h3>Pilosité faciale</h3>
              <div className="options-grid">
                {[
                  'none', "blank", 'beardMedium',
                  'beardLight', 'beardMajestic',
                  'moustacheFancy', 'moustacheMagnum',
                ].map((style) => (
                  <button
                    key={style}
                    className={`style-option ${facialHair === style ? 'selected' : ''}`}
                    onClick={() => setFacialHair(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-category">
              <h3>Couleur de la pilosité faciale</h3>
              <div className="options-row">
                {['2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'].map((color) => (
                  <button
                    key={color}
                    className={`color-option ${facialHairColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: `#${color}`, border: facialHairColor === color ? '2px solid black' : 'none' }}
                    onClick={() => setFacialHairColor(color)}
                  />
                ))}
              </div>
            </div>
          </>
        );

      case 'accessoires':
        return (
          <div className="option-category">
            <h3>Accessoires</h3>
            <div className="options-grid">
              {[
                'none', "eyepatch", 'kurt',
                'prescription01', 'prescription02', 'round',
                'sunglasses', 'wayfarers'
              ].map((style) => (
                <button
                  key={style}
                  className={`style-option ${accessories === style ? 'selected' : ''}`}
                  onClick={() => setAccessories(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Affichage des différentes sections
  function renderRightContent() {
    // Affichage menu info du compte
    if (activeSection === 'info') {
      return (
        <div id="section-info" className="mb-5">
          <h3 className="mb-4">Information du compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nom d'utilisateur</label>
              <p className="form-control custom-input">{compte.username}</p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Adresse e-mail</label>
              <p className="form-control custom-input">{compte._id}</p>
            </div>
          </form>
        </div>
      );
      // Affichage menu modifier le mot de passe
    } else if (activeSection === 'avatar') {
      return (
        <div id="section-avatar" className="mb-5">
          <div className="avatar-section" >
            <h2 className="section-title">Personnaliser ton Avatar</h2>
            <div className="avatar-preview">
              {/* Affiche l'avatar si svgDataUri n'est pas vide */}
              {svgDataUri ? (
                <img
                  src={svgDataUri}
                  alt="DiceBear Avataaars"
                  style={{ width: 150, height: 150 }}
                />
              ) : (
                <p>Chargement de l'avatar...</p>
              )}
            </div>
            <div className="category-scroller">
              <div className="category-tabs">
                {['teint', 'coiffure', 'vetements', 'yeux', 'sourcils', 'bouche', 'pilosite', 'accessoires'].map((cat) => (
                  <button
                    key={cat}
                    className={`tab ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="category-content">
              {renderCategoryContent()}
            </div>
            <button onClick={handleSaveAvatar}>Ok</button>
          </div>
        </div>
      );
    } else if (activeSection === 'clavier') {
      return (
        <div id="section-clavier" className="mb-5">
          <label className="form-label fw-semibold">Customisation clavier</label>
          <div className="mb-2"></div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowColors(!showColors)}>Choisir une couleur</button>
          {showColors && (
            <div className="color-options">
              {colors.map((color) => (
                <><button
                  key={color.name}
                  onClick={() => {
                    handleColorSelection(color);
                    setShowColors(false); // Fermer la palette de couleurs après sélection
                  }}
                  style={{
                    backgroundColor: color.hex,
                    color: color.hex === "#FFFF00" ? "black" : "white",
                    padding: "10px",
                    margin: "5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {color.name}
                </button><span className="price-tag">20 pièces</span></>
              ))}
            </div>
          )}
          {/* Afficher un aperçu du clavier avec la couleur sélectionnée */}
          <div className="keyboard-preview" style={{ marginTop: '20px' }}>
            <div className="keyboard-row">
              {['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                <div
                  key={key}
                  className="keyboard-key"
                  style={{ backgroundColor: keyboardColor }}
                >
                  {key}
                </div>
              ))}
            </div>
            <div className="keyboard-row">
              {['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'].map((key) => (
                <div
                  key={key}
                  className="keyboard-key"
                  style={{ backgroundColor: keyboardColor }}
                >
                  {key}
                </div>
              ))}
            </div>
            <div className="keyboard-row">
              {['W', 'X', 'C', 'V', 'B', 'N'].map((key) => (
                <div
                  key={key}
                  className="keyboard-key"
                  style={{ backgroundColor: keyboardColor }}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (activeSection === 'password') {
      return (
        <div id="section-password" className="mb-5">
          <h3 className="mb-4">Modifier votre mot de passe</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Mot de passe actuelle</label>
              <input
                type="password"
                className="form-control custom-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nouveau mot de passe</label>
              <input
                type="password"
                className="form-control custom-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Resaisir votre nouveau mot de passe</label>
              <input
                type="password"
                className="form-control custom-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      );
      // Affichage menu supprimer le compte
    } else if (activeSection === 'delete') {
      return (
        <div id="section-delete" className="mb-5">
          <h3 className="mb-4">Supprimer votre compte</h3>
          <form>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Saisissez votre nom d'utilisateur
              </label>
              <input type="text" id="delete_username" className="form-control custom-input" />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Saisissez votre email
              </label>
              <input type="text" id="delete-email" className="form-control custom-input" />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Saisissez votre mot de passe</label>
              <input type="password" id="delete_password" className="form-control custom-input" />
            </div>
            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="confirmDelete" />
              <label className="form-check-label" htmlFor="confirmDelete">
                Je confirme de vouloir supprimer mon compte
              </label>
            </div>
            <button type="submit" className="btn btn-secondary" onClick={handleDeleteAccount}>
              Supprimer mon compte
            </button>
          </form>
        </div>
      );
    }
  }

  // Déterminer l'affichage correct du menu
  function handleMenuClick(section) {
    setActiveSection(section);
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Haut de la page */}
      <nav className="navbar navbar-expand-lg sticky-top" style={gradientStyle}>
        <div className="container-fluid">
          <div className="navbar-brand text-white fw-bold" onClick={onBackToPagePrincipaleClick}>
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50" />
            bran.fun
          </div>
          <div className="ms-auto me-4 position-relative user-hover-area d-flex align-items-center">
            <FaUserCircle size={40} className="me-3 text-white" />
            <span className="text-white">{compte.username}</span>
            {/* Affichage menu choix utilisateur */}
            <div className="hover-box position-absolute">
              <div className="menu-box border-box-top" onClick={() => setShowLogoutConfirmation(true)}>
                Se déconnecter
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Confirmation logout: S'afficher lorsque showLogoutConfirmation = true */}
      {showLogoutConfirmation && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="close-btn" onClick={() => setShowLogoutConfirmation(false)}>
              X
            </button>
            <h4>Voulez-vous se déconnecter?</h4>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn" onClick={handleLogoutClick}>
                Oui
              </button>
              <button className="btn" onClick={() => setShowLogoutConfirmation(false)}>
                Non
              </button>
            </div>
          </div>
        </div>
      )}
      {/* L'élément principal */}
      <div className="container flex-grow-1 my-5">
        <div className="row">
          {/* Menu à gauche */}
          <div className="col-md-3">
            <div className={`menu-box mb-3 ${activeSection === 'info' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('info')}>
              <strong>Information du compte</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'avatar' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('avatar')}>
              <strong>Personnaliser votre avatar</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'clavier' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('clavier')}>
              <strong>Personnaliser votre clavier</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'password' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('password')}>
              <strong>Modifier votre mot de passe</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'delete' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('delete')}>
              <strong>Supprimer votre compte</strong>
            </div>
          </div>
          {/* Menu choisies */}
          <div className="col-md-9">
            {renderRightContent()}
          </div>
        </div>
      </div>
      {/* Bas de la page */}
      <footer className="py-3 fixed-bottom w-100 d-flex align-items-center" style={gradientStyle}>
        <div className="ms-3">
          {/* eslint-disable-next-line */}
          <a className="me-3 footer-link">
            Contactez-nous
          </a>
          {/* eslint-disable-next-line */}
          <a className="footer-link">
            Aide
          </a>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}

export default Profile;