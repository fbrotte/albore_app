// Constants for proposal document generation

import type { CategoryGroup } from './types'

// Category name to group mapping
export const CATEGORY_GROUP_MAP: Record<string, CategoryGroup['slug']> = {
  'Téléphonie Mobile': 'telecom',
  'Téléphonie Fixe': 'telecom',
  'Internet & Réseau': 'telecom',
  'Cloud & Hébergement': 'it',
  'Logiciels & Licences': 'it',
  Matériel: 'it',
  Impression: 'printing',
}

// Group configurations
export const GROUP_CONFIG: Record<
  CategoryGroup['slug'],
  {
    name: string
    icon: string
    color: string
    bgColor: string
    borderColor: string
    gradientFrom: string
    gradientTo: string
  }
> = {
  telecom: {
    name: 'Téléphonie & Réseaux',
    icon: '📡',
    color: 'text-[#c77c14]',
    bgColor: 'bg-[#fef3e2]',
    borderColor: 'border-[#c77c14]',
    gradientFrom: '#c77c14',
    gradientTo: '#e8a543',
  },
  it: {
    name: 'Informatique',
    icon: '💻',
    color: 'text-[#2b6cb0]',
    bgColor: 'bg-[#e8f0fe]',
    borderColor: 'border-[#2b6cb0]',
    gradientFrom: '#2b6cb0',
    gradientTo: '#5b9bd5',
  },
  printing: {
    name: 'Impression',
    icon: '🖨️',
    color: 'text-[#7c3aed]',
    bgColor: 'bg-[#f0e6ff]',
    borderColor: 'border-[#7c3aed]',
    gradientFrom: '#7c3aed',
    gradientTo: '#9f67f5',
  },
}

// Static content
export const PRESENTATION_TEXT = {
  intro: `Albore Group est specialise dans l'optimisation des couts operationnels pour les entreprises. Nous analysons vos infrastructures existantes, identifions les inefficacites et proposons des solutions integrees pour reduire vos depenses operationnelles.`,
  expertises: [
    {
      title: 'Accompagnement personnalise',
      icon: '🤝',
      items: [
        "Equipe d'experts techniques et financiers",
        'Gestion de projet dediee',
        'Formation des utilisateurs',
        'Support et assistance continue',
      ],
    },
    {
      title: 'Approche budgetaire',
      icon: '💰',
      items: [
        'Analyse financiere des solutions proposees',
        'Calcul du ROI et temps de retour',
        'Solutions de financement (location, credit-bail)',
        'Lissage des couts dans le temps',
      ],
    },
    {
      title: 'Transition et migration',
      icon: '🔄',
      items: [
        'Planification detaillee de la migration',
        'Mise en oeuvre progressive',
        'Tests et validation avant basculement',
        'Accompagnement post-migration',
      ],
    },
  ],
  // Section Téléphonie IP
  telecomHighlight: `Albore est le second operateur telecom corse proposant des migrations des lignes analogiques/numeriques vers la telephonie IP, le deploiement d'IPBX dans le cloud et la mise en place d'abonnements telephoniques et mobiles.`,
  telecomColumns: [
    {
      title: 'Communications unifiees',
      items: [
        'Integration voix, video, messagerie et email sur plateforme unique',
        'Softphones pour ordinateurs et smartphones',
        'Applications mobiles pour travailler en mobilite',
        'Presence et statuts en temps reel',
      ],
    },
    {
      title: 'Fonctionnalites avancees',
      items: [
        'Standard telephonique virtuel (SVI/IVR)',
        "Files d'attente intelligentes",
        'Conferences audio et visio multi-participants',
        'CTI avec CRM, statistiques et tableaux de bord',
      ],
    },
    {
      title: 'Optimisation des couts',
      items: [
        'Audit de la facturation telecom actuelle',
        "Analyse des flux d'appels",
        'Renegociation avec les operateurs',
        'Mutualisation des lignes entre sites',
      ],
    },
  ],
  // Section Impression
  printHighlight: `Albore Print Services — Une offre complete d'impression managee (MPS) pour rationaliser votre parc, reduire vos couts et simplifier la gestion de vos impressions au quotidien.`,
  printColumns: [
    {
      title: 'Audit & Conseil',
      items: [
        "Audit complet du parc d'imprimantes et photocopieurs",
        "Analyse des volumes d'impression par site et service",
        'Identification des couts caches',
        'Recommandations de rationalisation du parc',
      ],
    },
    {
      title: 'Equipements & Deploiement',
      items: [
        'Imprimantes multifonctions reseau (A4 / A3)',
        'Copieurs haut volume pour centres de reprographie',
        'Location avec maintenance tout inclus',
        'Installation, configuration et formation',
      ],
    },
    {
      title: 'Impression Securisee',
      items: [
        'Impression par badge / code PIN (Pull Printing)',
        'Authentification utilisateur',
        'Suivi et tracabilite des impressions',
        'Conformite RGPD sur les documents imprimes',
      ],
    },
  ],
}

