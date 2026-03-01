import { createRequire } from 'module'
import * as path from 'path'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const wb = XLSX.readFile(path.resolve(process.cwd(), 'data/Catalogue tarifaire Février 2026.xlsx'))

// =====================================================================
// 1. OPENSIM MOBILE (sheet "OpenSIM Moblie")
// =====================================================================

const catalogue: any = {
  openSimMobile: {
    forfaits: {
      bouygues: {},
      orange: {},
    },
    depassement: {},
    options: [],
    rechargeData: {},
    materiel: [],
    revolution: {},
  },
  openSimInternet: {
    forfaits: {},
    depassement: {},
    options: [],
    materiel: [],
  },
  openSimM2M: {
    forfaits: [],
    options: [],
    materiel: [],
  },
}

// ----- Parse Mobile sheet -----
// Header layout (0-indexed rows, 1-indexed Excel):
//   Row 15: A-B merged = "ABONNEMENTS FORFAITS MOBILES BOUYGUES"
//           C = "Liberté", D = "Fidélité", E-G = "Conquête"
//   Row 16: C = "Sans engagement", D = "12 mois", E = "Sans engagement", F = "12 mois", G = "24 mois"
//
// Data rows 18-24 (0-indexed):
//   Col A = label (merged with B)
//   Col B = hidden data (appears to be "Conquête prix public" / base price -- values differ from Conquête SE for some tiers)
//   Col C = Liberté Sans engagement
//   Col D = Fidélité 12 mois
//   Col E = Conquête Sans engagement
//   Col F = Conquête 12 mois
//   Col G = Conquête 24 mois

const mobileData = [
  { tier: 'Compteur', dataGo: 0, label: 'Appels, SMS, MMS inclus + Data Compteur' },
  { tier: '1Go', dataGo: 1, label: 'Appels, SMS, MMS inclus + 1 Go' },
  { tier: '10Go', dataGo: 10, label: 'Appels, SMS, MMS inclus + 10 Go' },
  { tier: '30Go', dataGo: 30, label: 'Appels, SMS, MMS inclus + 30 Go' },
  { tier: '60Go', dataGo: 60, label: 'Appels, SMS, MMS inclus + 60 Go' },
  { tier: '100Go', dataGo: 100, label: 'Appels, SMS, MMS inclus + 100 Go' },
  { tier: '200Go', dataGo: 200, label: 'Appels, SMS, MMS inclus + 200 Go' },
]

// Raw Bouygues prices from Excel (Excel rows 19-25, 0-indexed rows 18-24)
// Format: [colB, colC, colD, colE, colF, colG]
const bouyguesRaw: (number | null)[][] = [
  [null, 4.8, null, 3.9, null, null], // Compteur
  [4.9, 6.8, null, 4.9, 4.5, 3.9], // 1Go
  [7.9, 9.6, 7.9, 7.9, 7.5, 6.9], // 10Go
  [9.9, 11.2, 9.9, 9.9, 8.9, 7.9], // 30Go
  [13.5, 16.8, 13.5, 13.5, 12.5, 11.9], // 60Go
  [19.9, 22.4, 17.9, 17.9, 14.9, 13.9], // 100Go
  [38.9, 35.9, 32.9, 32.9, 29.9, 25.9], // 200Go
]

// Col B values match Conquête SE for most tiers but differ for 100Go/200Go.
// Since the header merge puts "ABONNEMENTS..." over A-B and "Liberté" only on C,
// col B is likely NOT a separate visible column in the original spreadsheet.
// However, the user mentioned "Bouygues Liberté 12 mois" -- since it does not exist as a header,
// col B might contain a hidden pricing that was perhaps intended for Liberté 12m but was removed.
// We'll include col B as "prixPublic" (reference price) since it appears in the layout.

catalogue.openSimMobile.forfaits.bouygues = {
  liberte: {
    sansEngagement: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: bouyguesRaw[i][1], // Col C
      }))
      .filter((x) => x.prixHT !== null),
  },
  fidelite: {
    engagement12mois: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: bouyguesRaw[i][2], // Col D
      }))
      .filter((x) => x.prixHT !== null),
  },
  conquete: {
    sansEngagement: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: bouyguesRaw[i][3], // Col E
      }))
      .filter((x) => x.prixHT !== null),
    engagement12mois: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: bouyguesRaw[i][4], // Col F
      }))
      .filter((x) => x.prixHT !== null),
    engagement24mois: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: bouyguesRaw[i][5], // Col G
      }))
      .filter((x) => x.prixHT !== null),
  },
  // Hidden col B values (possibly "prix public" / base Bouygues price before Liberté/Conquête split)
  prixPublicColB: mobileData
    .map((d, i) => ({
      tier: d.tier,
      dataGo: d.dataGo,
      prixHT: bouyguesRaw[i][0], // Col B
    }))
    .filter((x) => x.prixHT !== null),
}

