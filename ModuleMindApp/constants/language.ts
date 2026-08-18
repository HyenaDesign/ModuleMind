import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageKey = 'nl' | 'en' | 'fr' | 'de';

export const LANGUAGES: { key: LanguageKey; label: string; flag: string }[] = [
  { key: 'nl', label: 'Nederlands', flag: 'NL' },
  { key: 'en', label: 'English', flag: 'EN' },
  { key: 'fr', label: 'Francais', flag: 'FR' },
  { key: 'de', label: 'Deutsch', flag: 'DE' },
];

export type TranslationKey =
  | 'profile'
  | 'home'
  | 'search'
  | 'subjects'
  | 'modules'
  | 'teacherDashboard'
  | 'teacherAccessId'
  | 'teacherAccessHint'
  | 'studentRole'
  | 'teacherRole'
  | 'students'
  | 'classes'
  | 'classPerformance'
  | 'attentionNeeded'
  | 'recentModules'
  | 'averageScore'
  | 'completion'
  | 'progress'
  | 'dayStreak'
  | 'weeklyGoal'
  | 'modulesMade'
  | 'recentProgress'
  | 'comparedLastWeek'
  | 'questionsImproved'
  | 'minutesLearned'
  | 'personalAnalysis'
  | 'keepGoing'
  | 'bestSubject'
  | 'focusSubject'
  | 'noLearningDataYet'
  | 'correctCompliment1'
  | 'correctCompliment2'
  | 'correctCompliment3'
  | 'correctCompliment4'
  | 'level'
  | 'xpToNextLevel'
  | 'leaderboard'
  | 'facebookFriends'
  | 'facebookFriendsHint'
  | 'accountOptions'
  | 'xpRewardTitle'
  | 'xpRewardSubtitle'
  | 'levelUpTitle'
  | 'levelUpSubtitle'
  | 'premiumUser'
  | 'freeUser'
  | 'editProfile'
  | 'manageSubscription'
  | 'becomePremium'
  | 'scores'
  | 'language'
  | 'accountSecurity'
  | 'logout'
  | 'accountSettings'
  | 'save'
  | 'cancel'
  | 'name'
  | 'email'
  | 'password'
  | 'newPassword'
  | 'confirmPassword'
  | 'premiumTitle'
  | 'continue'
  | 'storageUsed'
  | 'storageLimitReached'
  | 'somethingWentWrong'
  | 'internetWarning'
  | 'noInternet'
  | 'tryAgain'
  | 'requiredFields'
  | 'loginFailed'
  | 'invalidLogin'
  | 'welcomeBack'
  | 'rememberMe'
  | 'forgotPassword'
  | 'signIn'
  | 'signUp'
  | 'noAccount'
  | 'hasAccount'
  | 'getStarted'
  | 'fullName'
  | 'acceptTerms'
  | 'createSubject'
  | 'enterTitle'
  | 'descriptionOptional'
  | 'noSubjects'
  | 'createFirstSubject'
  | 'noDescription'
  | 'noModules'
  | 'createFirstModule'
  | 'searchPlaceholder'
  | 'searchEmpty'
  | 'searchHint'
  | 'subject'
  | 'module'
  | 'clearLocalData'
  | 'clearLearningData'
  | 'learningDataCleared'
  | 'deleteLearningDataFailed'
  | 'saved'
  | 'premiumSaved'
  | 'localDataCleared'
  | 'passwordTooShort'
  | 'passwordMismatch'
  | 'accountSaved'
  | 'loadQuizFailed'
  | 'saveScoreFailed'
  | 'totalScore'
  | 'perSubject'
  | 'perModule'
  | 'noScores'
  | 'finishQuizForScores'
  | 'correct'
  | 'wrongAnswer'
  | 'goodJob'
  | 'yourAnswer'
  | 'correctAnswer'
  | 'attempts'
  | 'generateQuestions'
  | 'questionType'
  | 'singleChoice'
  | 'multipleChoice'
  | 'openQuestion'
  | 'selectAllCorrect'
  | 'typeAnswer'
  | 'detailedFeedback'
  | 'whyCorrect'
  | 'whyWrong'
  | 'uploadCover'
  | 'coverLoaded'
  | 'uploadMaterial'
  | 'moduleTitleRequired'
  | 'subjectRequired'
  | 'fileLoadFailed'
  | 'invalidGeneratedQuestions'
  | 'generationFailed'
  | 'moduleSaveFailed'
  | 'moduleSaved'
  | 'back';