export const CONFIDENTIALITY_TEXT = {
  intro: `Le present document est confidentiel et destine exclusivement a l'usage de son destinataire. Il ne peut etre reproduit, divulgue ou utilise a d'autres fins sans l'autorisation ecrite prealable d'Albore Group.`,
  sections: [
    {
      title: 'Objet',
      content: `Ce document constitue une proposition commerciale personnalisee basee sur l'analyse de vos factures et de vos besoins specifiques. Les informations contenues sont le resultat d'un audit approfondi de votre situation actuelle.`,
    },
    {
      title: 'Confidentialite des donnees',
      content: `Toutes les informations relatives a votre entreprise (donnees financieres, volumes, fournisseurs actuels, etc.) sont traitees de maniere strictement confidentielle conformement a notre politique de protection des donnees et au RGPD.`,
    },
    {
      title: 'Propriete intellectuelle',
      content: `La methodologie d'analyse, les benchmarks et les recommandations presentees dans ce document sont la propriete exclusive d'Albore Group. Toute reproduction ou utilisation non autorisee est strictement interdite.`,
    },
    {
      title: 'Validite',
      content: `Les tarifs et conditions presentees dans ce document sont valables pour une duree de 30 jours a compter de la date d'emission. Passe ce delai, une actualisation pourra etre necessaire.`,
    },
  ],
  warning: `Toute divulgation non autorisee de ce document pourra faire l'objet de poursuites judiciaires.`,
}

export const ACTION_PLAN_STEPS = [
  {
    period: 'Semaine 1-2',
    title: 'Validation & Signature',
    description:
      'Validation de la proposition, signature du contrat de mission et collecte des documents necessaires.',
  },
  {
    period: 'Semaine 3-4',
    title: 'Migration & Implementation',
    description:
      'Mise en place des nouveaux contrats, portabilite des numeros et configuration des services.',
  },
  {
    period: 'Suivi continu',
    title: 'Accompagnement & Optimisation',
    description:
      'Suivi mensuel de la facturation, ajustements si necessaire et reporting des economies realisees.',
  },
]

export const SIGNATURE_TEXT = {
  client: {
    title: 'Pour le client',
    description: `En signant ce document, le client reconnait avoir pris connaissance des conditions de la proposition et mandate Albore Group pour proceder a l'optimisation de ses contrats telecoms et IT.`,
    guarantee: `Nous nous engageons a ne facturer nos services qu'en cas d'economies realisees. Pas d'economie = pas de frais.`,
  },
  albore: {
    title: 'Pour Albore Group',
    description: `Albore Group s'engage a mettre en oeuvre tous les moyens necessaires pour atteindre les objectifs d'optimisation presentes dans ce document, dans le respect des delais annonces.`,
  },
}

// CSS color variables (matching template)
export const COLORS = {
  navy: '#1b2a4a',
  navyLight: '#263d6b',
  blue: '#2b6cb0',
  blueLight: '#e8f0fe',
  blueDark: '#1e5494',
  accent: '#0d9668',
  accentLight: '#e8f8f2',
  danger: '#dc3545',
  dangerLight: '#fff5f5',
  warning: '#c77c14',
  warningLight: '#fef3e2',
  purple: '#7c3aed',
  purpleLight: '#f0e6ff',
  text: '#2d3748',
  textLight: '#718096',
  border: '#dce3ed',
  bg: '#f4f6f9',
}
