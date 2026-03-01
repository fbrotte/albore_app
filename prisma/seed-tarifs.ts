import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// ─── Types ───────────────────────────────────────────────────────────────────

type UnitType = 'UNIT' | 'HOUR' | 'MONTH' | 'USER' | 'LINE' | 'DEVICE'
type PricingType = 'FIXED' | 'PER_UNIT' | 'TIERED' | 'VOLUME'
type BillingType = 'RECURRING' | 'ONE_TIME' | 'USAGE'

interface ServiceData {
  category: string
  name: string
  semanticDescription: string
  unitType: UnitType
  unitLabel: string
  pricingType: PricingType
  basePrice: number
  billingType: BillingType
  pricingTiers?: { minQuantity: number; maxQuantity: number | null; unitPrice: number }[]
}

interface CategoryData {
  name: string
  description: string
  icon: string
  displayOrder: number
}

// ─── Categories ──────────────────────────────────────────────────────────────

const categories: CategoryData[] = [
  {
    name: 'Téléphonie Mobile',
    description: 'Forfaits et services de téléphonie mobile',
    icon: 'smartphone',
    displayOrder: 1,
  },
  {
    name: 'Téléphonie Fixe',
    description: 'Lignes fixes, SIP trunks et standards téléphoniques',
    icon: 'phone',
    displayOrder: 2,
  },
  {
    name: 'Internet & Réseau',
    description: 'Connexions internet ADSL, SDSL, FTTH, FTTE, FTTO et services réseau',
    icon: 'wifi',
    displayOrder: 3,
  },
  {
    name: 'Cloud & Hébergement',
    description: 'Services cloud, hébergement de serveurs et stockage',
    icon: 'cloud',
    displayOrder: 4,
  },
  {
    name: 'Logiciels & Licences',
    description: 'Licences logicielles et abonnements SaaS',
    icon: 'package',
    displayOrder: 5,
  },
  {
    name: 'Matériel',
    description: 'Équipements réseau, téléphones et matériel informatique',
    icon: 'monitor',
    displayOrder: 6,
  },
  {
    name: 'Cybersécurité',
    description:
      'Solutions EDR, antivirus, DNS filtering, patch management et protection des emails',
    icon: 'shield',
    displayOrder: 7,
  },
  {
    name: 'Sauvegarde',
    description: 'Solutions de sauvegarde et backup cloud',
    icon: 'hard-drive',
    displayOrder: 8,
  },
  {
    name: 'Communications Unifiées',
    description: 'Solutions UCaaS, visioconférence et collaboration',
    icon: 'headphones',
    displayOrder: 9,
  },
]

// ─── Microsoft 365 ───────────────────────────────────────────────────────────

const microsoft365Services: ServiceData[] = [
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 Business Basic',
    semanticDescription:
      'Licence Microsoft 365 Business Basic. Exchange Online, Teams, OneDrive 1 To, applications web uniquement. Abonnement mensuel par utilisateur.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 5.6,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 Business Standard',
    semanticDescription:
      'Licence Microsoft 365 Business Standard. Tout Business Basic plus applications desktop Word, Excel, PowerPoint, Outlook. Abonnement mensuel par utilisateur.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 11.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 Business Premium',
    semanticDescription:
      'Licence Microsoft 365 Business Premium. Tout Standard plus Intune, Defender for Business, Azure AD P1, Azure Information Protection. Sécurité renforcée.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 20.6,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Exchange Online Plan 1',
    semanticDescription:
      'Exchange Online Plan 1. Boîte mail professionnelle 50 Go, messagerie Exchange hébergée. Abonnement mensuel par utilisateur.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 3.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Exchange Online Plan 2',
    semanticDescription:
      'Exchange Online Plan 2. Boîte mail 100 Go avec archivage illimité. Messagerie Exchange avancée. Abonnement mensuel par utilisateur.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 7.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 Apps for Business',
    semanticDescription:
      'Microsoft 365 Apps for Business. Applications desktop Office uniquement sans Exchange. Word, Excel, PowerPoint, Outlook desktop.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 11.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'OneDrive for Business Plan 1',
    semanticDescription:
      'OneDrive for Business Plan 1. Stockage cloud professionnel 1 To par utilisateur. Synchronisation et partage de fichiers.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 4.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft Defender for Business',
    semanticDescription:
      'Microsoft Defender for Business. Protection endpoint EDR standalone. Antivirus et détection des menaces avancées Microsoft.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 2.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Copilot for Microsoft 365',
    semanticDescription:
      'Copilot for Microsoft 365. Intelligence artificielle intégrée aux applications Office. Assistant IA pour Word, Excel, PowerPoint, Outlook, Teams.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 28.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 E3',
    semanticDescription:
      'Microsoft 365 E3 Enterprise. Conformité avancée, Windows E3, sécurité renforcée. Pour entreprises de plus de 300 utilisateurs.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 34.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Logiciels & Licences',
    name: 'Microsoft 365 E5',
    semanticDescription:
      'Microsoft 365 E5 Enterprise. Tout E3 plus Defender P2, Phone System, Power BI Pro. Suite complète entreprise.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 54.75,
    billingType: 'RECURRING',
  },
]

// ─── Heimdal Cybersécurité ───────────────────────────────────────────────────