const translations: Record<LanguageKey, Record<TranslationKey, string>> = {
  nl: {
    profile: 'Profiel',
    home: 'Home',
    search: 'Zoeken',
    subjects: 'Vakken',
    modules: 'Modules',
    teacherDashboard: 'Leerkracht',
    teacherAccessId: 'Leerkracht/admin ID',
    teacherAccessHint: 'Optioneel, bv. MODULEMIND-TEACHER',
    studentRole: 'Student',
    teacherRole: 'Leerkracht',
    students: 'Leerlingen',
    classes: 'Klassen',
    classPerformance: 'Klasprestaties',
    attentionNeeded: 'Aandacht nodig',
    recentModules: 'Recente modules',
    averageScore: 'Gem. score',
    completion: 'Voltooiing',
    progress: 'Vooruitgang',
    dayStreak: 'dagen streak',
    weeklyGoal: 'Weekdoel',
    modulesMade: 'modules gemaakt',
    recentProgress: 'Recente vooruitgang',
    comparedLastWeek: 'ten opzichte van vorige week',
    questionsImproved: 'vragen verbeterd',
    minutesLearned: 'min geleerd',
    personalAnalysis: 'Persoonlijke leeranalyse',
    keepGoing: 'Je bent sterk bezig!',
    bestSubject: 'Sterkste vak',
    focusSubject: 'Focusvak',
    noLearningDataYet: 'Maak een quiz af om je analyse en streak te starten.',
    correctCompliment1: 'Knap gedaan!',
    correctCompliment2: 'Sterk antwoord!',
    correctCompliment3: 'Mooi inzicht!',
    correctCompliment4: 'Je zit helemaal goed!',
    level: 'Level',
    xpToNextLevel: 'XP tot volgend level',
    leaderboard: 'Leaderboard',
    facebookFriends: 'Facebook vrienden',
    facebookFriendsHint: 'Log in met Facebook om vrienden te zien die ModuleMind gebruiken.',
    accountOptions: 'Accountopties',
    xpRewardTitle: 'Beloning verdiend',
    xpRewardSubtitle: 'Je XP is bijgewerkt na deze module.',
    levelUpTitle: 'Level omhoog',
    levelUpSubtitle: 'Sterk bezig, je hebt een nieuw level bereikt!',
    premiumUser: 'Premium gebruiker',
    freeUser: 'Gratis gebruiker',
    editProfile: 'Bewerk profiel',
    manageSubscription: 'Abonnement beheren',
    becomePremium: 'Wordt premium student',
    scores: 'Scores bekijken',
    language: 'Taal configureren',
    accountSecurity: 'Accountbeveiliging',
    logout: 'Log uit',
    accountSettings: 'Account instellingen',
    save: 'Opslaan',
    cancel: 'Annuleer',
    name: 'Naam',
    email: 'Email',
    password: 'Wachtwoord',
    newPassword: 'Nieuw wachtwoord',
    confirmPassword: 'Bevestig wachtwoord',
    premiumTitle: 'Wordt Premium student',
    continue: 'Doorgaan',
    storageUsed: 'opslag verbruikt',
    storageLimitReached: 'Gratis gebruikers kunnen maximaal 5 modules per vak opslaan.',
    somethingWentWrong: 'Er ging iets mis!',
    internetWarning: 'Internetwaarschuwing',
    noInternet: 'Geen internetverbinding',
    tryAgain: 'Probeer opnieuw',
    requiredFields: 'Vul alle verplichte velden in.',
    loginFailed: 'Login mislukt',
    invalidLogin: 'Ongeldige inloggegevens.',
    welcomeBack: 'Welkom terug',
    rememberMe: 'Onthoud mij',
    forgotPassword: 'Wachtwoord vergeten?',
    signIn: 'Sign in',
    signUp: 'Sign up',
    noAccount: 'Nog geen account?',
    hasAccount: 'Al een account?',
    getStarted: 'Aan de slag',
    fullName: 'Volledige naam',
    acceptTerms: 'Ik ga akkoord met de algemene voorwaarden',
    createSubject: 'Vak aanmaken',
    enterTitle: 'Titel invoeren...',
    descriptionOptional: 'Beschrijving (optioneel)',
    noSubjects: 'Nog geen vakken',
    createFirstSubject: 'Maak nu uw eerste vak aan',
    noDescription: 'Geen beschrijving',
    noModules: 'Nog geen modules',
    createFirstModule: 'Maak nu je eerste module aan',
    searchPlaceholder: 'Zoek vakken of modules...',
    searchEmpty: 'Geen resultaten gevonden',
    searchHint: 'Zoek op vaknaam, modulenaam of beschrijving.',
    subject: 'Vak',
    module: 'Module',
    clearLocalData: 'Wis lokale scores en cache',
    clearLearningData: 'Wis vakken, modules, scores en cache',
    learningDataCleared: 'Vakken, modules, scores en cache zijn gewist.',
    deleteLearningDataFailed: 'Niet alle vakken en modules konden worden gewist.',
    saved: 'Opgeslagen',
    premiumSaved: 'Je account is nu premium.',
    localDataCleared: 'Lokale modulescores en cache zijn gewist.',
    passwordTooShort: 'Gebruik minstens 6 tekens voor je wachtwoord.',
    passwordMismatch: 'De wachtwoorden komen niet overeen.',
    accountSaved: 'Account instellingen opgeslagen.',
    loadQuizFailed: 'Kon de quiz niet laden.',
    saveScoreFailed: 'Kon je score niet opslaan.',
    totalScore: 'Totaalscore',
    perSubject: 'Per vak',
    perModule: 'Per module',
    noScores: 'Nog geen scores',
    finishQuizForScores: 'Maak een quiz af om je scores hier te zien.',
    correct: 'juist',
    wrongAnswer: 'Niet juist',
    goodJob: 'Goed gedaan.',
    yourAnswer: 'Jouw antwoord',
    correctAnswer: 'Juist antwoord',
    attempts: 'pogingen',
    generateQuestions: 'Genereer vragen',
    questionType: 'Vraagtype',
    singleChoice: 'Meerkeuze',
    multipleChoice: 'Meerdere antwoorden',
    openQuestion: 'Open vraag',
    selectAllCorrect: 'Selecteer alle juiste antwoorden.',
    typeAnswer: 'Typ je antwoord...',
    detailedFeedback: 'Uitleg',
    whyCorrect: 'Je koos het juiste antwoord. Onthoud vooral waarom dit antwoord klopt.',
    whyWrong: 'Je antwoord klopt niet. Vergelijk jouw antwoord met het juiste antwoord en let op het verschil in betekenis.',
    uploadCover: 'Upload cover of icoon',
    coverLoaded: 'Cover geladen!',
    uploadMaterial: 'Upload PDF, DOCX of TXT',
    moduleTitleRequired: 'Geef je module eerst een titel.',
    subjectRequired: 'Open eerst een vak voordat je een module maakt.',
    fileLoadFailed: 'Kon bestand niet laden.',
    invalidGeneratedQuestions: 'De gegenereerde vragen hebben geen geldig formaat.',
    generationFailed: 'Genereren mislukt.',
    moduleSaveFailed: 'Kon module niet opslaan.',
    moduleSaved: 'Je module is opgeslagen!',
    back: 'Terug',
  },
  en: {
    profile: 'Profile',
    home: 'Home',
    search: 'Search',
    subjects: 'Subjects',
    modules: 'Modules',
    teacherDashboard: 'Teacher',
    teacherAccessId: 'Teacher/admin ID',
    teacherAccessHint: 'Optional, e.g. MODULEMIND-TEACHER',
    studentRole: 'Student',
    teacherRole: 'Teacher',
    students: 'Students',
    classes: 'Classes',
    classPerformance: 'Class performance',
    attentionNeeded: 'Attention needed',
    recentModules: 'Recent modules',
    averageScore: 'Avg. score',
    completion: 'Completion',
    progress: 'Progress',
    dayStreak: 'day streak',
    weeklyGoal: 'Weekly goal',
    modulesMade: 'modules completed',
    recentProgress: 'Recent progress',
    comparedLastWeek: 'compared with last week',
    questionsImproved: 'questions improved',
    minutesLearned: 'min learned',
    personalAnalysis: 'Personal learning analysis',
    keepGoing: 'You are doing great!',
    bestSubject: 'Strongest subject',
    focusSubject: 'Focus subject',
    noLearningDataYet: 'Finish a quiz to start your analysis and streak.',
    correctCompliment1: 'Nicely done!',
    correctCompliment2: 'Strong answer!',
    correctCompliment3: 'Great insight!',
    correctCompliment4: 'You nailed it!',
    level: 'Level',
    xpToNextLevel: 'XP to next level',
    leaderboard: 'Leaderboard',
    facebookFriends: 'Facebook friends',
    facebookFriendsHint: 'Log in with Facebook to see friends who use ModuleMind.',
    accountOptions: 'Account options',
    xpRewardTitle: 'Reward earned',
    xpRewardSubtitle: 'Your XP was updated after this module.',
    levelUpTitle: 'Level up',
    levelUpSubtitle: 'Great work, you reached a new level!',
    premiumUser: 'Premium user',
    freeUser: 'Free user',
    editProfile: 'Edit profile',
    manageSubscription: 'Manage subscription',
    becomePremium: 'Become premium student',
    scores: 'View scores',
    language: 'Configure language',
    accountSecurity: 'Account security',
    logout: 'Log out',
    accountSettings: 'Account settings',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    premiumTitle: 'Become Premium student',
    continue: 'Continue',
    storageUsed: 'storage used',
    storageLimitReached: 'Free users can store up to 5 modules per subject.',
    somethingWentWrong: 'Something went wrong!',
    internetWarning: 'Internet warning',
    noInternet: 'No internet connection',
    tryAgain: 'Try again',
    requiredFields: 'Fill in all required fields.',
    loginFailed: 'Login failed',
    invalidLogin: 'Invalid login details.',
    welcomeBack: 'Welcome back',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    signUp: 'Sign up',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    getStarted: 'Get started',
    fullName: 'Full name',
    acceptTerms: 'I agree to the terms and conditions',
    createSubject: 'Create subject',
    enterTitle: 'Enter title...',
    descriptionOptional: 'Description (optional)',
    noSubjects: 'No subjects yet',
    createFirstSubject: 'Create your first subject now',
    noDescription: 'No description',
    noModules: 'No modules yet',
    createFirstModule: 'Create your first module now',
    searchPlaceholder: 'Search subjects or modules...',
    searchEmpty: 'No results found',
    searchHint: 'Search by subject, module, or description.',
    subject: 'Subject',
    module: 'Module',
    clearLocalData: 'Clear local scores and cache',
    clearLearningData: 'Clear subjects, modules, scores and cache',
    learningDataCleared: 'Subjects, modules, scores and cache were cleared.',
    deleteLearningDataFailed: 'Not all subjects and modules could be cleared.',
    saved: 'Saved',
    premiumSaved: 'Your account is now premium.',
    localDataCleared: 'Local module scores and cache were cleared.',
    passwordTooShort: 'Use at least 6 characters for your password.',
    passwordMismatch: 'The passwords do not match.',
    accountSaved: 'Account settings saved.',
    loadQuizFailed: 'Could not load the quiz.',
    saveScoreFailed: 'Could not save your score.',
    totalScore: 'Total score',
    perSubject: 'Per subject',
    perModule: 'Per module',
    noScores: 'No scores yet',
    finishQuizForScores: 'Finish a quiz to see your scores here.',
    correct: 'correct',
    wrongAnswer: 'Not correct',
    goodJob: 'Well done.',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    attempts: 'attempts',
    generateQuestions: 'Generate questions',
    questionType: 'Question type',
    singleChoice: 'Multiple choice',
    multipleChoice: 'Multiple answers',
    openQuestion: 'Open question',
    selectAllCorrect: 'Select all correct answers.',
    typeAnswer: 'Type your answer...',
    detailedFeedback: 'Explanation',
    whyCorrect: 'You chose the right answer. Focus on why this answer is correct.',
    whyWrong: 'Your answer is not correct. Compare your answer with the correct answer and notice the meaning difference.',
    uploadCover: 'Upload cover or icon',
    coverLoaded: 'Cover loaded!',
    uploadMaterial: 'Upload PDF, DOCX or TXT',
    moduleTitleRequired: 'Give your module a title first.',
    subjectRequired: 'Open a subject before creating a module.',
    fileLoadFailed: 'Could not load the file.',
    invalidGeneratedQuestions: 'The generated questions are not valid.',
    generationFailed: 'Generation failed.',
    moduleSaveFailed: 'Could not save module.',
    moduleSaved: 'Your module was saved!',
    back: 'Back',
  },
  fr: {
    profile: 'Profil',
    home: 'Accueil',
    search: 'Rechercher',
    subjects: 'Matieres',
    modules: 'Modules',
    teacherDashboard: 'Enseignant',
    teacherAccessId: 'ID enseignant/admin',
    teacherAccessHint: 'Optionnel, ex. MODULEMIND-TEACHER',
    studentRole: 'Etudiant',
    teacherRole: 'Enseignant',
    students: 'Eleves',
    classes: 'Classes',
    classPerformance: 'Performance de classe',
    attentionNeeded: 'Attention requise',
    recentModules: 'Modules recents',
    averageScore: 'Score moyen',
    completion: 'Completion',
    progress: 'Progression',
    dayStreak: 'jours de serie',
    weeklyGoal: 'Objectif hebdo',
    modulesMade: 'modules termines',
    recentProgress: 'Progres recent',
    comparedLastWeek: 'par rapport a la semaine derniere',
    questionsImproved: 'questions ameliorees',
    minutesLearned: 'min apprises',
    personalAnalysis: 'Analyse personnelle',
    keepGoing: 'Vous progressez tres bien!',
    bestSubject: 'Matiere forte',
    focusSubject: 'Matiere a travailler',
    noLearningDataYet: 'Terminez un quiz pour lancer votre analyse et votre serie.',
    correctCompliment1: 'Tres bien!',
    correctCompliment2: 'Bonne reponse!',
    correctCompliment3: 'Belle idee!',
    correctCompliment4: 'C est exactement ca!',
    level: 'Niveau',
    xpToNextLevel: 'XP avant niveau suivant',
    leaderboard: 'Classement',
    facebookFriends: 'Amis Facebook',
    facebookFriendsHint: 'Connectez-vous avec Facebook pour voir les amis qui utilisent ModuleMind.',
    accountOptions: 'Options du compte',
    xpRewardTitle: 'Recompense gagnee',
    xpRewardSubtitle: 'Votre XP a ete mise a jour apres ce module.',
    levelUpTitle: 'Niveau superieur',
    levelUpSubtitle: 'Bravo, vous avez atteint un nouveau niveau!',
    premiumUser: 'Utilisateur premium',
    freeUser: 'Utilisateur gratuit',
    editProfile: 'Modifier le profil',
    manageSubscription: 'Gerer abonnement',
    becomePremium: 'Devenir premium',
    scores: 'Voir les scores',
    language: 'Configurer la langue',
    accountSecurity: 'Securite du compte',
    logout: 'Se deconnecter',
    accountSettings: 'Parametres du compte',
    save: 'Enregistrer',
    cancel: 'Annuler',
    name: 'Nom',
    email: 'Email',
    password: 'Mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    premiumTitle: 'Devenir Premium',
    continue: 'Continuer',
    storageUsed: 'stockage utilise',
    storageLimitReached: 'Les utilisateurs gratuits peuvent stocker 5 modules par matiere.',
    somethingWentWrong: 'Une erreur est survenue!',
    internetWarning: 'Avertissement internet',
    noInternet: 'Pas de connexion internet',
    tryAgain: 'Reessayer',
    requiredFields: 'Remplissez tous les champs obligatoires.',
    loginFailed: 'Connexion echouee',
    invalidLogin: 'Identifiants invalides.',
    welcomeBack: 'Bon retour',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublie?',
    signIn: 'Connexion',
    signUp: 'Inscription',
    noAccount: 'Pas encore de compte?',
    hasAccount: 'Deja un compte?',
    getStarted: 'Commencer',
    fullName: 'Nom complet',
    acceptTerms: "J'accepte les conditions generales",
    createSubject: 'Creer une matiere',
    enterTitle: 'Entrer le titre...',
    descriptionOptional: 'Description (optionnelle)',
    noSubjects: 'Aucune matiere',
    createFirstSubject: 'Creez votre premiere matiere',
    noDescription: 'Aucune description',
    noModules: 'Aucun module',
    createFirstModule: 'Creez votre premier module',
    searchPlaceholder: 'Rechercher matieres ou modules...',
    searchEmpty: 'Aucun resultat',
    searchHint: 'Recherchez par matiere, module ou description.',
    subject: 'Matiere',
    module: 'Module',
    clearLocalData: 'Effacer scores et cache locaux',
    clearLearningData: 'Effacer matieres, modules, scores et cache',
    learningDataCleared: 'Matieres, modules, scores et cache effaces.',
    deleteLearningDataFailed: 'Impossible d effacer toutes les matieres et modules.',
    saved: 'Enregistre',
    premiumSaved: 'Votre compte est maintenant premium.',
    localDataCleared: 'Scores et cache locaux effaces.',
    passwordTooShort: 'Utilisez au moins 6 caracteres.',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    accountSaved: 'Parametres du compte enregistres.',
    loadQuizFailed: 'Impossible de charger le quiz.',
    saveScoreFailed: 'Impossible d enregistrer le score.',
    totalScore: 'Score total',
    perSubject: 'Par matiere',
    perModule: 'Par module',
    noScores: 'Aucun score',
    finishQuizForScores: 'Terminez un quiz pour voir vos scores ici.',
    correct: 'correct',
    wrongAnswer: 'Incorrect',
    goodJob: 'Bien joue.',
    yourAnswer: 'Votre reponse',
    correctAnswer: 'Bonne reponse',
    attempts: 'tentatives',
    generateQuestions: 'Generer les questions',
    questionType: 'Type de question',
    singleChoice: 'Choix multiple',
    multipleChoice: 'Plusieurs reponses',
    openQuestion: 'Question ouverte',
    selectAllCorrect: 'Selectionnez toutes les bonnes reponses.',
    typeAnswer: 'Tapez votre reponse...',
    detailedFeedback: 'Explication',
    whyCorrect: 'Vous avez choisi la bonne reponse. Retenez pourquoi elle est correcte.',
    whyWrong: 'Votre reponse est incorrecte. Comparez-la avec la bonne reponse.',
    uploadCover: 'Importer une couverture ou icone',
    coverLoaded: 'Couverture chargee!',
    uploadMaterial: 'Importer PDF, DOCX ou TXT',
    moduleTitleRequired: 'Donnez d abord un titre au module.',
    subjectRequired: 'Ouvrez d abord une matiere.',
    fileLoadFailed: 'Impossible de charger le fichier.',
    invalidGeneratedQuestions: 'Les questions generees ne sont pas valides.',
    generationFailed: 'Generation echouee.',
    moduleSaveFailed: 'Impossible d enregistrer le module.',
    moduleSaved: 'Votre module est enregistre!',
    back: 'Retour',
  },
  de: {
    profile: 'Profil',
    home: 'Home',
    search: 'Suche',
    subjects: 'Facher',
    modules: 'Module',
    teacherDashboard: 'Lehrkraft',
    teacherAccessId: 'Lehrkraft/Admin ID',
    teacherAccessHint: 'Optional, z.B. MODULEMIND-TEACHER',
    studentRole: 'Student',
    teacherRole: 'Lehrkraft',
    students: 'Schuler',
    classes: 'Klassen',
    classPerformance: 'Klassenleistung',
    attentionNeeded: 'Aufmerksamkeit notig',
    recentModules: 'Aktuelle Module',
    averageScore: 'Durchschn. Score',
    completion: 'Abschluss',
    progress: 'Fortschritt',
    dayStreak: 'Tage Serie',
    weeklyGoal: 'Wochenziel',
    modulesMade: 'Module erledigt',
    recentProgress: 'Aktueller Fortschritt',
    comparedLastWeek: 'im Vergleich zur letzten Woche',
    questionsImproved: 'Fragen verbessert',
    minutesLearned: 'Min gelernt',
    personalAnalysis: 'Personliche Lernanalyse',
    keepGoing: 'Du machst das stark!',
    bestSubject: 'Starkstes Fach',
    focusSubject: 'Fokusfach',
    noLearningDataYet: 'Beende ein Quiz, um Analyse und Serie zu starten.',
    correctCompliment1: 'Gut gemacht!',
    correctCompliment2: 'Starke Antwort!',
    correctCompliment3: 'Guter Gedanke!',
    correctCompliment4: 'Genau richtig!',
    level: 'Level',
    xpToNextLevel: 'XP bis zum nachsten Level',
    leaderboard: 'Bestenliste',
    facebookFriends: 'Facebook Freunde',
    facebookFriendsHint: 'Melde dich mit Facebook an, um Freunde zu sehen, die ModuleMind nutzen.',
    accountOptions: 'Kontooptionen',
    xpRewardTitle: 'Belohnung verdient',
    xpRewardSubtitle: 'Deine XP wurde nach diesem Modul aktualisiert.',
    levelUpTitle: 'Level aufgestiegen',
    levelUpSubtitle: 'Stark, du hast ein neues Level erreicht!',
    premiumUser: 'Premium Nutzer',
    freeUser: 'Kostenloser Nutzer',
    editProfile: 'Profil bearbeiten',
    manageSubscription: 'Abo verwalten',
    becomePremium: 'Premium werden',
    scores: 'Scores ansehen',
    language: 'Sprache einstellen',
    accountSecurity: 'Kontosicherheit',
    logout: 'Abmelden',
    accountSettings: 'Kontoeinstellungen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    name: 'Name',
    email: 'E-Mail',
    password: 'Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestatigen',
    premiumTitle: 'Premium werden',
    continue: 'Weiter',
    storageUsed: 'Speicher genutzt',
    storageLimitReached: 'Kostenlose Nutzer konnen 5 Module pro Fach speichern.',
    somethingWentWrong: 'Etwas ist schiefgelaufen!',
    internetWarning: 'Internetwarnung',
    noInternet: 'Keine Internetverbindung',
    tryAgain: 'Erneut versuchen',
    requiredFields: 'Bitte alle Pflichtfelder ausfullen.',
    loginFailed: 'Login fehlgeschlagen',
    invalidLogin: 'Ungultige Login-Daten.',
    welcomeBack: 'Willkommen zuruck',
    rememberMe: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    signIn: 'Einloggen',
    signUp: 'Registrieren',
    noAccount: 'Noch kein Konto?',
    hasAccount: 'Schon ein Konto?',
    getStarted: 'Loslegen',
    fullName: 'Vollstandiger Name',
    acceptTerms: 'Ich akzeptiere die Bedingungen',
    createSubject: 'Fach erstellen',
    enterTitle: 'Titel eingeben...',
    descriptionOptional: 'Beschreibung (optional)',
    noSubjects: 'Noch keine Facher',
    createFirstSubject: 'Erstelle dein erstes Fach',
    noDescription: 'Keine Beschreibung',
    noModules: 'Noch keine Module',
    createFirstModule: 'Erstelle dein erstes Modul',
    searchPlaceholder: 'Facher oder Module suchen...',
    searchEmpty: 'Keine Ergebnisse',
    searchHint: 'Suche nach Fach, Modul oder Beschreibung.',
    subject: 'Fach',
    module: 'Modul',
    clearLocalData: 'Lokale Scores und Cache loschen',
    clearLearningData: 'Facher, Module, Scores und Cache loschen',
    learningDataCleared: 'Facher, Module, Scores und Cache wurden geloscht.',
    deleteLearningDataFailed: 'Nicht alle Facher und Module konnten geloscht werden.',
    saved: 'Gespeichert',
    premiumSaved: 'Dein Konto ist jetzt Premium.',
    localDataCleared: 'Lokale Scores und Cache wurden geloscht.',
    passwordTooShort: 'Nutze mindestens 6 Zeichen.',
    passwordMismatch: 'Die Passworter stimmen nicht uberein.',
    accountSaved: 'Kontoeinstellungen gespeichert.',
    loadQuizFailed: 'Quiz konnte nicht geladen werden.',
    saveScoreFailed: 'Score konnte nicht gespeichert werden.',
    totalScore: 'Gesamtscore',
    perSubject: 'Pro Fach',
    perModule: 'Pro Modul',
    noScores: 'Noch keine Scores',
    finishQuizForScores: 'Beende ein Quiz, um hier Scores zu sehen.',
    correct: 'richtig',
    wrongAnswer: 'Nicht richtig',
    goodJob: 'Gut gemacht.',
    yourAnswer: 'Deine Antwort',
    correctAnswer: 'Richtige Antwort',
    attempts: 'Versuche',
    generateQuestions: 'Fragen generieren',
    questionType: 'Fragetyp',
    singleChoice: 'Multiple Choice',
    multipleChoice: 'Mehrere Antworten',
    openQuestion: 'Offene Frage',
    selectAllCorrect: 'Wahle alle richtigen Antworten.',
    typeAnswer: 'Antwort eingeben...',
    detailedFeedback: 'Erklarung',
    whyCorrect: 'Du hast die richtige Antwort gewahlt. Merke dir, warum sie stimmt.',
    whyWrong: 'Deine Antwort ist nicht richtig. Vergleiche sie mit der richtigen Antwort.',
    uploadCover: 'Cover oder Icon hochladen',
    coverLoaded: 'Cover geladen!',
    uploadMaterial: 'PDF, DOCX oder TXT hochladen',
    moduleTitleRequired: 'Gib dem Modul zuerst einen Titel.',
    subjectRequired: 'Offne zuerst ein Fach.',
    fileLoadFailed: 'Datei konnte nicht geladen werden.',
    invalidGeneratedQuestions: 'Die generierten Fragen sind ungultig.',
    generationFailed: 'Generierung fehlgeschlagen.',
    moduleSaveFailed: 'Modul konnte nicht gespeichert werden.',
    moduleSaved: 'Dein Modul wurde gespeichert!',
    back: 'Zuruck',
  },
};

export const getStoredLanguage = async (): Promise<LanguageKey> => {
  const storedLanguage = await AsyncStorage.getItem('language');
  if (storedLanguage === 'en' || storedLanguage === 'fr' || storedLanguage === 'de' || storedLanguage === 'nl') {
    return storedLanguage;
  }

  return 'nl';
};

export const setStoredLanguage = async (language: LanguageKey) => {
  await AsyncStorage.setItem('language', language);
};

export const translate = (language: LanguageKey, key: TranslationKey) => translations[language][key];