// Raw Orange Conquête prices (Excel rows 29-35, 0-indexed 28-34)
// Cols: E = Sans engagement, F = 12 mois, G = 24 mois
const orangeRaw: (number | null)[][] = [
  [3.9, null, null], // Compteur
  [4.9, 4.6, 4.4], // 1Go
  [7.9, 7.5, 6.9], // 10Go
  [9.9, 8.9, 7.9], // 30Go
  [13.5, 12.5, 11.9], // 60Go
  [19.9, 16.9, 15.5], // 100Go
  [38.9, 37.5, 34.9], // 200Go
]

catalogue.openSimMobile.forfaits.orange = {
  conquete: {
    sansEngagement: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: orangeRaw[i][0],
      }))
      .filter((x) => x.prixHT !== null),
    engagement12mois: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: orangeRaw[i][1],
      }))
      .filter((x) => x.prixHT !== null),
    engagement24mois: mobileData
      .map((d, i) => ({
        tier: d.tier,
        dataGo: d.dataGo,
        label: d.label,
        prixHT: orangeRaw[i][2],
      }))
      .filter((x) => x.prixHT !== null),
  },
}

// ----- Dépassement -----
catalogue.openSimMobile.depassement = {
  dataParMo: { label: 'Internet Mobile (Data) par Mo', prixHT: 0.01 },
  sms: { label: 'SMS (unité)', prixHT: 0.15 },
  mms: { label: 'MMS (unité)', prixHT: 0.75 },
  voixParMinute: { label: 'Communication téléphonique (minute)', prixHT: 0.15 },
  notes: [
    "Les appels vers les numéros 08, les 3XXX et les 118XXX sont facturés au prix défini mensuellement par l'ARCEP.",
    "Les usages SMS+, MMS+ et Internet+ sont facturés selon le tarif annoncé par l'éditeur de service.",
  ],
}

// ----- Options -----
catalogue.openSimMobile.options = [
  {
    name: '5G - Réseau Bouygues',
    mensualite: 0,
    mensualiteLabel: 'Offert',
    fms: null,
    notes: 'Activable dans MyDstny sans commande préalable',
  },
  {
    name: '5G - Réseau Orange',
    mensualite: 3.5,
    fms: null,
    notes: 'Activable dans MyDstny sans commande préalable',
  },
  { name: "Création d'un numéro", mensualite: null, fms: null, notes: 'Gratuit' },
  { name: "Portabilité d'un numéro", mensualite: null, fms: null, notes: 'Gratuit' },
  {
    name: 'VoWiFi et VoLTE',
    mensualite: null,
    fms: null,
    notes: 'Terminal compatible requis. Non compatible avec Revolution.',
  },
  {
    name: 'Dstny Care',
    mensualite: 8.4,
    fms: null,
    notes: 'Accès aux conditions particulières Dstny Care',
  },
  { name: 'Convergence Dstny UCaaS', mensualite: 1.8, fms: null },
]

// ----- Recharge Data -----
// Headers: D = FMS Orange, E = FMS Bouygues Conquête, F = FMS Bouygues Liberté, G = FMS Bouygues Fidélité
catalogue.openSimMobile.rechargeData = {
  note: "La recharge est possible à partir de 80% de consommation de l'enveloppe initiale. Le prix correspond à un mois d'abonnement.",
  tiers: [
    {
      tier: '1Go',
      fmsOrange: 4.4,
      fmsBouyguesConquete: 3.9,
      fmsBouyguesLiberte: 6.8,
      fmsBouyguesFidelite: null,
    },
    {
      tier: '10Go',
      fmsOrange: 6.9,
      fmsBouyguesConquete: 6.9,
      fmsBouyguesLiberte: 9.6,
      fmsBouyguesFidelite: 7.9,
    },
    {
      tier: '30Go',
      fmsOrange: 7.9,
      fmsBouyguesConquete: 7.9,
      fmsBouyguesLiberte: 11.2,
      fmsBouyguesFidelite: 9.9,
    },
    {
      tier: '60Go',
      fmsOrange: 11.9,
      fmsBouyguesConquete: 11.9,
      fmsBouyguesLiberte: 16.8,
      fmsBouyguesFidelite: 13.5,
    },
    {
      tier: '100Go',
      fmsOrange: 17.5,
      fmsBouyguesConquete: 15.9,
      fmsBouyguesLiberte: 22.4,
      fmsBouyguesFidelite: 17.9,
    },
    {
      tier: '200Go',
      fmsOrange: 34.9,
      fmsBouyguesConquete: 25.9,
      fmsBouyguesLiberte: 35.9,
      fmsBouyguesFidelite: 32.9,
    },
  ],
}