const heimdalServices: ServiceData[] = [
  {
    category: 'Cybersécurité',
    name: 'Heimdal EDR NGAV+XTP',
    semanticDescription:
      'Heimdal Endpoint Detection and Response NGAV+XTP. Antivirus nouvelle génération avec protection contre les menaces avancées. Tarification par poste mensuelle.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.39,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.39 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.11 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.94 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal EDR Ransomware Encryption Protection',
    semanticDescription:
      'Heimdal Ransomware Encryption Protection. Protection contre le chiffrement ransomware. Complément EDR anti-ransomware.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.34,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.34 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.07 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.91 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal EDR NGAV+XTP Serveur',
    semanticDescription:
      'Heimdal NGAV+XTP pour serveurs physiques ou virtuels. Protection antivirus serveur.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 1.8,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 1.8 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 1.44 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 1.15 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Ransomware Encryption Protection Serveur',
    semanticDescription:
      'Heimdal Ransomware Encryption Protection pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 2.14,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 2.14 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 1.71 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 1.37 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal MXDR/SOC',
    semanticDescription:
      'Heimdal MXDR Security Operations Center. Service managé de détection et réponse étendue. SOC externalisé.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 4.46,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 4.46 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 4.19 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 3.7 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal DNS Filtering Network/Hybrid',
    semanticDescription:
      'Heimdal Darklayer GUARD DNS, HTTP, HTTPS Filtering Network/Hybrid. Filtrage DNS réseau et hybride.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.66,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.66 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.25 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.94 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal DNS Filtering Endpoint',
    semanticDescription:
      'Heimdal Darklayer GUARD DNS Filtering Endpoint. Filtrage DNS sur poste de travail avec Vector N Detection.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.66,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.66 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.25 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.94 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal DNS Filtering Serveur',
    semanticDescription: 'Heimdal DNS Filtering pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 2.6,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 2.6 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 2.08 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 1.66 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Patch & Asset Management',
    semanticDescription:
      'Heimdal Vulnerability, Patch & Asset Management. Analyse des vulnérabilités et gestion des correctifs des applications tierces.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.07,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.07 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 0.86 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.68 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Infinity Management',
    semanticDescription:
      "Heimdal Infinity Management. Déploiement automatisé d'applications et d'OS. Complément au Patch & Asset Management.",
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 0.75,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 0.75 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 0.6 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.48 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Patch & Asset Management Serveur',
    semanticDescription: 'Heimdal Patch & Asset Management pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 1.71,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 1.71 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 1.37 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 1.09 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Infinity Management Serveur',
    semanticDescription: 'Heimdal Infinity Management pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 1.2,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 1.2 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 0.96 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 0.77 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Gestion des Privilèges PEDM',
    semanticDescription:
      'Heimdal Privilege Elevation and Delegation Management PEDM. Gestion des privilèges et des délégations sur postes de travail.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.49,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.49 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.22 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 1.0 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: "Heimdal Contrôle de l'Application",
    semanticDescription:
      'Heimdal Application Control. Contrôle des applications autorisées et bloquées sur postes de travail.',
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 1.11,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.11 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 0.94 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.79 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal PEDM Serveur',
    semanticDescription:
      'Heimdal Gestion des privilèges et délégations pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 2.97,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 2.97 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 2.38 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 1.9 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Contrôle Application Serveur',
    semanticDescription: 'Heimdal Application Control pour serveurs physiques ou virtuels.',
    unitType: 'UNIT',
    unitLabel: 'serveur',
    pricingType: 'TIERED',
    basePrice: 1.34,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 10, unitPrice: 1.34 },
      { minQuantity: 11, maxQuantity: 100, unitPrice: 1.07 },
      { minQuantity: 101, maxQuantity: null, unitPrice: 0.86 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal PASM (Privileged Account & Session Management)',
    semanticDescription:
      'Heimdal Privileged Account and Session Management PASM. Gestion des comptes privilégiés et des sessions. Coffre-fort de mots de passe.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'TIERED',
    basePrice: 74.26,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 5, unitPrice: 74.26 },
      { minQuantity: 6, maxQuantity: 10, unitPrice: 63.12 },
      { minQuantity: 11, maxQuantity: 20, unitPrice: 53.65 },
      { minQuantity: 21, maxQuantity: 50, unitPrice: 45.6 },
      { minQuantity: 51, maxQuantity: 100, unitPrice: 38.76 },
      { minQuantity: 101, maxQuantity: 200, unitPrice: 32.95 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Email Protection 365',
    semanticDescription:
      'Heimdal Email Protection pour Microsoft 365. Protection des emails contre phishing, spam et malwares pour tenants Office 365.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'TIERED',
    basePrice: 1.26,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 1.26 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 1.01 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.81 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Email Protection ATP',
    semanticDescription:
      'Heimdal Email Protection Advanced Threat Protection avec Email Fraud Prevention. Protection avancée des emails avec anti-fraude.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'TIERED',
    basePrice: 3.34,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 3.34 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 2.51 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 1.88 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Threat Hunting Portal',
    semanticDescription:
      "Heimdal Threat Hunting Portal DNS. Portail de chasse aux menaces basé sur l'analyse DNS.",
    unitType: 'DEVICE',
    unitLabel: 'poste',
    pricingType: 'TIERED',
    basePrice: 0.67,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 99, unitPrice: 0.67 },
      { minQuantity: 100, maxQuantity: 499, unitPrice: 0.58 },
      { minQuantity: 500, maxQuantity: 4999, unitPrice: 0.51 },
    ],
  },
  {
    category: 'Cybersécurité',
    name: 'Heimdal Remote Desktop',
    semanticDescription:
      'Heimdal Remote Desktop. Prise en main à distance sécurisée. Accès distant aux postes de travail.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'TIERED',
    basePrice: 30.37,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 1, maxQuantity: 5, unitPrice: 30.37 },
      { minQuantity: 6, maxQuantity: 10, unitPrice: 28.55 },
      { minQuantity: 11, maxQuantity: 20, unitPrice: 26.27 },
      { minQuantity: 21, maxQuantity: 50, unitPrice: 24.16 },
      { minQuantity: 51, maxQuantity: 100, unitPrice: 22.23 },
      { minQuantity: 101, maxQuantity: 200, unitPrice: 20.45 },
    ],
  },
]

// ─── Comet MSP Sauvegarde ────────────────────────────────────────────────────

const cometServices: ServiceData[] = [
  {
    category: 'Sauvegarde',
    name: 'Comet Sauvegarde Serveurs et Postes',
    semanticDescription:
      'Comet MSP sauvegarde serveurs et postes de travail. Backup Windows, Windows Server, Linux, Mac. Fichiers, dossiers, état système, MySQL.',
    unitType: 'DEVICE',
    unitLabel: 'appareil',
    pricingType: 'PER_UNIT',
    basePrice: 1.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Option Boosters Standard',
    semanticDescription:
      'Comet option boosters standard. Microsoft Exchange Server, Microsoft SQL Server, MongoDB, Application-Aware Writer.',
    unitType: 'DEVICE',
    unitLabel: 'appareil',
    pricingType: 'PER_UNIT',
    basePrice: 0.85,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Option Boosters Avancée Image Disque',
    semanticDescription:
      'Comet option boosters avancée. Image disque Windows complète. Backup image système bare metal.',
    unitType: 'DEVICE',
    unitLabel: 'appareil',
    pricingType: 'PER_UNIT',
    basePrice: 2.55,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet VM VMware (par agent)',
    semanticDescription:
      'Comet sauvegarde VMware par agent. Connexion directe à vCenter ou ESXi pour backup VM.',
    unitType: 'UNIT',
    unitLabel: 'agent',
    pricingType: 'PER_UNIT',
    basePrice: 4.25,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet VM VMware (par hôte)',
    semanticDescription:
      'Comet sauvegarde VMware par hôte ESXi. Licence par hôte pour backup de toutes les VM.',
    unitType: 'UNIT',
    unitLabel: 'hôte',
    pricingType: 'PER_UNIT',
    basePrice: 33.15,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet VM Hyper-V (par agent)',
    semanticDescription:
      'Comet sauvegarde Hyper-V par agent. Connexion directe à Hyper-V pour backup VM Windows.',
    unitType: 'UNIT',
    unitLabel: 'agent',
    pricingType: 'PER_UNIT',
    basePrice: 2.55,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet VM Hyper-V (par hôte)',
    semanticDescription:
      'Comet sauvegarde Hyper-V par hôte. Licence par hôte Windows pour backup de toutes les VM Hyper-V.',
    unitType: 'UNIT',
    unitLabel: 'hôte',
    pricingType: 'PER_UNIT',
    basePrice: 20.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Microsoft 365',
    semanticDescription:
      'Comet sauvegarde Microsoft 365. Protection des environnements cloud Microsoft 365, Exchange Online, OneDrive, SharePoint.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 1.27,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet NAS Synology',
    semanticDescription: 'Comet sauvegarde NAS Synology. Backup des appareils NAS Synology.',
    unitType: 'DEVICE',
    unitLabel: 'appareil NAS',
    pricingType: 'PER_UNIT',
    basePrice: 2.55,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Console Cloud',
    semanticDescription:
      'Comet console de gestion cloud. Gestion et protection des installations et des utilisateurs Comet depuis le cloud.',
    unitType: 'UNIT',
    unitLabel: 'console',
    pricingType: 'FIXED',
    basePrice: 41.65,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Console Cloud Local Serveur',
    semanticDescription:
      'Comet console de gestion cloud local mono-serveur. Console de gestion Comet hébergée localement.',
    unitType: 'UNIT',
    unitLabel: 'console',
    pricingType: 'FIXED',
    basePrice: 84.15,
    billingType: 'RECURRING',
  },
  {
    category: 'Sauvegarde',
    name: 'Comet Console Cloud Local Multiserveurs',
    semanticDescription:
      'Comet console de gestion cloud local multi-serveurs. Console de gestion Comet locale multi-sites.',
    unitType: 'UNIT',
    unitLabel: 'console',
    pricingType: 'FIXED',
    basePrice: 169.15,
    billingType: 'RECURRING',
  },
]

