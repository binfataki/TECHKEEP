/* ==========================================================================
   TECHKEEP — CONFIGURATION À COMPLÉTER
   --------------------------------------------------------------------------
   Aucune coordonnée n'a été inventée : tous les champs ci-dessous sont vides.
   Un champ vide affiche « À renseigner » sur le site ; un champ rempli
   remplace automatiquement cet emplacement. Aucune autre modification de code
   n'est nécessaire.
   ========================================================================== */
window.TECHKEEP_CONFIG = {

  /* ---- Coordonnées officielles ------------------------------------------ */
  contact: {
    email: "",            // ex. "contact@votre-domaine.com"
    phone: "",            // ex. "+243 000 000 000"
    address: "",          // ex. "Avenue …, Ville, Pays"
    hours: ""             // optionnel, ex. "Lun–Ven : 8 h – 17 h" (masqué si vide)
  },

  /* ---- WhatsApp ---------------------------------------------------------
     Le bouton flottant n'apparaît que si "number" est renseigné.
     Format international, chiffres uniquement ou avec « + » (ex. "243000000000"). */
  whatsapp: {
    number: "",
    message: "Bonjour, je souhaite obtenir des informations sur vos services."
  },

  /* ---- Réseaux sociaux : URL complètes (https://…). Les champs vides sont ignorés. */
  social: {
    Facebook: "",
    LinkedIn: "",
    Instagram: "",
    X: "",
    YouTube: "",
    TikTok: ""
  },

  /* ---- Envoi du formulaire ----------------------------------------------
     Option 1 (recommandée) : un service de formulaires compatible JSON
       (Formspree, Web3Forms, Getform, …). Collez son URL dans "endpoint".
       Si le service exige une clé, ajoutez-la dans "extraFields",
       ex. { access_key: "VOTRE_CLE" } pour Web3Forms.
     Option 2 : si "endpoint" est vide mais que contact.email est renseigné,
       le bouton ouvre la messagerie du visiteur avec un message prérempli
       (le visiteur doit alors l'envoyer lui-même).
     Si aucune des deux n'est configurée, l'envoi est désactivé et le
     formulaire l'indique clairement : il n'affiche jamais de faux succès. */
  form: {
    endpoint: "",         // ex. "https://formspree.io/f/xxxxxxxx"
    extraFields: {},
    subjectPrefix: "Demande via le site TECHKEEP"
  }
};
