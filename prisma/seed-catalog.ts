import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Catalogue de services télécom/IT typiques
const catalogData = {
  categories: [
    {
      name: 'Téléphonie',
      description: 'Forfaits mobiles, lignes fixes, internet, réseaux',
      icon: 'phone',
      proposalGroup: 'TELECOM' as const,
      displayOrder: 1,
    },
    {
      name: 'Informatique',
      description: 'Cloud, hébergement, logiciels, licences, matériel',
      icon: 'monitor',
      proposalGroup: 'IT' as const,
      displayOrder: 2,
    },
    {
      name: 'Impression',
      description: "Solutions d'impression et de reprographie",
      icon: 'printer',
      proposalGroup: 'PRINTING' as const,
      displayOrder: 3,
    },
  ],
  services: [
    // Téléphonie
    {
      category: 'Téléphonie',
      name: 'Forfait Mobile Entreprise',
      semanticDescription:
        'Forfait téléphonie mobile professionnel avec appels illimités, SMS/MMS illimités et data 4G/5G. Inclut roaming Europe et options professionnelles.',
      unitType: 'LINE' as const,
      unitLabel: 'ligne',
      pricingType: 'FIXED' as const,
      basePrice: 25.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Forfait Mobile Data Only',
      semanticDescription:
        'Forfait data uniquement pour tablettes et objets connectés. Carte SIM data 4G/5G sans voix ni SMS.',
      unitType: 'LINE' as const,
      unitLabel: 'carte SIM',
      pricingType: 'FIXED' as const,
      basePrice: 15.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Option Internationale',
      semanticDescription:
        'Option roaming international hors Europe. Appels et data depuis étranger, zone internationale, voyage professionnel.',
      unitType: 'LINE' as const,
      unitLabel: 'option',
      pricingType: 'FIXED' as const,
      basePrice: 10.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Ligne Fixe Analogique',
      semanticDescription:
        'Ligne téléphonique fixe analogique classique RTC. Abonnement ligne fixe traditionnelle avec numéro géographique.',
      unitType: 'LINE' as const,
      unitLabel: 'ligne',
      pricingType: 'FIXED' as const,
      basePrice: 18.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Trunk SIP',
      semanticDescription:
        'Trunk SIP pour IPBX et standard téléphonique IP. Canaux voix simultanés, numéros SDA, portabilité.',
      unitType: 'LINE' as const,
      unitLabel: 'canal',
      pricingType: 'PER_UNIT' as const,
      basePrice: 5.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Standard Téléphonique Cloud',
      semanticDescription:
        'Standard téléphonique hébergé dans le cloud. IPBX cloud, Centrex IP, téléphonie cloud entreprise avec fonctions avancées.',
      unitType: 'USER' as const,
      unitLabel: 'utilisateur',
      pricingType: 'PER_UNIT' as const,
      basePrice: 12.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'Fibre Optique Entreprise',
      semanticDescription:
        'Accès internet fibre optique professionnelle FTTH/FTTO. Connexion haut débit symétrique avec GTR et IP fixe.',
      unitType: 'UNIT' as const,
      unitLabel: 'accès',
      pricingType: 'FIXED' as const,
      basePrice: 89.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'SDSL',
      semanticDescription:
        'Liaison SDSL symétrique dédiée. Accès internet garanti avec débit symétrique et SLA professionnel.',
      unitType: 'UNIT' as const,
      unitLabel: 'accès',
      pricingType: 'FIXED' as const,
      basePrice: 150.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'VPN MPLS',
      semanticDescription:
        'Réseau privé virtuel MPLS multi-sites. Interconnexion de sites, réseau privé entreprise, VPN managé.',
      unitType: 'UNIT' as const,
      unitLabel: 'site',
      pricingType: 'PER_UNIT' as const,
      basePrice: 200.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Téléphonie',
      name: 'SD-WAN',
      semanticDescription:
        'Solution SD-WAN pour réseau étendu. Routage intelligent, agrégation de liens, overlay réseau software-defined.',
      unitType: 'UNIT' as const,
      unitLabel: 'site',
      pricingType: 'PER_UNIT' as const,
      basePrice: 150.0,
      billingType: 'RECURRING' as const,
    },
    // Informatique
    {
      category: 'Informatique',
      name: 'Serveur Virtuel VPS',
      semanticDescription:
        'Serveur virtuel privé VPS cloud. Machine virtuelle hébergée avec CPU, RAM et stockage SSD dédiés.',
      unitType: 'UNIT' as const,
      unitLabel: 'VM',
      pricingType: 'PER_UNIT' as const,
      basePrice: 30.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Serveur Dédié',
      semanticDescription:
        'Serveur physique dédié en datacenter. Bare metal server avec ressources exclusives et administration root.',
      unitType: 'UNIT' as const,
      unitLabel: 'serveur',
      pricingType: 'FIXED' as const,
      basePrice: 200.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Stockage Cloud',
      semanticDescription:
        'Stockage objet cloud S3 compatible. Espace de stockage en ligne, backup cloud, archivage données.',
      unitType: 'UNIT' as const,
      unitLabel: 'Go',
      pricingType: 'PER_UNIT' as const,
      basePrice: 0.02,
      billingType: 'USAGE' as const,
    },
    {
      category: 'Informatique',
      name: 'Sauvegarde Cloud',
      semanticDescription:
        'Service de sauvegarde externalisée cloud. Backup automatique, rétention, restauration, plan de reprise.',
      unitType: 'UNIT' as const,
      unitLabel: 'Go',
      pricingType: 'PER_UNIT' as const,
      basePrice: 0.05,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Microsoft 365 Business',
      semanticDescription:
        'Licence Microsoft 365 Business. Suite Office cloud avec Exchange, Teams, SharePoint, OneDrive. Abonnement Microsoft Office 365.',
      unitType: 'USER' as const,
      unitLabel: 'utilisateur',
      pricingType: 'PER_UNIT' as const,
      basePrice: 12.5,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Google Workspace',
      semanticDescription:
        'Licence Google Workspace entreprise. Gmail professionnel, Drive, Meet, Docs, Sheets. G Suite business.',
      unitType: 'USER' as const,
      unitLabel: 'utilisateur',
      pricingType: 'PER_UNIT' as const,
      basePrice: 10.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Antivirus Endpoint',
      semanticDescription:
        'Protection antivirus et endpoint security. Sécurité poste de travail, anti-malware, EDR, protection endpoint.',
      unitType: 'DEVICE' as const,
      unitLabel: 'poste',
      pricingType: 'PER_UNIT' as const,
      basePrice: 3.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Visioconférence Pro',
      semanticDescription:
        'Solution de visioconférence professionnelle. Réunions vidéo, webinars, collaboration à distance. Zoom, Teams, Webex.',
      unitType: 'USER' as const,
      unitLabel: 'licence',
      pricingType: 'PER_UNIT' as const,
      basePrice: 15.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Informatique',
      name: 'Téléphone IP',
      semanticDescription:
        'Téléphone IP de bureau fixe. Poste téléphonique SIP, téléphone VoIP professionnel avec écran et touches programmables.',
      unitType: 'UNIT' as const,
      unitLabel: 'poste',
      pricingType: 'FIXED' as const,
      basePrice: 150.0,
      billingType: 'ONE_TIME' as const,
    },
    {
      category: 'Informatique',
      name: 'Routeur Entreprise',
      semanticDescription:
        'Routeur professionnel entreprise. Équipement réseau, firewall intégré, routeur managé avec support.',
      unitType: 'UNIT' as const,
      unitLabel: 'équipement',
      pricingType: 'FIXED' as const,
      basePrice: 500.0,
      billingType: 'ONE_TIME' as const,
    },
    {
      category: 'Informatique',
      name: 'Switch Réseau',
      semanticDescription:
        'Switch réseau Ethernet managé. Commutateur réseau PoE, switch gigabit pour infrastructure LAN.',
      unitType: 'UNIT' as const,
      unitLabel: 'équipement',
      pricingType: 'FIXED' as const,
      basePrice: 300.0,
      billingType: 'ONE_TIME' as const,
    },
    {
      category: 'Informatique',
      name: 'Borne WiFi',
      semanticDescription:
        'Point accès WiFi professionnel. Borne WiFi entreprise, access point sans fil, couverture wireless.',
      unitType: 'UNIT' as const,
      unitLabel: 'borne',
      pricingType: 'FIXED' as const,
      basePrice: 250.0,
      billingType: 'ONE_TIME' as const,
    },
    // Impression
    {
      category: 'Impression',
      name: 'Location Copieur Multifonction',
      semanticDescription:
        'Location de copieur multifonction professionnel. Imprimante scanner photocopieuse A3/A4 avec maintenance incluse.',
      unitType: 'UNIT' as const,
      unitLabel: 'copieur',
      pricingType: 'FIXED' as const,
      basePrice: 150.0,
      billingType: 'RECURRING' as const,
    },
    {
      category: 'Impression',
      name: 'Coût à la Page',
      semanticDescription:
        'Facturation à la page pour impression et copie. Coût par page noir et blanc ou couleur, consommables inclus.',
      unitType: 'UNIT' as const,
      unitLabel: 'page',
      pricingType: 'PER_UNIT' as const,
      basePrice: 0.02,
      billingType: 'USAGE' as const,
    },
    {
      category: 'Impression',
      name: 'Imprimante Réseau',
      semanticDescription:
        'Imprimante laser réseau professionnelle. Impression rapide recto-verso avec connexion Ethernet et WiFi.',
      unitType: 'UNIT' as const,
      unitLabel: 'imprimante',
      pricingType: 'FIXED' as const,
      basePrice: 80.0,
      billingType: 'RECURRING' as const,
    },
  ],
}