// ─── Wat'Stockage ────────────────────────────────────────────────────────────

const watStockageServices: ServiceData[] = [
  {
    category: 'Cloud & Hébergement',
    name: "Wat'Stockage Pay As You Go",
    semanticDescription:
      "Wat'Stockage stockage cloud pay as you go. Stockage des données dans le cloud facturation mensuelle au To. Compatible Comet. Powered by Wasabi.",
    unitType: 'UNIT',
    unitLabel: 'To',
    pricingType: 'PER_UNIT',
    basePrice: 6.99,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: "Wat'Stockage RCS (Reserved Capacity Storage)",
    semanticDescription:
      "Wat'Stockage RCS stockage cloud capacité réservée. Facturation annuelle avec volume réservé. Tarifs dégressifs selon volume.",
    unitType: 'UNIT',
    unitLabel: 'pack annuel',
    pricingType: 'TIERED',
    basePrice: 830.0,
    billingType: 'RECURRING',
    pricingTiers: [
      { minQuantity: 10, maxQuantity: 24, unitPrice: 83.0 }, // 830€ / 10 To = 83€/To/an
      { minQuantity: 25, maxQuantity: 49, unitPrice: 81.6 }, // 2040€ / 25 To
      { minQuantity: 50, maxQuantity: 99, unitPrice: 79.6 }, // 3980€ / 50 To
      { minQuantity: 100, maxQuantity: 249, unitPrice: 78.0 }, // 7800€ / 100 To
      { minQuantity: 250, maxQuantity: 499, unitPrice: 77.04 }, // 19260€ / 250 To
      { minQuantity: 500, maxQuantity: 1023, unitPrice: 75.88 }, // 37940€ / 500 To
      { minQuantity: 1024, maxQuantity: null, unitPrice: 73.0 }, // 74740€ / 1024 To
    ],
  },
]

// ─── Dstny — Communications Unifiées ─────────────────────────────────────────

const dstnyUcaasServices: ServiceData[] = [
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Licence Smart Illimité',
    semanticDescription:
      'Dstny UCaaS licence utilisateur Smart avec communications illimitées. Téléphonie cloud entreprise avec poste IP, softphone, Microsoft Teams.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 5.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Licence Smart Compteur',
    semanticDescription:
      'Dstny UCaaS licence utilisateur Smart avec tarification à la consommation. Téléphonie cloud entreprise.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 2.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Licence Smart+ Illimité',
    semanticDescription:
      'Dstny UCaaS licence utilisateur Smart+ avec communications illimitées. Version avancée avec fonctionnalités étendues.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 8.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Licence Smart+ Compteur',
    semanticDescription:
      'Dstny UCaaS licence utilisateur Smart+ avec tarification à la consommation.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 4.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Lot 2 Appels Entrants Supplémentaires',
    semanticDescription:
      'Dstny UCaaS option lot de 2 appels entrants supplémentaires par utilisateur.',
    unitType: 'USER',
    unitLabel: 'lot',
    pricingType: 'PER_UNIT',
    basePrice: 5.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: "Dstny UCaaS Groupement d'Appels",
    semanticDescription:
      "Dstny UCaaS groupement d'appels. Distribution des appels entrants vers un groupe d'utilisateurs.",
    unitType: 'UNIT',
    unitLabel: 'groupement',
    pricingType: 'PER_UNIT',
    basePrice: 1.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: "Dstny UCaaS Groupement d'Appels Avancé",
    semanticDescription:
      "Dstny UCaaS groupement d'appels avancé. File d'attente, routage avancé, statistiques.",
    unitType: 'UNIT',
    unitLabel: 'groupement',
    pricingType: 'PER_UNIT',
    basePrice: 6.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS SVI (Serveur Vocal Interactif)',
    semanticDescription:
      'Dstny UCaaS serveur vocal interactif SVI. Menu vocal automatisé pour orientation des appels.',
    unitType: 'UNIT',
    unitLabel: 'SVI',
    pricingType: 'PER_UNIT',
    basePrice: 1.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Statistiques Superviseur',
    semanticDescription:
      'Dstny UCaaS statistiques superviseur. Tableau de bord de supervision des appels et agents.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 2.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Call Recording 90j',
    semanticDescription: "Dstny UCaaS enregistrement d'appels avec stockage 90 jours.",
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 6.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Call Recording 7 ans',
    semanticDescription:
      "Dstny UCaaS enregistrement d'appels avec stockage 7 ans. Conformité réglementaire.",
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 28.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Tableau de Bord Temps Réel',
    semanticDescription:
      "Dstny UCaaS tableau de bord temps réel. Supervision en direct des appels et files d'attente.",
    unitType: 'UNIT',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 15.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Communications Unifiées',
    name: 'Dstny UCaaS Analytics Avancés',
    semanticDescription:
      'Dstny UCaaS analytics avancés. Rapports et statistiques détaillées sur les communications.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 0.4,
    billingType: 'RECURRING',
  },
]

// ─── Dstny — Téléphonie Fixe ─────────────────────────────────────────────────

