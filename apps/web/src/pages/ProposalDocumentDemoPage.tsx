import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProposalDocument } from '@/components/proposal-document'
import type { ProposalData } from '@/components/proposal-document'

// Données de démonstration
const DEMO_DATA: ProposalData = {
  analysisId: 'demo',
  client: {
    name: 'COTAL GROUPE',
    company: 'COTAL GROUPE',
    contact: undefined,
    email: undefined,
    phone: '04 95 30 03 03',
    address: 'Rn 193 Casatorra, 20620 Biguglia',
  },
  albore: {
    consultant: 'Richard BERTONCINI',
    email: 'bertoncini@alboregroup.com',
    phone: '06 50 01 51 03',
  },
  date: new Date(),
  groups: [
    {
      id: 'telecom',
      name: 'Téléphonie & Réseaux',
      slug: 'telecom',
      icon: '📡',
      color: 'text-[#c77c14]',
      bgColor: 'bg-[#fef3e2]',
      borderColor: 'border-[#c77c14]',
      services: [
        {
          id: '1',
          serviceName: 'Forfait Mobile Entreprise',
          categoryName: 'Téléphonie Mobile',
          categoryId: 'cat1',
          provider: 'Orange Pro',
          currentMonthly: 1250,
          currentAnnual: 15000,
          proposedMonthly: 875,
          proposedAnnual: 10500,
          savingAmount: 375,
          savingPercent: 30,
          quantity: 50,
          unitLabel: 'lignes',
          unitPrice: 25,
          ourPrice: 17.5,
        },
        {
          id: '2',
          serviceName: 'Trunk SIP',
          categoryName: 'Téléphonie Fixe',
          categoryId: 'cat2',
          provider: 'SFR Business',
          currentMonthly: 450,
          currentAnnual: 5400,
          proposedMonthly: 300,
          proposedAnnual: 3600,
          savingAmount: 150,
          savingPercent: 33,
          quantity: 30,
          unitLabel: 'canaux',
          unitPrice: 15,
          ourPrice: 10,
        },
        {
          id: '3',
          serviceName: 'Fibre Optique Entreprise',
          categoryName: 'Internet & Réseau',
          categoryId: 'cat3',
          provider: 'Bouygues Telecom',
          currentMonthly: 189,
          currentAnnual: 2268,
          proposedMonthly: 129,
          proposedAnnual: 1548,
          savingAmount: 60,
          savingPercent: 32,
          quantity: 1,
          unitLabel: 'accès',
          unitPrice: 189,
          ourPrice: 129,
        },
      ],
      currentTotal: 1889,
      proposedTotal: 1304,
      savingsTotal: 585,
      savingsPercent: 31,
    },
    {
      id: 'it',
      name: 'Informatique',
      slug: 'it',
      icon: '💻',
      color: 'text-[#2b6cb0]',
      bgColor: 'bg-[#e8f0fe]',
      borderColor: 'border-[#2b6cb0]',
      services: [
        {
          id: '4',
          serviceName: 'Microsoft 365 Business',
          categoryName: 'Logiciels & Licences',
          categoryId: 'cat4',
          provider: 'Microsoft',
          currentMonthly: 625,
          currentAnnual: 7500,
          proposedMonthly: 500,
          proposedAnnual: 6000,
          savingAmount: 125,
          savingPercent: 20,
          quantity: 50,
          unitLabel: 'utilisateurs',
          unitPrice: 12.5,
          ourPrice: 10,
        },
        {
          id: '5',
          serviceName: 'Serveur Virtuel VPS',
          categoryName: 'Cloud & Hébergement',
          categoryId: 'cat5',
          provider: 'OVH',
          currentMonthly: 180,
          currentAnnual: 2160,
          proposedMonthly: 120,
          proposedAnnual: 1440,
          savingAmount: 60,
          savingPercent: 33,
          quantity: 3,
          unitLabel: 'VM',
          unitPrice: 60,
          ourPrice: 40,
        },
        {
          id: '6',
          serviceName: 'Antivirus Endpoint',
          categoryName: 'Logiciels & Licences',
          categoryId: 'cat4',
          provider: 'Kaspersky',
          currentMonthly: 150,
          currentAnnual: 1800,
          proposedMonthly: 90,
          proposedAnnual: 1080,
          savingAmount: 60,
          savingPercent: 40,
          quantity: 50,
          unitLabel: 'postes',
          unitPrice: 3,
          ourPrice: 1.8,
        },
      ],
      currentTotal: 955,
      proposedTotal: 710,
      savingsTotal: 245,
      savingsPercent: 25.7,
    },
    {
      id: 'printing',
      name: 'Impression',
      slug: 'printing',
      icon: '🖨️',
      color: 'text-[#7c3aed]',
      bgColor: 'bg-[#f0e6ff]',
      borderColor: 'border-[#7c3aed]',
      services: [
        {
          id: '7',
          serviceName: 'Location Copieur Multifonction',
          categoryName: 'Impression',
          categoryId: 'cat6',
          provider: 'Canon',
          currentMonthly: 320,
          currentAnnual: 3840,
          proposedMonthly: 220,
          proposedAnnual: 2640,
          savingAmount: 100,
          savingPercent: 31,
          quantity: 2,
          unitLabel: 'copieurs',
          unitPrice: 160,
          ourPrice: 110,
        },
        {
          id: '8',
          serviceName: 'Coût à la Page',
          categoryName: 'Impression',
          categoryId: 'cat6',
          provider: 'Canon',
          currentMonthly: 180,
          currentAnnual: 2160,
          proposedMonthly: 120,
          proposedAnnual: 1440,
          savingAmount: 60,
          savingPercent: 33,
          quantity: 6000,
          unitLabel: 'pages',
          unitPrice: 0.03,
          ourPrice: 0.02,
        },
      ],
      currentTotal: 500,
      proposedTotal: 340,
      savingsTotal: 160,
      savingsPercent: 32,
    },
  ],
  presentGroups: [], // Will be set below
  totals: {
    currentMonthly: 3344,
    currentAnnual: 40128,
    proposedMonthly: 2354,
    proposedAnnual: 28248,
    savingsMonthly: 990,
    savingsAnnual: 11880,
    savingsPercent: 29.6,
  },
  hasGroup: {
    telecom: true,
    it: true,
    printing: true,
  },
}

// Set presentGroups to all groups
DEMO_DATA.presentGroups = DEMO_DATA.groups

export default function ProposalDocumentDemoPage() {
  const navigate = useNavigate()

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <AppLayout>
      {/* Toolbar - hidden when printing */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                Document de Proposition{' '}
                <span className="ml-2 rounded bg-warning/20 px-2 py-0.5 text-sm font-medium text-warning">
                  DEMO
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {DEMO_DATA.client.company} - Données de démonstration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Telecharger PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document */}
      <ProposalDocument data={DEMO_DATA} />
    </AppLayout>
  )
}