// ----- SIM/eSIM et expédition -----
catalogue.openSimMobile.materiel = [
  { name: 'eSIM / Carte SIM', mensualite: null, fms: 3.9 },
  { name: "Frais d'expédition 1 à 10 SIM", mensualite: null, fms: 4.9 },
  { name: "Frais d'expédition 11 à 999 SIM", mensualite: null, fms: 9.9 },
]

// ----- OpenSIM Revolution -----
catalogue.openSimMobile.revolution = {
  description:
    'Connecter une ligne mobile OpenSIM Bouygues à un PBX certifié. Non compatible Orange.',
  tarif: {
    name: 'OpenSIM Revolution',
    mensualite: 2.0,
    mensualiteRemisee: 1.0,
    fms: null,
    notes: [
      "Le Client Final doit disposer d'une offre SIP Trunk Touch, Dstny UCaaS ou autre service voix fixe Dstny.",
      'Non compatible avec VoWiFi et VoLTE.',
      "Mensualité remisée si le Client Final dispose d'une offre Cloud ou Data active.",
    ],
  },
  tarificationConsommation: {
    description:
      "Communications transitant par l'installation fixe facturées selon le service voix fixe Dstny. Appels France métro mobile->fixes/mobiles français facturés à 0€.",
    notes: [
      'Communications hors PBX facturées selon OpenSIM Mobile.',
      "Service non fonctionnel à l'étranger pour appels émis.",
      "En cas d'injoignabilité du PBX, Revolution non fonctionnel pour appels émis et reçus.",
    ],
  },
  usageRaisonnable: {
    communicationsContinues: '2h max',
    contactsMaxParMois: 249,
    moyenneMensuelle12mois: '16h de communications sortantes par ligne',
  },
}

// =====================================================================
// 2. OPENSIM INTERNET (sheet "OpenSIM Internet")
// =====================================================================

// Headers (0-indexed rows):
// Row 14: ["FORFAITS INTERNET", "Abonnement Orange", "Abonnement Bouygues", null]
// Row 15: [null, null, "Conquête2", "Liberté"]
// Data rows 16-22: [label, Orange, Bouygues Conquête, Bouygues Liberté]

const internetTiers = [
  { tier: '1Go', dataGo: 1, label: 'Data Fixe 1 Go' },
  { tier: '10Go', dataGo: 10, label: 'Data Fixe 10 Go' },
  { tier: '50Go', dataGo: 50, label: 'Data Fixe 50 Go' },
  { tier: '100Go', dataGo: 100, label: 'Data Fixe 100 Go' },
  { tier: '200Go', dataGo: 200, label: 'Data Fixe 200 Go' },
  { tier: '500Go', dataGo: 500, label: 'Data Fixe 500 Go' },
  { tier: '1To', dataGo: 1000, label: 'Data Fixe 1 To' },
]

const internetPrices: { orange: number; bouyguesConquete: number; bouyguesLiberte: number }[] = [
  { orange: 3.5, bouyguesConquete: 3.0, bouyguesLiberte: 4.0 }, // 1Go
  { orange: 6.0, bouyguesConquete: 6.0, bouyguesLiberte: 8.0 }, // 10Go
  { orange: 14.0, bouyguesConquete: 11.0, bouyguesLiberte: 15.2 }, // 50Go
  { orange: 23.0, bouyguesConquete: 17.0, bouyguesLiberte: 23.2 }, // 100Go
  { orange: 44.0, bouyguesConquete: 30.0, bouyguesLiberte: 39.2 }, // 200Go
  { orange: 105.0, bouyguesConquete: 80.0, bouyguesLiberte: 87.2 }, // 500Go
  { orange: 210.0, bouyguesConquete: 150.0, bouyguesLiberte: 200.0 }, // 1To
]

catalogue.openSimInternet.forfaits = {
  engagement: 'Aucun engagement',
  note: "Offre Internet 5G pour site professionnel en France Métropolitaine. Pas de consommation à l'étranger incluse.",
  tiers: internetTiers.map((t, i) => ({
    tier: t.tier,
    dataGo: t.dataGo,
    label: t.label,
    prixOrange: internetPrices[i].orange,
    prixBouyguesConquete: internetPrices[i].bouyguesConquete,
    prixBouyguesLiberte: internetPrices[i].bouyguesLiberte,
  })),
}