const dstnyVoixServices: ServiceData[] = [
  // SIP Trunk Touch
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch Consommation (sans engagement)',
    semanticDescription:
      'Dstny SIP Trunk Touch canal simultané à la consommation sans engagement. Trunk SIP opérateur pour IPBX.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 1.49,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch Illimité France (12 mois)',
    semanticDescription:
      'Dstny SIP Trunk Touch canal simultané illimité fixes et mobiles France. Engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch Illimité France+International',
    semanticDescription:
      'Dstny SIP Trunk Touch canal simultané illimité France et international. Engagement 24 mois tarif avantageux.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch Illimité France+DOM',
    semanticDescription:
      'Dstny SIP Trunk Touch canal simultané illimité France, international, Martinique et Guadeloupe.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 20.9,
    billingType: 'RECURRING',
  },
  // SIP Trunk Touch TLS
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch TLS Consommation',
    semanticDescription:
      'Dstny SIP Trunk Touch TLS chiffré canal simultané à la consommation. Communications chiffrées SIP TLS et SRTP.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 3.3,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch TLS Illimité France',
    semanticDescription: 'Dstny SIP Trunk Touch TLS chiffré illimité fixes et mobiles France.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 9.7,
    billingType: 'RECURRING',
  },
  // Plateforme de Trunk
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Plateforme SIP Trunk Touch',
    semanticDescription:
      'Dstny plateforme de SIP Trunk Touch. Accès plateforme pour créer des trunks en autonomie. Par palier de 1000 canaux.',
    unitType: 'UNIT',
    unitLabel: 'palier 1000 canaux',
    pricingType: 'PER_UNIT',
    basePrice: 200.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Canal SIP Trunk Plateforme Compteur',
    semanticDescription:
      'Dstny canal SIP Trunk Touch sur plateforme. Tarification à la consommation.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 0.79,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Canal SIP Trunk TLS Plateforme',
    semanticDescription: 'Dstny canal SIP Trunk Touch TLS sur plateforme. Chiffrement SIP TLS.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 1.59,
    billingType: 'RECURRING',
  },
  // Direct Touch Routing (MS Teams)
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Direct Touch Routing Consommation',
    semanticDescription:
      'Dstny Direct Touch Routing canal simultané à la consommation. Téléphonie dans Microsoft Teams avec SIP TLS et SRTP.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 3.3,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Direct Touch Routing Illimité France',
    semanticDescription:
      'Dstny Direct Touch Routing illimité fixes et mobiles France pour Microsoft Teams.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 9.7,
    billingType: 'RECURRING',
  },
  // SIP Trunk Touch Rainbow
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny SIP Trunk Touch Rainbow Consommation',
    semanticDescription:
      'Dstny SIP Trunk Touch Rainbow canal simultané à la consommation. Téléphonie dans la suite Rainbow ALE.',
    unitType: 'LINE',
    unitLabel: 'canal',
    pricingType: 'PER_UNIT',
    basePrice: 3.3,
    billingType: 'RECURRING',
  },
  // MetaCentrex
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex Licence Simple Illimité',
    semanticDescription:
      'Dstny MetaCentrex licence simple illimité. Communications unifiées hébergées, Commportal Web, illimité France et international.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 6.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex Licence Simple Compteur',
    semanticDescription:
      'Dstny MetaCentrex licence simple au compteur. Communications unifiées hébergées à la consommation.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 3.35,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex Licence Full Illimité',
    semanticDescription:
      'Dstny MetaCentrex licence Full illimité. Softphones Accession Mac, PC, Smartphone, Commportal Assistant.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 11.45,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex Licence Full Compteur',
    semanticDescription: 'Dstny MetaCentrex licence Full au compteur avec softphones.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 5.65,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex Application Standardiste',
    semanticDescription:
      'Dstny MetaCentrex application standardiste. Console opérateur pour la gestion des appels entrants.',
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 27.39,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex RecCall 3 mois',
    semanticDescription:
      "Dstny MetaCentrex RecCall enregistrement d'appels avec 3 mois d'archivage.",
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 9.79,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex RecCall 6 mois',
    semanticDescription:
      "Dstny MetaCentrex RecCall enregistrement d'appels avec 6 mois d'archivage.",
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 11.99,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny MetaCentrex RecCall 12 mois',
    semanticDescription:
      "Dstny MetaCentrex RecCall enregistrement d'appels avec 12 mois d'archivage.",
    unitType: 'USER',
    unitLabel: 'licence',
    pricingType: 'PER_UNIT',
    basePrice: 14.19,
    billingType: 'RECURRING',
  },
  // Fax2Mail
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Fax2Mail Mono-émetteur',
    semanticDescription:
      'Dstny Fax2Mail et Mail2Fax mono-émetteur. Envoi et réception de fax par email.',
    unitType: 'UNIT',
    unitLabel: 'service',
    pricingType: 'FIXED',
    basePrice: 3.3,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Fax2Mail 50 émetteurs',
    semanticDescription:
      'Dstny Mail2Fax option 50 émetteurs. Extension multi-utilisateurs pour fax par email.',
    unitType: 'UNIT',
    unitLabel: 'option',
    pricingType: 'FIXED',
    basePrice: 5.5,
    billingType: 'RECURRING',
  },
  // Numéros
  {
    category: 'Téléphonie Fixe',
    name: 'Dstny Numéro Géographique',
    semanticDescription:
      'Dstny numéro géographique fixe 01 à 05 et 09. Création ou portabilité de numéro.',
    unitType: 'LINE',
    unitLabel: 'numéro',
    pricingType: 'PER_UNIT',
    basePrice: 0.2,
    billingType: 'RECURRING',
  },
]

// ─── Dstny — Internet & Réseau ───────────────────────────────────────────────