// Génère un embedding aléatoire de dimension 1536 (comme OpenAI ada-002)
function generateFakeEmbedding(): number[] {
  const embedding: number[] = []
  for (let i = 0; i < 1536; i++) {
    embedding.push((Math.random() - 0.5) * 2) // Valeurs entre -1 et 1
  }
  // Normaliser le vecteur
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map((val) => val / magnitude)
}

async function seedCatalog() {
  console.log('🏷️  Seeding catalog...')

  // Créer les catégories
  const categoryMap = new Map<string, string>()

  for (const cat of catalogData.categories) {
    // Chercher si la catégorie existe déjà
    let category = await prisma.category.findFirst({
      where: { name: cat.name },
    })

    if (!category) {
      category = await prisma.category.create({
        data: cat,
      })
      console.log(`  ✅ Category created: ${cat.name}`)
    } else {
      console.log(`  ⏭️  Category exists: ${cat.name}`)
    }

    categoryMap.set(cat.name, category.id)
  }

  // Créer les services avec embeddings
  let servicesCreated = 0

  for (const svc of catalogData.services) {
    const categoryId = categoryMap.get(svc.category)
    if (!categoryId) {
      console.log(`  ⚠️  Category not found: ${svc.category}`)
      continue
    }

    // Vérifier si le service existe déjà
    const existing = await prisma.service.findFirst({
      where: { name: svc.name, categoryId },
    })

    if (existing) {
      console.log(`  ⏭️  Service exists: ${svc.name}`)
      continue
    }

    // Générer un fake embedding (sera remplacé par de vrais embeddings en prod)
    const embedding = generateFakeEmbedding()
    const embeddingStr = `[${embedding.join(',')}]`

    // Insérer avec raw SQL pour le vecteur (colonnes en camelCase avec Prisma)
    await prisma.$executeRaw`
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
    `

    servicesCreated++
    console.log(`  ✅ Service: ${svc.name}`)
  }

  console.log(
    `\n🎉 Catalog seeded: ${catalogData.categories.length} categories, ${servicesCreated} services`,
  )
}

async function main() {
  try {
    await seedCatalog()
  } catch (error) {
    console.error('❌ Catalog seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
