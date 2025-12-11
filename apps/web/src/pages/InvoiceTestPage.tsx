import { useState, useCallback } from 'react'
import { trpc, trpcClient } from '../lib/trpc'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

type MatchCandidate = {
  serviceId: string
  serviceName: string
  score: number
}

type InvoiceLine = {
  id: string
  description: string
  quantity: number | null
  unitPrice: number | null
  totalHt: number
  matchStatus: string
  matchConfidence: number | null
  matchCandidates: MatchCandidate[] | null
  matchedService: { id: string; name: string } | null
}

type Summary = {
  id: string
  matchedService: { name: string; category: { name: string } } | null
  customLabel: string | null
  monthsCount: number
  totalHt: number
  avgMonthly: number
  billingPattern: string
  ourPrice: number | null
  savingAmount: number | null
  savingPercent: number | null
  includeInReport: boolean
}

export default function InvoiceTestPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedJson, setExtractedJson] = useState<object | null>(null)
  const [lines, setLines] = useState<InvoiceLine[]>([])
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [isConsolidating, setIsConsolidating] = useState(false)

  // Mutations
  const createClientMutation = trpc.clients.create.useMutation()
  const createAnalysisMutation = trpc.analyses.create.useMutation()
  const uploadMutation = trpc.invoices.upload.useMutation()
  const matchAllMutation = trpc.invoiceLines.matchAll.useMutation()
  const setMatchMutation = trpc.invoiceLines.setMatch.useMutation()
  const ignoreMutation = trpc.invoiceLines.ignore.useMutation()
  const consolidateMutation = trpc.summaries.consolidate.useMutation()

  // Queries
  const servicesQuery = trpc.catalog.services.list.useQuery(undefined, {
    enabled: false, // Manual fetch
  })

  // Setup: Create client and analysis if needed
  const handleSetup = async () => {
    try {
      // Create test client
      const client = await createClientMutation.mutateAsync({
        name: 'Client Test',
        company: 'Test Company',
      })
      setClientId(client.id)

      // Create analysis
      const analysis = await createAnalysisMutation.mutateAsync({
        clientId: client.id,
        name: `Test Analysis ${new Date().toISOString()}`,
      })
      setAnalysisId(analysis.id)

      alert('Setup complete! Client and Analysis created.')
    } catch (error) {
      console.error('Setup error:', error)
      alert('Setup failed: ' + (error as Error).message)
    }
  }

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Upload and extract
  const handleUpload = async () => {
    if (!selectedFile || !analysisId) {
      alert('Please select a file and setup first')
      return
    }

    setIsUploading(true)
    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]

        const result = await uploadMutation.mutateAsync({
          analysisId,
          fileName: selectedFile.name,
          fileContent: base64,
        })

        setExtractedJson(result.extraction)
        setLines(result.invoice.lines as InvoiceLine[])
        setIsUploading(false)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + (error as Error).message)
      setIsUploading(false)
    }
  }

  // Match all lines
  const handleMatchAll = async () => {
    if (!analysisId) return

    setIsMatching(true)
    try {
      const result = await matchAllMutation.mutateAsync({ analysisId })

      // Fetch updated lines from API using vanilla client
      const updatedLines = await trpcClient.invoiceLines.listByAnalysis.query({ analysisId })
      setLines(updatedLines as InvoiceLine[])

      alert(
        `Matching complete: ${result.autoMatched} auto-matched, ${result.pending} pending review`,
      )
    } catch (error) {
      console.error('Match error:', error)
      alert('Matching failed: ' + (error as Error).message)
    } finally {
      setIsMatching(false)
    }
  }

  // Manual match
  const handleSetMatch = async (lineId: string, serviceId: string) => {
    try {
      const result = await setMatchMutation.mutateAsync({ lineId, serviceId })
      setLines((prev) =>
        prev.map((l) =>
          l.id === lineId
            ? { ...l, matchStatus: 'MANUAL', matchedService: result.matchedService }
            : l,
        ),
      )
    } catch (error) {
      console.error('Set match error:', error)
      alert('Set match failed: ' + (error as Error).message)
    }
  }

  // Ignore line
  const handleIgnore = async (lineId: string) => {
    try {
      await ignoreMutation.mutateAsync({ lineId })
      setLines((prev) =>
        prev.map((l) =>
          l.id === lineId ? { ...l, matchStatus: 'IGNORED', matchedService: null } : l,
        ),
      )
    } catch (error) {
      console.error('Ignore error:', error)
      alert('Ignore failed: ' + (error as Error).message)
    }
  }

  // Consolidate
  const handleConsolidate = async () => {
    if (!analysisId) return

    setIsConsolidating(true)
    try {
      const result = await consolidateMutation.mutateAsync({ analysisId })
      setSummaries(result as Summary[])
    } catch (error) {
      console.error('Consolidate error:', error)
      alert('Consolidation failed: ' + (error as Error).message)
    } finally {
      setIsConsolidating(false)
    }
  }

  // Fetch services for dropdown
  const loadServices = useCallback(async () => {
    await servicesQuery.refetch()
  }, [servicesQuery])

  return (
    <div className="container mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Invoice Analysis - Test Pipeline</h1>

      {/* Step 1: Setup */}
      <Card>
        <CardHeader>
          <CardTitle>1. Setup</CardTitle>
          <CardDescription>Create a test client and analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!analysisId ? (
            <Button onClick={handleSetup} disabled={createClientMutation.isPending}>
              {createClientMutation.isPending ? 'Creating...' : 'Create Test Client & Analysis'}
            </Button>
          ) : (
            <div className="text-green-600">✓ Analysis ready: {analysisId}</div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Upload */}
      <Card>
        <CardHeader>
          <CardTitle>2. Upload PDF</CardTitle>
          <CardDescription>Upload an invoice PDF to extract data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".pdf" onChange={handleFileChange} />
          {selectedFile && <p>Selected: {selectedFile.name}</p>}
          <Button onClick={handleUpload} disabled={!selectedFile || !analysisId || isUploading}>
            {isUploading ? 'Extracting...' : 'Extract Invoice'}
          </Button>
        </CardContent>
      </Card>

      {/* Step 3: Raw JSON */}
      {extractedJson && (
        <Card>
          <CardHeader>
            <CardTitle>3. Extracted JSON (Vision)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(extractedJson, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Lines & Matching */}
      {lines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>4. Invoice Lines & Matching</CardTitle>
            <CardDescription>
              <Button onClick={handleMatchAll} disabled={isMatching} className="mt-2">
                {isMatching ? 'Matching...' : 'Match All Lines'}
              </Button>
              <Button onClick={loadServices} variant="outline" className="ml-2 mt-2">
                Load Services (for dropdown)
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Total HT</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-left">Matched / Candidates</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b">
                    <td className="max-w-xs truncate p-2" title={line.description}>
                      {line.description}
                    </td>
                    <td className="p-2 text-right">{Number(line.totalHt).toFixed(2)} €</td>
                    <td className="p-2 text-center">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          line.matchStatus === 'AUTO'
                            ? 'bg-green-100 text-green-800'
                            : line.matchStatus === 'MANUAL' || line.matchStatus === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : line.matchStatus === 'IGNORED'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {line.matchStatus}
                        {line.matchConfidence &&
                          ` (${(Number(line.matchConfidence) * 100).toFixed(0)}%)`}
                      </span>
                    </td>
                    <td className="p-2">
                      {line.matchedService ? (
                        <span className="text-green-600">{line.matchedService.name}</span>
                      ) : (
                        <select
                          className="w-full rounded border p-1 text-xs"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleSetMatch(line.id, e.target.value)
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">-- Select service --</option>
                          {/* Show candidates first */}
                          {line.matchCandidates && line.matchCandidates.length > 0 && (
                            <optgroup label="Candidates">
                              {line.matchCandidates.map((c) => (
                                <option key={c.serviceId} value={c.serviceId}>
                                  {c.serviceName} ({(c.score * 100).toFixed(0)}%)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {/* Then all services */}
                          {servicesQuery.data && (
                            <optgroup label="All Services">
                              {servicesQuery.data.map((s: { id: string; name: string }) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {line.matchStatus !== 'IGNORED' && (
                        <Button variant="ghost" size="sm" onClick={() => handleIgnore(line.id)}>
                          Ignore
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Consolidate */}
      {lines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>5. Consolidate</CardTitle>
            <CardDescription>Generate summaries from matched lines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConsolidate} disabled={isConsolidating}>
              {isConsolidating ? 'Consolidating...' : 'Consolidate Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Summaries */}
      {summaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>6. Summaries</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Service</th>
                  <th className="p-2 text-right">Total HT</th>
                  <th className="p-2 text-right">Avg/Month</th>
                  <th className="p-2 text-center">Pattern</th>
                  <th className="p-2 text-right">Our Price</th>
                  <th className="p-2 text-right">Saving</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2">
                      {s.matchedService?.name || s.customLabel || 'N/A'}
                      {s.matchedService?.category && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({s.matchedService.category.name})
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">{Number(s.totalHt).toFixed(2)} €</td>
                    <td className="p-2 text-right">{Number(s.avgMonthly).toFixed(2)} €</td>
                    <td className="p-2 text-center">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          s.billingPattern === 'FIXED'
                            ? 'bg-blue-100'
                            : s.billingPattern === 'VARIABLE'
                              ? 'bg-yellow-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        {s.billingPattern}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      {s.ourPrice !== null ? `${Number(s.ourPrice).toFixed(2)} €` : '-'}
                    </td>
                    <td className="p-2 text-right">
                      {s.savingAmount !== null && (
                        <span className={s.savingAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Number(s.savingAmount).toFixed(2)} € (
                          {Number(s.savingPercent).toFixed(0)}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