const dstnyDataServices: ServiceData[] = [
  // ADSL / VDSL
  {
    category: 'Internet & Réseau',
    name: 'Dstny ADSL Max / VDSL Orange',
    semanticDescription:
      'Dstny accès internet ADSL Max ou VDSL Orange. Connexion haut débit non garanti sur réseau cuivre Orange.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 36.35,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny ADSL Max / VDSL Dégroupé Orange',
    semanticDescription:
      'Dstny ADSL Max ou VDSL dégroupé Orange. Accès internet dégroupé sans ligne téléphonique.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 50.9,
    billingType: 'RECURRING',
  },
  // SDSL
  {
    category: 'Internet & Réseau',
    name: 'Dstny SDSL EFM 0.5M Orange 1 paire',
    semanticDescription:
      'Dstny SDSL EFM 0.5 Mbit/s symétrique Orange 1 paire cuivre. Débit garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 103.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny SDSL EFM 1M Orange 1 paire',
    semanticDescription: 'Dstny SDSL EFM 1 Mbit/s symétrique Orange 1 paire cuivre.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 109.25,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny SDSL EFM 2M Orange 1 paire',
    semanticDescription: 'Dstny SDSL EFM 2 Mbit/s symétrique Orange 1 paire cuivre.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 129.95,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny SDSL EFM 4M Orange 1 paire',
    semanticDescription: 'Dstny SDSL EFM 4 Mbit/s symétrique Orange 1 paire cuivre.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 179.4,
    billingType: 'RECURRING',
  },
  // FTTH Essentiel (Data Essentiel)
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Essentiel Axione Pro',
    semanticDescription:
      'Dstny fibre optique FTTH Essentiel Axione zone Pro. Fibre asymétrique haut débit.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 32.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Essentiel Axione Basic',
    semanticDescription: 'Dstny fibre optique FTTH Essentiel Axione zone Basic.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 35.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Essentiel Bouygues',
    semanticDescription: 'Dstny fibre optique FTTH Essentiel Bouygues Telecom.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 39.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Essentiel Orange',
    semanticDescription: 'Dstny fibre optique FTTH Essentiel Orange BLOM.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 45.0,
    billingType: 'RECURRING',
  },
  // Backup 4G
  {
    category: 'Internet & Réseau',
    name: 'Dstny Backup 4G Essentiel',
    semanticDescription:
      'Dstny service backup 4G essentiel. Bascule automatique vers 4G en cas de panne fibre. Continuité de service internet.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 19.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny Backup 4G Pro',
    semanticDescription:
      'Dstny service backup 4G Pro. Routeur Ethernet/4G avec bascule automatique.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 27.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny Backup 4G Entreprise',
    semanticDescription:
      'Dstny service backup 4G Entreprise. Version professionnelle du backup 4G avec garanties renforcées.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 35.0,
    billingType: 'RECURRING',
  },
  // FTTE Bouygues
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTE Bouygues 10M-100M',
    semanticDescription:
      'Dstny fibre FTTE Bouygues 10 à 100 Mbit/s. Fibre terminaison Ethernet débit garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 159.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTE Bouygues 200M',
    semanticDescription: 'Dstny fibre FTTE Bouygues 200 Mbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 179.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTE Bouygues 300M',
    semanticDescription: 'Dstny fibre FTTE Bouygues 300 Mbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 199.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTE Bouygues 500M',
    semanticDescription: 'Dstny fibre FTTE Bouygues 500 Mbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 219.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTE Bouygues 1G',
    semanticDescription: 'Dstny fibre FTTE Bouygues 1 Gbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 249.0,
    billingType: 'RECURRING',
  },
  // FTTO (résumé par opérateur — prix moyens d'entrée)
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO Axione',
    semanticDescription:
      'Dstny fibre optique FTTO Axione. Fibre dédiée entreprise avec débit garanti symétrique de 10M à 1G.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 149.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO Bouygues',
    semanticDescription:
      'Dstny fibre optique FTTO Bouygues. Fibre dédiée entreprise avec débit garanti de 10M à 1G.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 139.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO Covage',
    semanticDescription:
      'Dstny fibre optique FTTO Covage. Fibre dédiée entreprise multi-zones de 5M à 1G.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 95.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO Eurofiber',
    semanticDescription:
      'Dstny fibre optique FTTO Eurofiber. Fibre dédiée entreprise débit garanti de 10M à 1G.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 99.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO IELO',
    semanticDescription:
      'Dstny fibre optique FTTO IELO. Fibre dédiée entreprise multi-zones de 5M à 1G.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 109.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO Orange',
    semanticDescription:
      'Dstny fibre optique FTTO Orange. Fibre dédiée entreprise Orange de 2M à 1G avec SLA.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 186.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTO SFR',
    semanticDescription: 'Dstny fibre optique FTTO SFR. Fibre dédiée entreprise SFR multi-zones.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 159.0,
    billingType: 'RECURRING',
  },
  // FTTH Axione débit garanti
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Axione Débit Garanti 10M',
    semanticDescription:
      'Dstny FTTH Axione avec débit minimum garanti 10 Mbit/s. Fibre haut débit pro.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 99.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Axione Débit Garanti 100M',
    semanticDescription: 'Dstny FTTH Axione avec débit minimum garanti 100 Mbit/s.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 149.0,
    billingType: 'RECURRING',
  },
  // FTTH Covage
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Covage Confort 5M sym',
    semanticDescription:
      'Dstny FTTH Covage Confort fibre 1 Gbit/s avec 5 Mbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 69.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny FTTH Covage Confort 20M sym',
    semanticDescription:
      'Dstny FTTH Covage Confort fibre 1 Gbit/s avec 20 Mbit/s symétrique garanti.',
    unitType: 'UNIT',
    unitLabel: 'accès',
    pricingType: 'FIXED',
    basePrice: 139.0,
    billingType: 'RECURRING',
  },
  // Options IP
  {
    category: 'Internet & Réseau',
    name: 'Dstny Option IP VPN Coeur de Réseau',
    semanticDescription:
      'Dstny option IP VPN en coeur de réseau. Interconnexion de liens data par VPN opérateur.',
    unitType: 'UNIT',
    unitLabel: 'lien',
    pricingType: 'PER_UNIT',
    basePrice: 10.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Internet & Réseau',
    name: 'Dstny Option GTR 4h 24/7 Data',
    semanticDescription:
      'Dstny option GTR 4 heures 24h/24 7j/7 sur lien data. Garantie de temps de rétablissement.',
    unitType: 'UNIT',
    unitLabel: 'lien',
    pricingType: 'PER_UNIT',
    basePrice: 67.85,
    billingType: 'RECURRING',
  },
]

// ─── Dstny — Cloud ───────────────────────────────────────────────────────────

const dstnyCloudServices: ServiceData[] = [
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud 3CX Small (10 users)',
    semanticDescription:
      "Dstny MyCloud 3CX Small. VM hébergée 2 vCPU, 2 Go RAM, 30 Go stockage pour 3CX jusqu'à 10 utilisateurs.",
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 13.85,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud 3CX Medium (50 users)',
    semanticDescription:
      "Dstny MyCloud 3CX Medium. VM hébergée 4 vCPU, 4 Go RAM, 100 Go stockage pour 3CX jusqu'à 50 utilisateurs.",
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 27.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud 3CX Large (250 users)',
    semanticDescription:
      "Dstny MyCloud 3CX Large. VM hébergée 6 vCPU, 8 Go RAM, 300 Go stockage pour 3CX jusqu'à 250 utilisateurs.",
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 61.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud 3CX Entreprise (1000 users)',
    semanticDescription:
      "Dstny MyCloud 3CX Entreprise. VM hébergée 8 vCPU, 16 Go RAM, 500 Go stockage pour 3CX jusqu'à 1000 utilisateurs.",
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 108.55,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Yeastar Small',
    semanticDescription:
      'Dstny MyCloud Yeastar Small. VM hébergée 2 vCPU, 2 Go RAM, 40 Go pour Yeastar.',
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 13.85,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Yeastar Medium',
    semanticDescription:
      'Dstny MyCloud Yeastar Medium. VM hébergée 2 vCPU, 4 Go RAM, 40 Go pour Yeastar.',
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 27.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Yeastar Large',
    semanticDescription:
      'Dstny MyCloud Yeastar Large. VM hébergée 4 vCPU, 4 Go RAM, 50 Go pour Yeastar.',
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'FIXED',
    basePrice: 35.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Telephony CPU',
    semanticDescription:
      'Dstny MyCloud Telephony CPU virtuel. Composant VM personnalisée pour hébergement téléphonie.',
    unitType: 'UNIT',
    unitLabel: 'vCPU',
    pricingType: 'PER_UNIT',
    basePrice: 1.75,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Telephony RAM',
    semanticDescription:
      'Dstny MyCloud Telephony RAM. Mémoire vive pour VM personnalisée téléphonie.',
    unitType: 'UNIT',
    unitLabel: 'Go',
    pricingType: 'PER_UNIT',
    basePrice: 4.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny MyCloud Telephony Disque',
    semanticDescription:
      'Dstny MyCloud Telephony stockage disque. Espace disque pour VM personnalisée.',
    unitType: 'UNIT',
    unitLabel: 'Go',
    pricingType: 'PER_UNIT',
    basePrice: 0.14,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud Dédié vPlateforme',
    semanticDescription:
      'Dstny Cloud Dédié vPlateforme. Infrastructure virtuelle dédiée avec routeur managé.',
    unitType: 'UNIT',
    unitLabel: 'plateforme',
    pricingType: 'FIXED',
    basePrice: 27.7,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud Dédié vRouteur Manageable',
    semanticDescription:
      'Dstny Cloud Dédié vRouteur manageable par le partenaire. Routeur virtuel administrable.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 8.65,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud Mutualisé vPlateforme + vRouteur',
    semanticDescription:
      'Dstny Cloud Mutualisé vPlateforme et vRouteur manageable. Infrastructure cloud mutualisée multi-tenant.',
    unitType: 'UNIT',
    unitLabel: 'plateforme',
    pricingType: 'FIXED',
    basePrice: 43.3,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud GTI 4h 24/7 par VM',
    semanticDescription:
      "Dstny option GTI 4 heures 24h/24 7j/7 par VM cloud. Garantie de temps d'intervention.",
    unitType: 'UNIT',
    unitLabel: 'VM',
    pricingType: 'PER_UNIT',
    basePrice: 46.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud Windows Server Standard',
    semanticDescription: 'Dstny licence Windows Server Standard pour VM cloud. Par vCPU.',
    unitType: 'UNIT',
    unitLabel: 'vCPU',
    pricingType: 'PER_UNIT',
    basePrice: 18.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Cloud & Hébergement',
    name: 'Dstny Cloud Windows RDS',
    semanticDescription:
      'Dstny licence Microsoft Windows Remote Desktop Service pour cloud. Par utilisateur.',
    unitType: 'USER',
    unitLabel: 'utilisateur',
    pricingType: 'PER_UNIT',
    basePrice: 11.0,
    billingType: 'RECURRING',
  },
]

