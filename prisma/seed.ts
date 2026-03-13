import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
const { hash } = bcryptjs

const prisma = new PrismaClient()

// Embedding generation via LiteLLM
// Note: LITELLM_BASE_URL should point to the actual LiteLLM proxy (may differ from config if port conflicts)
const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4001'
const LITELLM_API_KEY = process.env.LITELLM_MASTER_KEY || ''

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${LITELLM_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LITELLM_API_KEY && { Authorization: `Bearer ${LITELLM_API_KEY}` }),
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as { data: Array<{ embedding: number[] }> }
    return data.data[0].embedding
  } catch {
    return null
  }
}

async function generateServiceEmbeddings(
  services: Array<{ id: string; semanticDescription: string }>,
): Promise<number> {
  let successCount = 0

  for (const service of services) {
    const embedding = await generateEmbedding(service.semanticDescription)
    if (embedding) {
      const embeddingStr = `[${embedding.join(',')}]`
      await prisma.$executeRawUnsafe(
        `UPDATE services SET "descriptionEmbedding" = $1::vector WHERE id = $2`,
        embeddingStr,
        service.id,
      )
      successCount++
    }
  }

  return successCount
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await prisma.proposalCustomization.deleteMany()
  await prisma.analysisSummary.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.analysis.deleteMany()
  await prisma.client.deleteMany()
  await prisma.pricingTier.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()

  // ==================== USER ====================
  console.log('👤 Creating user...')
  const hashedPassword = await hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'demo@albore.fr',
      password: hashedPassword,
      name: 'Richard Bertoncini',
      role: 'ADMIN',
    },
  })

  // ==================== CATEGORIES (3 catégories fixes) ====================
  console.log('📁 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Téléphonie',
        description: 'Forfaits mobiles, lignes fixes, internet, réseaux',
        icon: '📡',
        proposalGroup: 'TELECOM',
        displayOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Informatique',
        description: 'Cloud, hébergement, logiciels, licences, matériel',
        icon: '💻',
        proposalGroup: 'IT',
        displayOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Impression',
        description: 'Copieurs, imprimantes, consommables',
        icon: '🖨️',
        proposalGroup: 'PRINTING',
        displayOrder: 3,
      },
    }),
  ])

  const [catTelecom, catIT, catImpression] = categories

  // ==================== SERVICES ====================
  console.log('🛠️ Creating services...')

  // --- Téléphonie Mobile ---
  const servicesMobile = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Forfait Mobile 1Go',
        semanticDescription: 'Forfait mobile avec appels, SMS, MMS illimités et 1Go de data',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'PER_UNIT',
        basePrice: 4.9,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Forfait Mobile 10Go',
        semanticDescription: 'Forfait mobile avec appels, SMS, MMS illimités et 10Go de data',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'PER_UNIT',
        basePrice: 7.9,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Forfait Mobile 30Go',
        semanticDescription: 'Forfait mobile avec appels, SMS, MMS illimités et 30Go de data',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'PER_UNIT',
        basePrice: 9.9,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Forfait Mobile 60Go',
        semanticDescription: 'Forfait mobile avec appels, SMS, MMS illimités et 60Go de data',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'PER_UNIT',
        basePrice: 13.5,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Forfait Mobile 100Go',
        semanticDescription: 'Forfait mobile avec appels, SMS, MMS illimités et 100Go de data',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'PER_UNIT',
        basePrice: 17.9,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Option 5G',
        semanticDescription: 'Option 5G pour forfait mobile',
        unitType: 'LINE',
        unitLabel: 'ligne',
        pricingType: 'FIXED',
        basePrice: 0,
        billingType: 'RECURRING',
      },
    }),
  ])

  // --- Téléphonie Fixe ---
  const servicesFixe = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Ligne SIP Trunk',
        semanticDescription: 'Ligne téléphonique SIP pour standard téléphonique',
        unitType: 'LINE',
        unitLabel: 'canal',
        pricingType: 'PER_UNIT',
        basePrice: 3.5,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Numéro géographique',
        semanticDescription: 'Numéro de téléphone fixe géographique (01, 02, 03, 04, 05)',
        unitType: 'UNIT',
        unitLabel: 'numéro',
        pricingType: 'FIXED',
        basePrice: 1.5,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Standard téléphonique cloud',
        semanticDescription: 'IPBX cloud avec fonctionnalités avancées',
        unitType: 'USER',
        unitLabel: 'utilisateur',
        pricingType: 'PER_UNIT',
        basePrice: 12.9,
        billingType: 'RECURRING',
      },
    }),
  ])

  // --- Internet ---
  const servicesInternet = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Fibre Entreprise 100Mb',
        semanticDescription: 'Connexion fibre optique entreprise 100Mb symétrique avec GTR 4h',
        unitType: 'UNIT',
        unitLabel: 'accès',
        pricingType: 'FIXED',
        basePrice: 89.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Fibre Entreprise 500Mb',
        semanticDescription: 'Connexion fibre optique entreprise 500Mb symétrique avec GTR 4h',
        unitType: 'UNIT',
        unitLabel: 'accès',
        pricingType: 'FIXED',
        basePrice: 149.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: 'Fibre Entreprise 1Gb',
        semanticDescription: 'Connexion fibre optique entreprise 1Gb symétrique avec GTR 4h',
        unitType: 'UNIT',
        unitLabel: 'accès',
        pricingType: 'FIXED',
        basePrice: 249.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catTelecom.id,
        name: '4G/5G Backup 100Go',
        semanticDescription: 'Connexion 4G/5G de secours avec 100Go de data',
        unitType: 'UNIT',
        unitLabel: 'accès',
        pricingType: 'FIXED',
        basePrice: 29.0,
        billingType: 'RECURRING',
      },
    }),
  ])

  // --- Cloud ---
  const servicesCloud = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Serveur Cloud Standard',
        semanticDescription: 'Machine virtuelle 2 vCPU, 4Go RAM, 100Go SSD',
        unitType: 'UNIT',
        unitLabel: 'VM',
        pricingType: 'FIXED',
        basePrice: 49.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'VPS Performance 2 vCPU',
        semanticDescription:
          'VPS Performance serveur virtuel haute performance 2 vCPU, 4Go RAM, SSD NVMe',
        unitType: 'UNIT',
        unitLabel: 'VPS',
        pricingType: 'FIXED',
        basePrice: 29.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'VPS Performance 4 vCPU',
        semanticDescription:
          'VPS Performance serveur virtuel haute performance 4 vCPU, 8Go RAM, SSD NVMe',
        unitType: 'UNIT',
        unitLabel: 'VPS',
        pricingType: 'FIXED',
        basePrice: 49.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'VPS Performance 8 vCPU',
        semanticDescription:
          'VPS Performance serveur virtuel haute performance 8 vCPU, 16Go RAM, SSD NVMe',
        unitType: 'UNIT',
        unitLabel: 'VPS',
        pricingType: 'FIXED',
        basePrice: 89.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Stockage Cloud 1To',
        semanticDescription: 'Espace de stockage cloud sécurisé 1To',
        unitType: 'UNIT',
        unitLabel: 'To',
        pricingType: 'PER_UNIT',
        basePrice: 25.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Backup Cloud',
        semanticDescription: 'Sauvegarde automatisée vers le cloud',
        unitType: 'UNIT',
        unitLabel: 'serveur',
        pricingType: 'PER_UNIT',
        basePrice: 35.0,
        billingType: 'RECURRING',
      },
    }),
  ])

  // --- Logiciels ---
  const servicesLogiciels = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Microsoft 365 Business Basic',
        semanticDescription: 'Suite Microsoft 365 avec Exchange, Teams, SharePoint online',
        unitType: 'USER',
        unitLabel: 'utilisateur',
        pricingType: 'PER_UNIT',
        basePrice: 5.6,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Microsoft 365 Business Standard',
        semanticDescription: 'Suite Microsoft 365 complète avec applications desktop',
        unitType: 'USER',
        unitLabel: 'utilisateur',
        pricingType: 'PER_UNIT',
        basePrice: 11.7,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catIT.id,
        name: 'Antivirus Endpoint',
        semanticDescription: 'Protection antivirus et anti-malware pour poste de travail',
        unitType: 'DEVICE',
        unitLabel: 'poste',
        pricingType: 'PER_UNIT',
        basePrice: 3.5,
        billingType: 'RECURRING',
      },
    }),
  ])

  // --- Impression ---
  const servicesImpression = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: catImpression.id,
        name: 'Copieur A4 N&B',
        semanticDescription: 'Location copieur A4 noir et blanc 30 pages/minute',
        unitType: 'DEVICE',
        unitLabel: 'copieur',
        pricingType: 'FIXED',
        basePrice: 45.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catImpression.id,
        name: 'Copieur A3 Couleur',
        semanticDescription: 'Location copieur A3 couleur 45 pages/minute',
        unitType: 'DEVICE',
        unitLabel: 'copieur',
        pricingType: 'FIXED',
        basePrice: 89.0,
        billingType: 'RECURRING',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catImpression.id,
        name: 'Page N&B',
        semanticDescription: 'Coût à la page noir et blanc',
        unitType: 'UNIT',
        unitLabel: 'page',
        pricingType: 'PER_UNIT',
        basePrice: 0.008,
        billingType: 'USAGE',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catImpression.id,
        name: 'Page Couleur',
        semanticDescription: 'Coût à la page couleur',
        unitType: 'UNIT',
        unitLabel: 'page',
        pricingType: 'PER_UNIT',
        basePrice: 0.045,
        billingType: 'USAGE',
      },
    }),
  ])

  // ==================== CLIENTS ====================
  console.log('🏢 Creating clients...')
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'COTAL Groupe',
        company: 'COTAL GROUPE SAS',
        contactEmail: 'contact@cotal-groupe.fr',
        notes: 'Client historique, flotte mobile importante',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Pharmacie du Port',
        company: 'PHARMACIE DU PORT SARL',
        contactEmail: 'direction@pharmacieduport.fr',
        notes: 'PME santé, besoin telecom + IT',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Restaurant Le Mistral',
        company: 'LE MISTRAL EURL',
        contactEmail: 'lemistral@orange.fr',
        notes: 'TPE restauration',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Cabinet Architectes Méditerranée',
        company: 'CAM ARCHITECTES',
        contactEmail: 'agence@cam-archi.fr',
        notes: 'Cabinet architecture, besoins cloud et impression',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Transport Express Corse',
        company: 'TEC TRANSPORT SAS',
        contactEmail: 'direction@tec-transport.fr',
        notes: 'Flotte véhicules avec besoin M2M',
      },
    }),
  ])

  const [cotal, pharmacie, restaurant, cabinet, transport] = clients

  // ==================== ANALYSES ====================
  console.log('📊 Creating analyses...')

  // --- 1. Analyse DRAFT (juste créée) ---
  await prisma.analysis.create({
    data: {
      clientId: restaurant.id,
      name: 'Audit Telecom 2024',
      status: 'DRAFT',
      notes: 'En attente des factures du client',
    },
  })

  // --- 2. Analyse IMPORTING (avec factures en cours) ---
  const analysisImporting = await prisma.analysis.create({
    data: {
      clientId: transport.id,
      name: 'Analyse Flotte Mobile Q1 2024',
      status: 'IMPORTING',
      notes: 'Import des factures SFR en cours',
    },
  })

  await prisma.invoice.create({
    data: {
      analysisId: analysisImporting.id,
      vendorName: 'SFR Entreprises',
      invoiceNumber: 'SFR-2024-001',
      invoiceDate: new Date('2024-01-15'),
      totalHt: 1250.0,
      filePath: '/uploads/sfr-2024-001.pdf',
      fileName: 'sfr-2024-001.pdf',
      extractionStatus: 'PROCESSING',
    },
  })

  // --- 3. Analyse MATCHING (lignes à assigner) ---
  const analysisMatching = await prisma.analysis.create({
    data: {
      clientId: pharmacie.id,
      name: 'Optimisation Telecom & IT',
      status: 'MATCHING',
    },
  })

  const invoiceMatching = await prisma.invoice.create({
    data: {
      analysisId: analysisMatching.id,
      vendorName: 'Orange Business',
      invoiceNumber: 'OBS-2024-0234',
      invoiceDate: new Date('2024-02-01'),
      totalHt: 856.4,
      filePath: '/uploads/orange-0234.pdf',
      fileName: 'orange-0234.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  // Lignes avec différents statuts de matching
  await Promise.all([
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceMatching.id,
        description: 'Forfait mobile illimité 50Go - Ligne 06 12 34 56 78',
        quantity: 1,
        unitPrice: 35.0,
        totalHt: 35.0,
        matchStatus: 'AUTO',
        matchedServiceId: servicesMobile[3].id,
        matchConfidence: 0.85,
        matchCandidates: [
          { serviceId: servicesMobile[3].id, serviceName: 'Forfait Mobile 60Go', score: 0.85 },
          { serviceId: servicesMobile[2].id, serviceName: 'Forfait Mobile 30Go', score: 0.65 },
        ],
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceMatching.id,
        description: 'Forfait mobile 30Go - Ligne 06 98 76 54 32',
        quantity: 1,
        unitPrice: 28.0,
        totalHt: 28.0,
        matchStatus: 'PENDING',
        matchCandidates: [
          { serviceId: servicesMobile[2].id, serviceName: 'Forfait Mobile 30Go', score: 0.92 },
          { serviceId: servicesMobile[1].id, serviceName: 'Forfait Mobile 10Go', score: 0.45 },
        ],
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceMatching.id,
        description: 'Accès Internet Fibre Pro 200Mb',
        quantity: 1,
        unitPrice: 129.0,
        totalHt: 129.0,
        matchStatus: 'PENDING',
        matchCandidates: [
          { serviceId: servicesInternet[1].id, serviceName: 'Fibre Entreprise 500Mb', score: 0.78 },
          { serviceId: servicesInternet[0].id, serviceName: 'Fibre Entreprise 100Mb', score: 0.72 },
        ],
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceMatching.id,
        description: 'Microsoft 365 E3 x 5 users',
        quantity: 5,
        unitPrice: 34.4,
        totalHt: 172.0,
        matchStatus: 'PENDING',
        matchCandidates: [],
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceMatching.id,
        description: 'Frais de mise en service',
        quantity: 1,
        unitPrice: 50.0,
        totalHt: 50.0,
        matchStatus: 'IGNORED',
      },
    }),
  ])

  // --- 4. Analyse REVIEW (consolidée, en révision) ---
  const analysisReview = await prisma.analysis.create({
    data: {
      clientId: cabinet.id,
      name: 'Audit Global IT & Print',
      status: 'REVIEW',
    },
  })

  const invoiceReview1 = await prisma.invoice.create({
    data: {
      analysisId: analysisReview.id,
      vendorName: 'Bouygues Telecom Entreprises',
      invoiceNumber: 'BTE-2024-0089',
      invoiceDate: new Date('2024-01-15'),
      totalHt: 445.6,
      filePath: '/uploads/bte-0089.pdf',
      fileName: 'bte-0089.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  const invoiceReview2 = await prisma.invoice.create({
    data: {
      analysisId: analysisReview.id,
      vendorName: 'Canon France',
      invoiceNumber: 'CANON-2024-1234',
      invoiceDate: new Date('2024-01-20'),
      totalHt: 389.0,
      filePath: '/uploads/canon-1234.pdf',
      fileName: 'canon-1234.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  // Lignes matchées
  await Promise.all([
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview1.id,
        description: 'Forfait mobile Pro 60Go x 4 lignes',
        quantity: 4,
        unitPrice: 42.0,
        totalHt: 168.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesMobile[3].id,
        matchConfidence: 0.95,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview1.id,
        description: 'Forfait mobile Pro 30Go x 2 lignes',
        quantity: 2,
        unitPrice: 32.0,
        totalHt: 64.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesMobile[2].id,
        matchConfidence: 0.92,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview1.id,
        description: 'Accès Fibre FTTO 500Mb',
        quantity: 1,
        unitPrice: 189.0,
        totalHt: 189.0,
        matchStatus: 'MANUAL',
        matchedServiceId: servicesInternet[1].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview2.id,
        description: 'Location copieur iR-ADV C3530i',
        quantity: 1,
        unitPrice: 125.0,
        totalHt: 125.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesImpression[1].id,
        matchConfidence: 0.88,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview2.id,
        description: 'Pages N&B (12 500 copies)',
        quantity: 12500,
        unitPrice: 0.012,
        totalHt: 150.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesImpression[2].id,
        matchConfidence: 0.95,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceReview2.id,
        description: 'Pages Couleur (2 800 copies)',
        quantity: 2800,
        unitPrice: 0.065,
        totalHt: 182.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesImpression[3].id,
        matchConfidence: 0.94,
      },
    }),
  ])

  // Summaries pour l'analyse REVIEW
  await Promise.all([
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesMobile[3].id,
        monthsCount: 3,
        totalHt: 504.0,
        avgMonthly: 168.0,
        minMonthly: 168.0,
        maxMonthly: 168.0,
        avgQuantity: 4,
        avgUnitPrice: 42.0,
        ourPrice: 13.5,
        savingAmount: 114.0,
        savingPercent: 67.86,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesMobile[2].id,
        monthsCount: 3,
        totalHt: 192.0,
        avgMonthly: 64.0,
        minMonthly: 64.0,
        maxMonthly: 64.0,
        avgQuantity: 2,
        avgUnitPrice: 32.0,
        ourPrice: 9.9,
        savingAmount: 44.2,
        savingPercent: 69.06,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesInternet[1].id,
        monthsCount: 3,
        totalHt: 567.0,
        avgMonthly: 189.0,
        minMonthly: 189.0,
        maxMonthly: 189.0,
        avgQuantity: 1,
        avgUnitPrice: 189.0,
        ourPrice: 149.0,
        savingAmount: 40.0,
        savingPercent: 21.16,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesImpression[1].id,
        monthsCount: 3,
        totalHt: 375.0,
        avgMonthly: 125.0,
        minMonthly: 125.0,
        maxMonthly: 125.0,
        avgQuantity: 1,
        avgUnitPrice: 125.0,
        ourPrice: 89.0,
        savingAmount: 36.0,
        savingPercent: 28.8,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesImpression[2].id,
        monthsCount: 3,
        totalHt: 450.0,
        avgMonthly: 150.0,
        minMonthly: 140.0,
        maxMonthly: 160.0,
        avgQuantity: 12500,
        avgUnitPrice: 0.012,
        ourPrice: 0.008,
        savingAmount: 50.0,
        savingPercent: 33.33,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisReview.id,
        matchedServiceId: servicesImpression[3].id,
        monthsCount: 3,
        totalHt: 546.0,
        avgMonthly: 182.0,
        minMonthly: 170.0,
        maxMonthly: 195.0,
        avgQuantity: 2800,
        avgUnitPrice: 0.065,
        ourPrice: 0.045,
        savingAmount: 56.0,
        savingPercent: 30.77,
      },
    }),
  ])

  // --- 5. Analyse COMPLETED (tout finalisé avec personnalisations) ---
  const analysisCompleted = await prisma.analysis.create({
    data: {
      clientId: cotal.id,
      name: 'Audit Telecom Complet 2024',
      status: 'COMPLETED',
      notes: 'Analyse finalisée, proposition envoyée au client',
    },
  })

  const invoiceCompleted1 = await prisma.invoice.create({
    data: {
      analysisId: analysisCompleted.id,
      vendorName: 'SFR Business',
      invoiceNumber: 'SFR-2024-0456',
      invoiceDate: new Date('2024-01-05'),
      totalHt: 2890.0,
      filePath: '/uploads/sfr-0456.pdf',
      fileName: 'sfr-0456.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  await prisma.invoice.create({
    data: {
      analysisId: analysisCompleted.id,
      vendorName: 'SFR Business',
      invoiceNumber: 'SFR-2024-0457',
      invoiceDate: new Date('2024-02-05'),
      totalHt: 2945.0,
      filePath: '/uploads/sfr-0457.pdf',
      fileName: 'sfr-0457.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  const invoiceCompleted3 = await prisma.invoice.create({
    data: {
      analysisId: analysisCompleted.id,
      vendorName: 'OVH Cloud',
      invoiceNumber: 'OVH-2024-789',
      invoiceDate: new Date('2024-01-10'),
      totalHt: 456.0,
      filePath: '/uploads/ovh-789.pdf',
      fileName: 'ovh-789.pdf',
      extractionStatus: 'COMPLETED',
    },
  })

  // Lignes pour analyse complète
  await Promise.all([
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Forfait RED Pro 100Go x 15 lignes',
        quantity: 15,
        unitPrice: 45.0,
        totalHt: 675.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesMobile[4].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Forfait RED Pro 60Go x 25 lignes',
        quantity: 25,
        unitPrice: 35.0,
        totalHt: 875.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesMobile[3].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Forfait RED Pro 30Go x 10 lignes',
        quantity: 10,
        unitPrice: 25.0,
        totalHt: 250.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesMobile[2].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Trunk SIP 10 canaux',
        quantity: 10,
        unitPrice: 8.5,
        totalHt: 85.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesFixe[0].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Numéros SDA',
        quantity: 50,
        unitPrice: 2.5,
        totalHt: 125.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesFixe[1].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Fibre Dédiée 1Gb + GTR 4h',
        quantity: 1,
        unitPrice: 450.0,
        totalHt: 450.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesInternet[2].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted1.id,
        description: 'Backup 4G 100Go',
        quantity: 1,
        unitPrice: 45.0,
        totalHt: 45.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesInternet[3].id,
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted3.id,
        description: 'VPS Performance 4 vCPU 8Go',
        quantity: 2,
        unitPrice: 89.0,
        totalHt: 178.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesCloud[2].id, // VPS Performance 4 vCPU
      },
    }),
    prisma.invoiceLine.create({
      data: {
        invoiceId: invoiceCompleted3.id,
        description: 'Object Storage 5To',
        quantity: 5,
        unitPrice: 45.0,
        totalHt: 225.0,
        matchStatus: 'CONFIRMED',
        matchedServiceId: servicesCloud[4].id, // Stockage Cloud 1To
      },
    }),
  ])

  // Summaries pour analyse COMPLETED
  await Promise.all([
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesMobile[4].id,
        monthsCount: 2,
        totalHt: 1350.0,
        avgMonthly: 675.0,
        minMonthly: 675.0,
        maxMonthly: 675.0,
        avgQuantity: 15,
        avgUnitPrice: 45.0,
        ourPrice: 17.9,
        savingAmount: 406.5,
        savingPercent: 60.22,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesMobile[3].id,
        monthsCount: 2,
        totalHt: 1750.0,
        avgMonthly: 875.0,
        minMonthly: 875.0,
        maxMonthly: 875.0,
        avgQuantity: 25,
        avgUnitPrice: 35.0,
        ourPrice: 13.5,
        savingAmount: 537.5,
        savingPercent: 61.43,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesMobile[2].id,
        monthsCount: 2,
        totalHt: 500.0,
        avgMonthly: 250.0,
        minMonthly: 250.0,
        maxMonthly: 250.0,
        avgQuantity: 10,
        avgUnitPrice: 25.0,
        ourPrice: 9.9,
        savingAmount: 151.0,
        savingPercent: 60.4,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesFixe[0].id,
        monthsCount: 2,
        totalHt: 170.0,
        avgMonthly: 85.0,
        minMonthly: 85.0,
        maxMonthly: 85.0,
        avgQuantity: 10,
        avgUnitPrice: 8.5,
        ourPrice: 3.5,
        savingAmount: 50.0,
        savingPercent: 58.82,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesFixe[1].id,
        monthsCount: 2,
        totalHt: 250.0,
        avgMonthly: 125.0,
        minMonthly: 125.0,
        maxMonthly: 125.0,
        avgQuantity: 50,
        avgUnitPrice: 2.5,
        ourPrice: 1.5,
        savingAmount: 50.0,
        savingPercent: 40.0,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesInternet[2].id,
        monthsCount: 2,
        totalHt: 900.0,
        avgMonthly: 450.0,
        minMonthly: 450.0,
        maxMonthly: 450.0,
        avgQuantity: 1,
        avgUnitPrice: 450.0,
        ourPrice: 249.0,
        savingAmount: 201.0,
        savingPercent: 44.67,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesInternet[3].id,
        monthsCount: 2,
        totalHt: 90.0,
        avgMonthly: 45.0,
        minMonthly: 45.0,
        maxMonthly: 45.0,
        avgQuantity: 1,
        avgUnitPrice: 45.0,
        ourPrice: 29.0,
        savingAmount: 16.0,
        savingPercent: 35.56,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesCloud[2].id, // VPS Performance 4 vCPU
        monthsCount: 2,
        totalHt: 356.0,
        avgMonthly: 178.0,
        minMonthly: 178.0,
        maxMonthly: 178.0,
        avgQuantity: 2,
        avgUnitPrice: 89.0,
        ourPrice: 49.0,
        savingAmount: 80.0,
        savingPercent: 44.94,
      },
    }),
    prisma.analysisSummary.create({
      data: {
        analysisId: analysisCompleted.id,
        matchedServiceId: servicesCloud[4].id, // Stockage Cloud 1To
        monthsCount: 2,
        totalHt: 450.0,
        avgMonthly: 225.0,
        minMonthly: 225.0,
        maxMonthly: 225.0,
        avgQuantity: 5,
        avgUnitPrice: 45.0,
        ourPrice: 25.0,
        savingAmount: 100.0,
        savingPercent: 44.44,
      },
    }),
  ])

  // Personnalisations de proposition pour analyse COMPLETED
  await Promise.all([
    prisma.proposalCustomization.create({
      data: {
        analysisId: analysisCompleted.id,
        sectionKey: 'presentation-intro',
        customText: `Albore Group est fier d'accompagner COTAL Groupe dans l'optimisation de ses dépenses télécoms et IT. Fort de notre expertise en tant que second opérateur télécom en Corse, nous mettons à votre disposition des solutions sur-mesure adaptées à vos besoins spécifiques.`,
      },
    }),
    prisma.proposalCustomization.create({
      data: {
        analysisId: analysisCompleted.id,
        sectionKey: 'telecom-analysis',
        customText: `L'analyse de votre flotte mobile révèle un potentiel d'optimisation significatif. Avec 50 lignes actives, nous avons identifié des forfaits surdimensionnés par rapport aux usages réels. Notre proposition s'appuie sur une analyse fine de vos consommations sur les 3 derniers mois.`,
      },
    }),
    prisma.proposalCustomization.create({
      data: {
        analysisId: analysisCompleted.id,
        sectionKey: 'telecom-recommendation',
        customText: `Nous recommandons une migration vers nos forfaits OpenSIM avec engagement 24 mois pour bénéficier des meilleurs tarifs. La transition sera réalisée sans coupure de service grâce à notre processus de portabilité optimisé.`,
      },
    }),
    prisma.proposalCustomization.create({
      data: {
        analysisId: analysisCompleted.id,
        sectionKey: 'it-analysis',
        customText: `Votre infrastructure cloud actuelle chez OVH présente des coûts optimisables. Les ressources provisionnées sont supérieures aux besoins réels, et les options de backup ne sont pas optimales.`,
      },
    }),
  ])

  // ==================== EMBEDDINGS ====================
  const allServices = [
    ...servicesMobile,
    ...servicesFixe,
    ...servicesInternet,
    ...servicesCloud,
    ...servicesLogiciels,
    ...servicesImpression,
  ]

  console.log('🧠 Generating embeddings for services...')
  const embeddingsGenerated = await generateServiceEmbeddings(allServices)

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📝 Summary:')
  console.log('   - 1 user (demo@albore.fr / password123)')
  console.log('   - 3 categories')
  console.log(`   - ${allServices.length} services`)
  if (embeddingsGenerated > 0) {
    console.log(`   - ${embeddingsGenerated}/${allServices.length} embeddings generated`)
  } else {
    console.log('   - ⚠️  No embeddings generated (LiteLLM not available?)')
  }
  console.log('   - 5 clients')
  console.log('   - 5 analyses (1 DRAFT, 1 IMPORTING, 1 MATCHING, 1 REVIEW, 1 COMPLETED)')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
