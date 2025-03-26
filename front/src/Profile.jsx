//Importation
import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaList, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";
import "./Profile.css";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

//Connexion avec le back
axios.defaults.baseURL = 'https://bombpartyy.duckdns.org';
axios.defaults.withCredentials = true;

//Page qui permet d'être sur la page menu utilisateur
function Profile({ onBackToPagePrincipaleClick, setIsConnected, setCurrentPage }) {
  //Initialisation des états
  const [activeSection, setActiveSection] = useState('info');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [compte, setCompte] = useState([]);

  // États pour les choix de l'utilisateur
  const [hairType, setHairType] = useState('none');
  const [hairColor, setHairColor] = useState('2c1b18');
  const [accessories, setAccessories] = useState('none');
  const [facialHair, setFacialHair] = useState('none');
  const [clothes, setClothes] = useState('shirtCrewNeck');
  const [eyes, setEyes] = useState('default');
  const [eyebrows, setEyebrows] = useState('default');
  const [mouth, setMouth] = useState('default');
  const [skinColor, setSkinColor] = useState('edb98a');
  const [accessoriesColor, setAccessoriesColor] = useState('65c9ff');
  const [facialHairColor, setFacialHairColor] = useState('2c1b18');
  const [clothesColor, setClothesColor] = useState('3c4f5c');
  const [svgDataUri, setSvgDataUri] = useState('');

  // État pour gérer la catégorie avatar active
  const [selectedCategory, setSelectedCategory] = useState('coiffure');

  // États pour la modification du mot de passe
  const [email, setEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [message, setMessage] = useState('');

  //Etats pour la suppression d'un compte
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteUsername, setDeleteUsername] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userCoins, setUserCoins] = useState(0); 

  //Couleur du clavier
  const [keyboardColor, setKeyboardColor] = useState("#FFFFFF");
  const [showColors, setShowColors] = useState(false);

  //Menu pour smartphone
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef(null);

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

  //Pour avoir une couleur unique
  const gradientStyle = {
    background: "linear-gradient(to top, #3B7088, #4FE9DE)",
  };

  const handleShowOldPasswordChange = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleShowNewPasswordChange = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleShowConfirmNewPasswordChange = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleShowDeletePasswordChange = () => {
    setShowDeletePassword(!showDeletePassword);
  };

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
        setAccessoriesColor(selectedAccount.avatarSettings.clothesColor || '65c9ff');
      }
  
      setCompte(selectedAccount || {});
      setUserCoins(selectedAccount.coins);
    } catch (error) {
      console.error('Erreur lors de la récupération des infos du compte :', error);
    }
  }

  //Action lorsque'on clique sur "supprimer votre compte"
  const handleDeleteAccount = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    if (!deleteEmail || !deleteUsername || !deletePassword || !confirmDelete) {
      toast.error("Veuillez remplir tous les champs et confirmer la suppression.");
      return;
    }
  
    try {
      const response = await axios.post('/api/delete', {
        email: deleteEmail,
        login: deleteUsername,
        password: deletePassword
      });
      
      toast.success(response.data.message);
      setDeleteEmail('');
      setDeleteUsername('');
      setDeletePassword('');
      setConfirmDelete(false);
      setTimeout(handleLogoutClick, 1000);
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte.");
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (compte.username === newUsername) {
      toast.error("Il faut que le nouveau nom d'utilisateur soit différent");
      return;
    }

    try {
      const response = await axios.patch('/api/users/username', { email, newUsername });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de la modification du nom d'utilisateur.");
      }
    }
  }

  const isUnlocked50 = (category, value) => {
    return compte?.unlockedItems?.[category]?.includes(value);
  };

  const isUnlocked100 = (category, value) => {
    return compte?.unlockedItems?.[category]?.includes(value);
  };

  const unlockItem50 = async (category, value) => {
    try {
      const response = await axios.post('/api/unlock-item-50', {
        category,
        item : value
      });
      toast.success("Élément débloqué !");
      fetchAccount(); // Met à jour les données
    } catch (err) {
      toast.error("Erreur lors du déblocage.");
    }
  };

  const unlockItem100 = async (category, value) => {
    try {
      const response = await axios.post('/api/unlock-item-100', {
        category,
        item : value
      });
      toast.success("Élément débloqué !");
      fetchAccount(); // Met à jour les données
    } catch (err) {
      toast.error("Erreur lors du déblocage.");
    }
  };
  

  // Fonction de soumission pour le changement de mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // Vérifier que le nouveau mot de passe et sa confirmation correspondent
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if(oldPassword === newPassword){
      toast.error("Il faut que le nouveau mot de passe soit différent");
    }

    try {
      const response = await axios.patch('/api/users/password', { email, oldPassword, newPassword });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de la modification du mot de passe.');
      }
    }
  };

  const changeKeyboardColor = (color) => {
    setKeyboardColor(color);
    localStorage.setItem("keyboardColor", color); // Sauvegarde la couleur pour GamePage
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
    const topParam = hairType === "none" ? [] : [hairType];
    
    const svg = createAvatar(avataaars, {
      size: 200,
      top: [hairType],
      topProbability: topParam.length > 0 ? 100 : 0,
      hairColor: [hairColor],
      accessories: accessoriesParam,
      accessoriesProbability: accessoriesParam.length > 0 ? 100 : 0,
      accessoriesColor : [accessoriesColor],
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
          clothesColor,
          accessoriesColor
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
        accessoriesColor: [accessoriesColor],
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
    eyes, eyebrows, mouth, skinColor, facialHairColor, clothesColor, accessoriesColor, email
  ]);

  useEffect(() => {
    if (compte.avatarSettings) {
      setHairType(compte.avatarSettings.hairType || 'none');
      setHairColor(compte.avatarSettings.hairColor || '2c1b18');
      setAccessories(compte.avatarSettings.accessories || 'none');
      setFacialHair(compte.avatarSettings.facialHair || 'none');
      setClothes(compte.avatarSettings.clothes || 'shirtCrewNeck');
      setEyes(compte.avatarSettings.eyes || 'default');
      setEyebrows(compte.avatarSettings.eyebrows || 'default');
      setMouth(compte.avatarSettings.mouth || 'default');
      setSkinColor(compte.avatarSettings.skinColor || 'edb98a');
      setFacialHairColor(compte.avatarSettings.hairColor || '2c1b18');
      setClothesColor(compte.avatarSettings.clothesColor || '3c4f5c');
      setAccessoriesColor(compte.avatarSettings.accessoriesColor || '65c9ff');

    }
  }, [compte]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      // Si le menu est ouvert ET que le clic n'est pas dans la sidebarRef...
      if (isMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false); // on ferme le menu
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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
    switch(selectedCategory) {
      case 'teint':
        return (
          <div className="option-category">
              <h3>Teint</h3>
              <div className="color-grid">
                {['edb98a','614335', 'ae5d29', 'd08b5b', 'f8d25c', 'fd9841', 'ffdbb4'].map((clr) => {
                  const unlocked = isUnlocked100('skinColor', clr);
                  return (
                    <div className="color-card" key={clr}>
                      {/* Bouton principal : sélection de la couleur */}
                      <button
                        className={`color-button ${unlocked ? 'unlocked' : 'locked'} ${
                          skinColor === clr ? 'selected' : ''
                        }`}
                        disabled={!unlocked}
                        onClick={() => unlocked && setSkinColor(clr)}
                        style={{ backgroundColor: `#${clr}` }}
                      >
                        {/* On affiche éventuellement le code hex si c'est débloqué */}
                        {unlocked ? clr : ''} 
                        {!unlocked && <span className="lock-icon"> 🔒</span>}
                      </button>
                        
                      {/* Bouton de déblocage si verrouillé */}
                      {!unlocked && (
                        <button
                          className="unlock-button"
                          onClick={() => unlockItem100('skinColor', clr)}
                        >
                          Débloquer pour 100&nbsp;🪙
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>  
        );
      case 'coiffure':
        return (
          <>
            <div className="option-category">
              <h3>Coiffure</h3>
              {/* Grille d'items */}
              <div className="items-grid">
                {[
                  "bigHair", "shortFlat", "bob", "bun", "curly", "curvy",
                  "fro", "frida", "shavedSides", "hat", "hijab", "shaggyMullet",
                  "sides", "theCaesar", "shortCurly", "turban",
                  "winterHat03", "winterHat02"
                ].map((style) => {
                const unlocked = isUnlocked100('hairType', style);
                return (
                  <div className="item-card" key={style}>
                    <button
                      className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${hairType === style ? 'selected' : ''}`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setHairType(style)}
                    >
                      {style}
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                    {!unlocked && (
                      <button className="unlock-button" onClick={() => unlockItem100('hairType', style)}>
                        Débloquer pour 100&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
            </div>   
            <div className="option-category">
              <h3>Couleur des cheveux</h3>
              <div className="color-grid">
                {[
                  '2c1b18', '4a312c', '724133', 'a55728', 'b58143',
                  'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'
                ].map((clr) => {
                const unlocked = isUnlocked50('hairColor', clr);
                
                return (
                  <div className="color-card" key={clr}>
                    {/* Bouton principal : sélection de la couleur */}
                    <button
                      className={`color-button ${unlocked ? 'unlocked' : 'locked'} ${
                        hairColor === clr ? 'selected' : ''
                      }`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setHairColor(clr)}
                      style={{ backgroundColor: `#${clr}` }}
                    >
                      {/* On affiche éventuellement le code hex si c'est débloqué */}
                      {unlocked ? clr : ''} 
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                      
                    {/* Bouton de déblocage si verrouillé */}
                    {!unlocked && (
                      <button
                        className="unlock-button"
                        onClick={() => unlockItem50('hairColor', clr)}
                      >
                        Débloquer pour 50&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </>
        );
      case 'vetements':
        return (
          <>
            <div className="option-category">
              <h3>Vêtements</h3>
              {/* Grille d'items */}
              <div className="items-grid">
                {[
                 'shirtCrewNeck', 'blazerAndSweater', 'collarAndSweater',
                  'graphicShirt', 'shirtVNeck', 'hoodie',
                  'blazerAndShirt','shirtScoopNeck', 'overall',
                ].map((style) => {
                const unlocked = isUnlocked100('clothes', style);
                return (
                  <div className="item-card" key={style}>
                    <button
                      className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${clothes === style ? 'selected' : ''}`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setClothes(style)}
                    >
                      {style}
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                    {!unlocked && (
                      <button className="unlock-button" onClick={() => unlockItem100('clothes', style)}>
                        Débloquer pour 100&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
            <div className="option-category">
              <h3>Couleur des vêtements</h3>
              <div className="color-grid">
                {[
                 '3c4f5c', '65c9ff', '262e33', 'a7ffc4', '929598', 'ff5c5c', 'ff488e', 'ffffb1', 'ffffff'
                ].map((clr) => {
                const unlocked = isUnlocked50('clothesColor', clr);
                
                return (
                  <div className="color-card" key={clr}>
                    {/* Bouton principal : sélection de la couleur */}
                    <button
                      className={`color-button ${unlocked ? 'unlocked' : 'locked'} ${
                        clothesColor === clr ? 'selected' : ''
                      }`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setClothesColor(clr)}
                      style={{ backgroundColor: `#${clr}` }}
                    >
                      {/* On affiche éventuellement le code hex si c'est débloqué */}
                      {unlocked ? clr : ''} 
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                      
                    {/* Bouton de déblocage si verrouillé */}
                    {!unlocked && (
                      <button
                        className="unlock-button"
                        onClick={() => unlockItem50('clothesColor', clr)}
                      >
                        Débloquer pour 50&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </>
        );
      case 'yeux':
        return (
          <div className="option-category">
          <h3>Yeux</h3>
          {/* Grille d'items */}
          <div className="items-grid">
            {[
              'default', "cry", 'closed',
              'eyeRoll', 'happy', 'hearts', 'side',
              'squint', 'surprised', 'wink', 'xDizzy'
            ].map((style) => {
            const unlocked = isUnlocked50('eyes', style);
            return (
              <div className="item-card" key={style}>
                <button
                  className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${eyes === style ? 'selected' : ''}`}
                  disabled={!unlocked}
                  onClick={() => unlocked && setEyes(style)}
                >
                  {style}
                  {!unlocked && <span className="lock-icon"> 🔒</span>}
                </button>
                {!unlocked && (
                  <button className="unlock-button" onClick={() => unlockItem50('eyes', style)}>
                    Débloquer pour 50&nbsp;🪙
                  </button>
                )}
              </div>
            );
          })}
          </div>
        </div>
        );
      case 'sourcils':
        return (
          <div className="option-category">
            <h3>Sourcils</h3>
            {/* Grille d'items */}
            <div className="items-grid">
              {[
                'default', "angry", 'frownNatural',
                'raisedExcited', 'upDown',
                'sadConcerned', 'unibrowNatural',
              ].map((style) => {
              const unlocked = isUnlocked50('eyes', style);
              return (
                <div className="item-card" key={style}>
                  <button
                    className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${eyebrows === style ? 'selected' : ''}`}
                    disabled={!unlocked}
                    onClick={() => unlocked && setEyebrows(style)}
                  >
                    {style}
                    {!unlocked && <span className="lock-icon"> 🔒</span>}
                  </button>
                  {!unlocked && (
                    <button className="unlock-button" onClick={() => unlockItem50('eyes', style)}>
                      Débloquer pour 50&nbsp;🪙
                    </button>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        );
      case 'bouche':
        return (
          <div className="option-category">
            <h3>Bouche</h3>
            {/* Grille d'items */}
            <div className="items-grid">
              {[
                'default', "concerned", 'disbelief',
                'eating', 'sad',
                'serious', 'smile', 'tongue',
              ].map((style) => {
              const unlocked = isUnlocked50('mouth', style);
              return (
                <div className="item-card" key={style}>
                  <button
                    className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${mouth === style ? 'selected' : ''}`}
                    disabled={!unlocked}
                    onClick={() => unlocked && setMouth(style)}
                  >
                    {style}
                    {!unlocked && <span className="lock-icon"> 🔒</span>}
                  </button>
                  {!unlocked && (
                    <button className="unlock-button" onClick={() => unlockItem50('mouth', style)}>
                      Débloquer pour 50&nbsp;🪙
                    </button>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        );
      case 'pilosite':
        return (
          <>
            <div className="option-category">
              <h3>Pilosité faciale</h3>
              {/* Grille d'items */}
              <div className="items-grid">
                {[
                  'none', 'beardMedium',
                  'beardLight', 'beardMajestic',
                  'moustacheFancy', 'moustacheMagnum',
                ].map((style) => {
                const unlocked = isUnlocked100('facialHair', style);
                return (
                  <div className="item-card" key={style}>
                    <button
                      className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${facialHair === style ? 'selected' : ''}`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setFacialHair(style)}
                    >
                      {style}
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                    {!unlocked && (
                      <button className="unlock-button" onClick={() => unlockItem100('facialHair', style)}>
                        Débloquer pour 100&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
            <div className="option-category">
              <h3>Couleur de la pilosité faciale</h3>
              <div className="color-grid">
                {[
                 '2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'
                ].map((clr) => {
                const unlocked = isUnlocked50('facialHairColor', clr);
                
                return (
                  <div className="color-card" key={clr}>
                    {/* Bouton principal : sélection de la couleur */}
                    <button
                      className={`color-button ${unlocked ? 'unlocked' : 'locked'} ${
                        facialHair === clr ? 'selected' : ''
                      }`}
                      disabled={!unlocked}
                      onClick={() => unlocked && setFacialHairColor(clr)}
                      style={{ backgroundColor: `#${clr}` }}
                    >
                      {/* On affiche éventuellement le code hex si c'est débloqué */}
                      {unlocked ? clr : ''} 
                      {!unlocked && <span className="lock-icon"> 🔒</span>}
                    </button>
                      
                    {/* Bouton de déblocage si verrouillé */}
                    {!unlocked && (
                      <button
                        className="unlock-button"
                        onClick={() => unlockItem50('facialHairColor', clr)}
                      >
                        Débloquer pour 50&nbsp;🪙
                      </button>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          </>
        );

        case 'accessoires':
          return (
            <>
              <div className="option-category">
                <h3>Accessoires</h3>
                {/* Grille d'items */}
                <div className="items-grid">
                  {[
                    'none', "eyepatch", 'kurt',
                      'prescription01', 'prescription02', 'round',
                      'sunglasses', 'wayfarers'
                  ].map((style) => {
                  const unlocked = isUnlocked100('accessories', style);
                  return (
                    <div className="item-card" key={style}>
                      <button
                        className={`item-button ${unlocked ? 'unlocked' : 'locked'} ${accessories === style ? 'selected' : ''}`}
                        disabled={!unlocked}
                        onClick={() => unlocked && setAccessories(style)}
                      >
                        {style}
                        {!unlocked && <span className="lock-icon"> 🔒</span>}
                      </button>
                      {!unlocked && (
                        <button className="unlock-button" onClick={() => unlockItem100('accessories', style)}>
                          Débloquer pour 100&nbsp;🪙
                        </button>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
              <div className="option-category">
                <h3>Couleur de l'accessoire</h3>
                <div className="color-grid">
                  {[
                   '65c9ff', '3c4f5c', '262e33', 'a7ffc4', 'ff5c5c', 'ff488e', 'ffafb9', 'ffdeb5', 'ffffb1'
                  ].map((clr) => {
                  const unlocked = isUnlocked50('accessoriesColor', clr);
                  
                  return (
                    <div className="color-card" key={clr}>
                      {/* Bouton principal : sélection de la couleur */}
                      <button
                        className={`color-button ${unlocked ? 'unlocked' : 'locked'} ${
                          accessoriesColor === clr ? 'selected' : ''
                        }`}
                        disabled={!unlocked}
                        onClick={() => unlocked && setAccessoriesColor(clr)}
                        style={{ backgroundColor: `#${clr}` }}
                      >
                        {/* On affiche éventuellement le code hex si c'est débloqué */}
                        {unlocked ? clr : ''} 
                        {!unlocked && <span className="lock-icon"> 🔒</span>}
                      </button>
                        
                      {/* Bouton de déblocage si verrouillé */}
                      {!unlocked && (
                        <button
                          className="unlock-button"
                          onClick={() => unlockItem50('accessoriesColor', clr)}
                        >
                          Débloquer pour 50&nbsp;🪙
                        </button>
                      )}
                    </div>
                  );
                  })}
                </div>
              </div>
            </>
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
        
        <div id="section-info" className="mb-5" style={{ 
          backgroundColor: "#fff", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginLeft: "30px"
        }}>
          <h3 className="mb-4">Information du compte</h3>
          <form>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nom d'utilisateur</label>
                <p className="form-control custom-input">{compte.username}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Adresse e-mail</label>
                <p className="form-control custom-input">{compte._id}</p>
              </div>
            </div>
          </div>
          </form>
        </div>
      );
    // Affichage menu modifier le mot de passe
    } else if (activeSection === 'avatar') {
      return (
        <div id="section-avatar" className="mb-5">
          <div className="avatar-section" >
            <h3 className="form-label text-center">Personnaliser votre Avatar</h3>
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
            <div className="text-center">
              <button onClick={handleSaveAvatar}>Sauvegarder</button>
            </div>
          </div>
        </div>
      );
    } else if (activeSection === 'clavier') {
      return (
        <div id="section-clavier" className="mb-5" style={{ 
          backgroundColor: "#fff", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginLeft: "30px"
        }}>
          <h3 className="form-label">Customisation clavier</h3>
          <div className="mb-2"></div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowColors(!showColors)}>Choisir une couleur</button>
          {showColors && (
            <div className="color-options">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    changeKeyboardColor(color.hex);
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
                </button>
              ))}
            </div>
          )}
        </div>
      )
    } else if (activeSection === 'changeuser') {
      return (
        <div id="section-changeuser" className="mb-5" style={{
          backgroundColor: "#fff", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginLeft: "30px"
        }}>
          <h3 className="mb-4">Modifier votre nom d'utilisateur</h3>
          <form onSubmit={handleUsernameSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Écrivez un nouveau nom d'utilisateur</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={"text"}
                      className="form-control custom-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      )
    } else if (activeSection === 'password') {
      return (
        <div id="section-password" className="mb-5" style={{
          backgroundColor: "#fff", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginLeft: "30px"
        }}>
          <h3 className="mb-4">Modifier votre mot de passe</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Mot de passe actuel</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      className="form-control custom-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <span
                      onClick={handleShowOldPasswordChange}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                      }}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nouveau mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control custom-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span
                      onClick={handleShowNewPasswordChange}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                      }}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Resaisir votre nouveau mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      className="form-control custom-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <span
                      onClick={handleShowConfirmNewPasswordChange}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                      }}
                    >
                      {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
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
        <div id="section-delete" className="mb-5" style={{ 
          backgroundColor: "#fff", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginLeft: "30px"
        }}>

          <h3 className="mb-4">Supprimer votre compte</h3>
          <form>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Saisissez votre nom d'utilisateur
                  </label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={deleteUsername}
                    onChange={(e) => setDeleteUsername(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Saisissez votre email
                  </label>
                  <input 
                    type="text" 
                    className="form-control custom-input" 
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Saisissez votre mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      className="form-control custom-input"
                      style={{ paddingRight: '2.5rem' }}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                    <span
                      onClick={handleShowDeletePasswordChange}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                      }}
                    >
                      {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-check mb-4">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
              />
              <label className="form-check-label">
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
            <img className="rounded-circle me-2" src="/images/logo-web.jpg" alt="Logo web" width="50" height="50"/>
            bran.fun
          </div>
          <div className="ms-auto me-4 position-relative user-hover-area d-flex align-items-center">
            <span className="text-white me-4">{userCoins} &nbsp;🪙</span>
            {compte.avatar ? (
              <img 
                src={compte.avatar} 
                alt="Avatar utilisateur" 
                className="me-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid black',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}
              />
            ) : (
              <FaUserCircle size={40} className="me-3 text-white"/>
            )}
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
        <button 
          onClick={onBackToPagePrincipaleClick}
          style={{
            position: 'absolute',
            right: '20px',
            top: '120px',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid black',
            borderRadius: '25px',
            padding: '8px 25px',
            color: 'black',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-50%) scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(-50%)';
          }}
        >
          ← Retour à l'accueil
        </button>
        <div className="row">
          {/* Menu à gauche */}
          <button 
            className="menu-toggle btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaList size={20} />
          </button>
          <div ref={sidebarRef} className={`sidebar-panel ${isMenuOpen ? 'open' : ''} col-md-3`}>
            <div className={`menu-box mb-3 ${activeSection === 'info' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('info')}>
              <strong>Information du compte</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'avatar' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('avatar')}>
              <strong>Personnaliser votre avatar</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'clavier' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('clavier')}>
              <strong>Personnaliser votre clavier</strong>
            </div>
            <div className={`menu-box mb-3 ${activeSection === 'changeuser' ? 'menu-box-active' : ''}`} onClick={() => handleMenuClick('changeuser')}>
              <strong>Modifier votre nom d'utilisateur</strong>
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