// ─── Dstny — Téléphonie Mobile ───────────────────────────────────────────────

const dstnyMobileServices: ServiceData[] = [
  // ── OpenSIM Mobile — Bouygues Liberté Sans engagement ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Data Compteur Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile data compteur réseau Bouygues offre Liberté sans engagement. Appels SMS MMS illimités, data à la consommation.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Bouygues offre Liberté sans engagement. Appels SMS MMS illimités.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 6.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 9.6,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 11.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 16.8,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 22.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 35.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Bouygues Fidélité 12 mois ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Bouygues Fidélité 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Bouygues offre Fidélité engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Bouygues Fidélité 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Bouygues offre Fidélité engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 9.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Bouygues Fidélité 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Bouygues offre Fidélité engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 13.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Bouygues Fidélité 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Bouygues offre Fidélité engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 17.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Bouygues Fidélité 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Bouygues offre Fidélité engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 32.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Bouygues Conquête Sans engagement ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Data Compteur Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile data compteur réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 3.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 9.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 13.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 17.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Bouygues offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 32.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Bouygues Conquête 12 mois ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 8.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 12.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 14.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Bouygues Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Bouygues offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 29.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Bouygues Conquête 24 mois ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Bouygues offre Conquête engagement 24 mois. Meilleur tarif Bouygues.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 3.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Bouygues offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 6.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Bouygues offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Bouygues offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 11.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Bouygues offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 13.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Bouygues Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Bouygues offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 25.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Orange Conquête Sans engagement ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Data Compteur Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile data compteur réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 3.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 9.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 13.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 19.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Orange',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Orange offre Conquête sans engagement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 38.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Orange Conquête 12 mois ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.6,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 8.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 12.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 16.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Orange Conquête 12M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Orange offre Conquête engagement 12 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 37.5,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Mobile — Orange Conquête 24 mois ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 1 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 1 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 4.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 10 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 10 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 6.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 30 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 30 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 60 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 60 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 11.9,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 100 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 100 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 15.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile 200 Go Orange Conquête 24M',
    semanticDescription:
      'Dstny OpenSIM forfait mobile 200 Go réseau Orange offre Conquête engagement 24 mois.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 34.9,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Revolution ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Revolution',
    semanticDescription:
      'Dstny OpenSIM Revolution forfait mobile Bouygues uniquement. Tarif réduit nécessitant un service voix fixe Dstny (SIP Trunk ou UCaaS). Non compatible Orange, VoWiFi et VoLTE.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 2.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Revolution (tarif remisé)',
    semanticDescription:
      'Dstny OpenSIM Revolution tarif remisé avec offre Cloud ou Data active. Bouygues uniquement.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 1.0,
    billingType: 'RECURRING',
  },

  // ── Options Mobile ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Option 5G Bouygues',
    semanticDescription:
      'Dstny OpenSIM option 5G réseau Bouygues. Accès au réseau 5G Bouygues, option offerte sans surcoût.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'FIXED',
    basePrice: 0.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Option 5G Orange',
    semanticDescription:
      'Dstny OpenSIM option 5G réseau Orange. Accès au réseau 5G Orange en complément du forfait mobile.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'PER_UNIT',
    basePrice: 3.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Dstny Care',
    semanticDescription:
      'Dstny OpenSIM option Dstny Care assurance et support premium pour forfait mobile.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'PER_UNIT',
    basePrice: 8.4,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Convergence UCaaS',
    semanticDescription:
      'Dstny OpenSIM option convergence fixe-mobile UCaaS. Intégration du mobile dans la solution UCaaS Dstny.',
    unitType: 'LINE',
    unitLabel: 'ligne',
    pricingType: 'PER_UNIT',
    basePrice: 1.8,
    billingType: 'RECURRING',
  },

  // ── Dépassement Mobile ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Dépassement Data',
    semanticDescription:
      'Dstny OpenSIM dépassement data mobile hors forfait. Facturation au Mo consommé en France métropolitaine.',
    unitType: 'UNIT',
    unitLabel: 'Mo',
    pricingType: 'PER_UNIT',
    basePrice: 0.01,
    billingType: 'USAGE',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Dépassement SMS',
    semanticDescription:
      'Dstny OpenSIM dépassement SMS mobile hors forfait en France métropolitaine.',
    unitType: 'UNIT',
    unitLabel: 'SMS',
    pricingType: 'PER_UNIT',
    basePrice: 0.15,
    billingType: 'USAGE',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Dépassement MMS',
    semanticDescription:
      'Dstny OpenSIM dépassement MMS mobile hors forfait en France métropolitaine.',
    unitType: 'UNIT',
    unitLabel: 'MMS',
    pricingType: 'PER_UNIT',
    basePrice: 0.75,
    billingType: 'USAGE',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Dépassement Voix',
    semanticDescription:
      'Dstny OpenSIM dépassement appel vocal mobile hors forfait à la minute en France métropolitaine.',
    unitType: 'UNIT',
    unitLabel: 'minute',
    pricingType: 'PER_UNIT',
    basePrice: 0.15,
    billingType: 'USAGE',
  },

  // ── Recharge Data Mobile — Bouygues Conquête ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 1 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM recharge data mobile 1 Go Bouygues Conquête. Frais uniques pour changement de forfait.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 3.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 10 Go Bouygues Conquête',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 10 Go Bouygues Conquête.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 6.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 30 Go Bouygues Conquête',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 30 Go Bouygues Conquête.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 60 Go Bouygues Conquête',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 60 Go Bouygues Conquête.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 11.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 100 Go Bouygues Conquête',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 100 Go Bouygues Conquête.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 15.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 200 Go Bouygues Conquête',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 200 Go Bouygues Conquête.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 25.9,
    billingType: 'ONE_TIME',
  },

  // ── Recharge Data Mobile — Bouygues Liberté ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 1 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 1 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 6.8,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 10 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 10 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 9.6,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 30 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 30 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 11.2,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 60 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 60 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 16.8,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 100 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 100 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 22.4,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 200 Go Bouygues Liberté',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 200 Go Bouygues Liberté.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 35.9,
    billingType: 'ONE_TIME',
  },

  // ── Recharge Data Mobile — Bouygues Fidélité ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 10 Go Bouygues Fidélité',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 10 Go Bouygues Fidélité.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 30 Go Bouygues Fidélité',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 30 Go Bouygues Fidélité.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 9.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 60 Go Bouygues Fidélité',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 60 Go Bouygues Fidélité.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 13.5,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 100 Go Bouygues Fidélité',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 100 Go Bouygues Fidélité.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 17.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 200 Go Bouygues Fidélité',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 200 Go Bouygues Fidélité.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 32.9,
    billingType: 'ONE_TIME',
  },

  // ── Recharge Data Mobile — Orange ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 1 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 1 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 4.4,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 10 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 10 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 6.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 30 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 30 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 7.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 60 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 60 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 11.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 100 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 100 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 17.5,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Mobile Recharge 200 Go Orange',
    semanticDescription: 'Dstny OpenSIM recharge data mobile 200 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'recharge',
    pricingType: 'FIXED',
    basePrice: 34.9,
    billingType: 'ONE_TIME',
  },

  // ── Matériel SIM ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM eSIM / Carte SIM',
    semanticDescription:
      'Dstny OpenSIM eSIM ou carte SIM physique. Frais uniques de mise en service.',
    unitType: 'UNIT',
    unitLabel: 'SIM',
    pricingType: 'FIXED',
    basePrice: 3.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Expédition SIM 1-10',
    semanticDescription: 'Dstny OpenSIM frais expédition lot de 1 à 10 cartes SIM.',
    unitType: 'UNIT',
    unitLabel: 'envoi',
    pricingType: 'FIXED',
    basePrice: 4.9,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Expédition SIM 11-999',
    semanticDescription: 'Dstny OpenSIM frais expédition lot de 11 à 999 cartes SIM.',
    unitType: 'UNIT',
    unitLabel: 'envoi',
    pricingType: 'FIXED',
    basePrice: 9.9,
    billingType: 'ONE_TIME',
  },

  // ── OpenSIM Internet — Orange ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 Go Orange',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 1 Go réseau Orange. Data uniquement pour routeurs 4G, tablettes, IoT.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 3.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 10 Go Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 10 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 6.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 50 Go Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 50 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 14.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 100 Go Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 100 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 23.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 200 Go Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 200 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 44.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 500 Go Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 500 Go réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 105.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 To Orange',
    semanticDescription: 'Dstny OpenSIM Internet forfait data fixe 1 To réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 210.0,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Internet — Bouygues Conquête ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 1 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 3.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 10 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 10 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 6.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 50 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 50 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 11.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 100 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 100 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 17.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 200 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 200 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 30.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 500 Go Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 500 Go réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 80.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 To Bouygues Conquête',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 1 To réseau Bouygues offre Conquête.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 150.0,
    billingType: 'RECURRING',
  },

  // ── OpenSIM Internet — Bouygues Liberté ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 1 Go réseau Bouygues offre Liberté sans engagement.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 4.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 10 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 10 Go réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 8.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 50 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 50 Go réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 15.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 100 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 100 Go réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 23.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 200 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 200 Go réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 39.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 500 Go Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 500 Go réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 87.2,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet 1 To Bouygues Liberté',
    semanticDescription:
      'Dstny OpenSIM Internet forfait data fixe 1 To réseau Bouygues offre Liberté.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 200.0,
    billingType: 'RECURRING',
  },

  // ── Options Internet ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet Option 5G Bouygues',
    semanticDescription: 'Dstny OpenSIM Internet option 5G réseau Bouygues. Offerte sans surcoût.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'FIXED',
    basePrice: 0.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet Option 5G Orange',
    semanticDescription: 'Dstny OpenSIM Internet option 5G réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'PER_UNIT',
    basePrice: 3.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet Premium',
    semanticDescription:
      'Dstny OpenSIM Internet option Premium pour débit prioritaire et qualité de service améliorée.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'PER_UNIT',
    basePrice: 2.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet Adresse IP Publique Fixe',
    semanticDescription:
      'Dstny OpenSIM Internet option adresse IP publique fixe pour accès distant, serveur, VPN.',
    unitType: 'LINE',
    unitLabel: 'connexion',
    pricingType: 'PER_UNIT',
    basePrice: 3.0,
    billingType: 'RECURRING',
  },

  // ── Dépassement Internet ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM Internet Dépassement Data',
    semanticDescription: 'Dstny OpenSIM Internet dépassement data hors forfait au Mo.',
    unitType: 'UNIT',
    unitLabel: 'Mo',
    pricingType: 'PER_UNIT',
    basePrice: 0.01,
    billingType: 'USAGE',
  },

  // ── M2M ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M 100 Mo + 100 SMS',
    semanticDescription:
      'Dstny OpenSIM M2M forfait machine-to-machine IoT 100 Mo et 100 SMS réseau Orange. Connectivité objets connectés.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'FIXED',
    basePrice: 2.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M 250 Mo + 100 SMS',
    semanticDescription: 'Dstny OpenSIM M2M forfait IoT 250 Mo et 100 SMS réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'FIXED',
    basePrice: 2.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M 500 Mo + 100 SMS',
    semanticDescription: 'Dstny OpenSIM M2M forfait IoT 500 Mo et 100 SMS réseau Orange.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'FIXED',
    basePrice: 3.5,
    billingType: 'RECURRING',
  },

  // ── Options M2M ──
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M Option 5G Orange',
    semanticDescription: 'Dstny OpenSIM M2M option 5G réseau Orange pour connectivité IoT.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'PER_UNIT',
    basePrice: 3.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M Internet Premium',
    semanticDescription: 'Dstny OpenSIM M2M option Internet Premium pour débit prioritaire IoT.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'PER_UNIT',
    basePrice: 2.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Téléphonie Mobile',
    name: 'Dstny OpenSIM M2M Adresse IP Publique Fixe',
    semanticDescription:
      'Dstny OpenSIM M2M option adresse IP publique fixe pour accès distant IoT.',
    unitType: 'LINE',
    unitLabel: 'SIM',
    pricingType: 'PER_UNIT',
    basePrice: 3.0,
    billingType: 'RECURRING',
  },
]