// Dépassement Internet
catalogue.openSimInternet.depassement = {
  dataParMo: { label: 'Data par Mo', prixHT: 0.01 },
  sms: { label: 'SMS (unité)', prixHT: 0.15 },
  mms: { label: 'MMS (unité)', prixHT: 0.75 },
  voixParMinute: { label: 'Communication téléphonique (minute)', prixHT: 0.15 },
}

// Options Internet
catalogue.openSimInternet.options = [
  {
    name: 'Recharge data',
    mensualite: null,
    fms: "Tarif forfait (= 1 mois d'abonnement)",
    notes: 'Possible à partir de 80% de consommation',
  },
  {
    name: '5G - Réseau Bouygues',
    mensualite: 0,
    mensualiteLabel: 'Offert',
    fms: null,
    notes: 'Activable dans MyDstny sans commande préalable',
  },
  {
    name: '5G - Réseau Orange',
    mensualite: 3.5,
    fms: null,
    notes: 'Activable dans MyDstny sans commande préalable',
  },
  {
    name: 'Internet Premium',
    mensualite: 2.0,
    fms: null,
    notes: 'Sessions max/h: 250->2000. Déconnexion auto 6h supprimée. IP privée attribuée.',
  },
  {
    name: 'Adresse IP publique fixe',
    mensualite: 3.0,
    fms: null,
    notes: 'Requiert Internet Premium. Compatible NAT.',
  },
  {
    name: "Création d'un numéro",
    mensualite: null,
    fms: null,
    notes: 'Gratuit. Sur Orange = numéro 14 chiffres.',
  },
  {
    name: "Portabilité d'un numéro",
    mensualite: null,
    fms: null,
    notes: 'Gratuit. Uniquement Bouygues. Impossible de porter un numéro 14 chiffres Orange.',
  },
]

// Matériel Internet
catalogue.openSimInternet.materiel = [
  { name: 'eSIM / Carte SIM', mensualite: null, fms: 3.9 },
  { name: "Frais d'expédition 1 à 10 SIM", mensualite: null, fms: 4.9 },
  { name: "Frais d'expédition 11 à 999 SIM", mensualite: null, fms: 9.9 },
]

// =====================================================================
// 3. OPENSIM M2M (sheet "OpenSIM M2M")
// =====================================================================

catalogue.openSimM2M.forfaits = {
  engagement: 'Aucun engagement',
  operateur: 'Orange uniquement',
  note: 'Forfaits M2M pour IoT. Inclut 100 SMS. Au-delà, facturation selon OpenSIM Mobile.',
  tiers: [
    { tier: '100Mo', dataMo: 100, label: 'M2M 100 Mo + 100 SMS', prixHT: 2.0 },
    { tier: '250Mo', dataMo: 250, label: 'M2M 250 Mo + 100 SMS', prixHT: 2.5 },
    { tier: '500Mo', dataMo: 500, label: 'M2M 500 Mo + 100 SMS', prixHT: 3.5 },
  ],
}

catalogue.openSimM2M.options = [
  {
    name: 'Recharge data',
    mensualite: null,
    fms: "Tarif forfait (= 1 mois d'abonnement)",
    notes: 'Possible à partir de 80% de consommation',
  },
  {
    name: '5G - Réseau Orange',
    mensualite: 3.5,
    fms: null,
    notes: 'Activable dans MyDstny sans commande préalable',
  },
  {
    name: 'Internet Premium',
    mensualite: 2.0,
    fms: null,
    notes: 'Sessions max/h: 250->2000. Déconnexion auto 6h supprimée. IP privée attribuée.',
  },
  {
    name: 'Adresse IP publique fixe',
    mensualite: 3.0,
    fms: null,
    notes: 'Requiert Internet Premium. Compatible NAT.',
  },
  { name: "Création d'un numéro 14 digits", mensualite: null, fms: null, notes: 'Gratuit' },
]

catalogue.openSimM2M.materiel = [
  { name: 'eSIM / Carte SIM', mensualite: null, fms: 3.9 },
  { name: "Frais d'expédition 1 à 10 SIM", mensualite: null, fms: 4.9 },
  { name: "Frais d'expédition 11 à 999 SIM", mensualite: null, fms: 9.9 },
]

// =====================================================================
// OUTPUT
// =====================================================================

console.log(JSON.stringify(catalogue, null, 2))