// ─── Dstny — Matériel ────────────────────────────────────────────────────────

const dstnyMaterielServices: ServiceData[] = [
  // Location routeurs
  {
    category: 'Matériel',
    name: 'Dstny Routeur Bewan (location)',
    semanticDescription: 'Dstny location routeur Bewan. Routeur réseau en location mensuelle.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 4.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2136AX (location)',
    semanticDescription: 'Dstny location routeur DrayTek Vigor 2136AX WiFi 6.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 8.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2136LAX (location)',
    semanticDescription: 'Dstny location routeur DrayTek Vigor 2136LAX WiFi 6 avec 4G LTE.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 12.5,
    billingType: 'RECURRING',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2927AX (location)',
    semanticDescription: 'Dstny location routeur DrayTek Vigor 2927AX double WAN WiFi 6.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 15.0,
    billingType: 'RECURRING',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2927LAX-5G (location)',
    semanticDescription:
      'Dstny location routeur DrayTek Vigor 2927LAX-5G double WAN WiFi 6 avec 5G.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 20.0,
    billingType: 'RECURRING',
  },
  // Achat routeurs
  {
    category: 'Matériel',
    name: 'Dstny Routeur Bewan (achat)',
    semanticDescription: 'Dstny achat routeur Bewan.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 149.0,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2136AX (achat)',
    semanticDescription: 'Dstny achat routeur DrayTek Vigor 2136AX WiFi 6.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 259.0,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2136LAX (achat)',
    semanticDescription: 'Dstny achat routeur DrayTek Vigor 2136LAX WiFi 6 4G LTE.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 329.0,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2927AX (achat)',
    semanticDescription: 'Dstny achat routeur DrayTek Vigor 2927AX double WAN WiFi 6.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 369.0,
    billingType: 'ONE_TIME',
  },
  {
    category: 'Matériel',
    name: 'Dstny Routeur DrayTek Vigor 2927LAX-5G (achat)',
    semanticDescription: 'Dstny achat routeur DrayTek Vigor 2927LAX-5G double WAN WiFi 6 5G.',
    unitType: 'UNIT',
    unitLabel: 'routeur',
    pricingType: 'FIXED',
    basePrice: 589.0,
    billingType: 'ONE_TIME',
  },
]

// ─── CSV Material Parser ─────────────────────────────────────────────────────

function parseCsvMateriel(filePath: string): ServiceData[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter((l) => l.trim())

  // Skip header
  const services: ServiceData[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';').map((p) => p.replace(/^"|"$/g, '').trim())
    // Format: "Référence";"Ref Fournisseur";"Nom du produit";"Prix Net";"Prix de référence";"EAN";"DEEE";"URL";"Unité"
    const name = parts[2]
    const prixNet = parseFloat(parts[3]?.replace(',', '.') || '0')

    if (!name || prixNet <= 0) continue

    services.push({
      category: 'Matériel',
      name: name.substring(0, 200), // Limit name length
      semanticDescription: `${name}. Matériel télécom/réseau, équipement professionnel. Prix unitaire HT.`,
      unitType: 'UNIT',
      unitLabel: 'pièce',
      pricingType: 'FIXED',
      basePrice: prixNet,
      billingType: 'ONE_TIME',
    })
  }

  return services
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateFakeEmbedding(): number[] {
  const embedding: number[] = []
  for (let i = 0; i < 1536; i++) {
    embedding.push((Math.random() - 0.5) * 2)
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map((val) => val / magnitude)
}

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function seedTarifs() {
  console.log('🏷️  Import des tarifs depuis le dossier data/...\n')

  // 1. Upsert categories
  const categoryMap = new Map<string, string>()

  for (const cat of categories) {
    let category = await prisma.category.findFirst({ where: { name: cat.name, deletedAt: null } })

    if (!category) {
      category = await prisma.category.create({ data: cat })
      console.log(`  ✅ Catégorie créée: ${cat.name}`)
    } else {
      console.log(`  ⏭️  Catégorie existante: ${cat.name}`)
    }

    categoryMap.set(cat.name, category.id)
  }

  // 2. Collect all services
  const allServices: ServiceData[] = [
    ...microsoft365Services,
    ...heimdalServices,
    ...cometServices,
    ...watStockageServices,
    ...dstnyUcaasServices,
    ...dstnyVoixServices,
    ...dstnyDataServices,
    ...dstnyCloudServices,
    ...dstnyMobileServices,
    ...dstnyMaterielServices,
  ]

  // 3. Parse CSV materials — find CSV files by scanning directory (avoids Unicode NFC/NFD issues)
  const dataDir = path.resolve(__dirname, '..', 'data')
  const csvFiles: string[] = []
  if (fs.existsSync(dataDir)) {
    for (const file of fs.readdirSync(dataDir)) {
      if (file.toLowerCase().endsWith('.csv')) {
        csvFiles.push(path.join(dataDir, file))
      }
    }
  }

  const seenCsvNames = new Set<string>()
  for (const csvFile of csvFiles) {
    if (fs.existsSync(csvFile)) {
      const csvServices = parseCsvMateriel(csvFile)
      for (const svc of csvServices) {
        if (!seenCsvNames.has(svc.name)) {
          seenCsvNames.add(svc.name)
          allServices.push(svc)
        }
      }
      console.log(`  📄 CSV parsé: ${path.basename(csvFile)} (${csvServices.length} produits)`)
    }
  }

  console.log(`\n📦 Total services à importer: ${allServices.length}\n`)

  // 4. Upsert services
  let created = 0
  let skipped = 0

  for (const svc of allServices) {
    const categoryId = categoryMap.get(svc.category)
    if (!categoryId) {
      console.log(`  ⚠️  Catégorie introuvable: ${svc.category} pour ${svc.name}`)
      continue
    }

    // Check if service already exists
    const existing = await prisma.service.findFirst({
      where: { name: svc.name, categoryId, deletedAt: null },
    })

    if (existing) {
      skipped++
      continue
    }

    // Generate fake embedding
    const embedding = generateFakeEmbedding()
    const embeddingStr = `[${embedding.join(',')}]`

    try {
      // Insert with raw SQL for vector field
      const result = await prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO services (
          id, "categoryId", name, "semanticDescription", "descriptionEmbedding",
          "unitType", "unitLabel", "pricingType", "basePrice", "billingType",
          "isActive", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          ${categoryId},
          ${svc.name},
          ${svc.semanticDescription},
          ${embeddingStr}::vector,
          ${svc.unitType}::"UnitType",
          ${svc.unitLabel},
          ${svc.pricingType}::"PricingType",
          ${svc.basePrice},
          ${svc.billingType}::"BillingType",
          true,
          NOW(),
          NOW()
        )
        RETURNING id
      `

      const serviceId = result[0].id

      // Create pricing tiers if any
      if (svc.pricingTiers && svc.pricingTiers.length > 0) {
        for (const tier of svc.pricingTiers) {
          await prisma.pricingTier.create({
            data: {
              serviceId,
              minQuantity: tier.minQuantity,
              maxQuantity: tier.maxQuantity,
              unitPrice: tier.unitPrice,
            },
          })
        }
      }

      created++
      if (created % 50 === 0) {
        console.log(`  ... ${created} services créés`)
      }
    } catch (error) {
      console.error(`  ❌ Erreur pour ${svc.name}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log(`\n🎉 Import terminé:`)
  console.log(`   ${categories.length} catégories`)
  console.log(`   ${created} services créés`)
  console.log(`   ${skipped} services déjà existants (ignorés)`)
  console.log(`\n💡 Pour générer les vrais embeddings:`)
  console.log(`   make docker-up-llm`)
  console.log(`   npx tsx prisma/regenerate-embeddings.ts`)
}

seedTarifs()
  .catch((e) => {
    console.error('❌ Import échoué:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
