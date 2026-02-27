import { Injectable, Inject } from '@nestjs/common'
import { AiService } from '../ai/ai.service'
import { LangfuseService } from '../langfuse/langfuse.service'
import { LoggerService } from '../logger/logger.service'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { VisionExtractionResult } from '@template-dev/shared'

const EXTRACTION_SYSTEM_PROMPT = `Tu es un expert en extraction de données de factures. Tu reçois une image de facture et tu dois extraire toutes les informations pertinentes au format JSON.

IMPORTANT:
- Enrichis les descriptions des lignes avec le contexte de la facture (nom du fournisseur, type de service)
- Si une ligne n'est pas claire, utilise le contexte global de la facture pour l'interpréter
- Les montants doivent être des nombres (pas de chaînes)
- Les dates doivent être au format ISO (YYYY-MM-DD)
- Si une information n'est pas présente, utilise null

Format de réponse attendu (JSON uniquement, sans markdown):
{
  "vendor_name": "Nom du fournisseur",
  "invoice_number": "Numéro de facture ou null",
  "invoice_date": "YYYY-MM-DD ou null",
  "total_ht": 1234.56,
  "total_tva": 123.45,
  "total_ttc": 1358.01,
  "lines": [
    {
      "description": "Description enrichie et contextuelle de la ligne",
      "quantity": 1,
      "unit_price": 100.00,
      "total_ht": 100.00,
      "period_start": "YYYY-MM-DD ou null",
      "period_end": "YYYY-MM-DD ou null"
    }
  ]
}`

const EXTRACTION_USER_PROMPT = `Extrais toutes les données de cette facture au format JSON.
Assure-toi d'enrichir les descriptions des lignes avec le contexte du fournisseur et du type de service.
Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après.`

@Injectable()
export class VisionService {
  constructor(
    @Inject(AiService) private aiService: AiService,
    @Inject(LangfuseService) private langfuseService: LangfuseService,
    @Inject(LoggerService) private logger: LoggerService,
  ) {}

  async extractInvoice(
    fileBuffer: Buffer,
    fileName: string,
    model: 'haiku' | 'sonnet' = 'haiku',
  ): Promise<VisionExtractionResult> {
    if (!this.aiService.isConfigured()) {
      throw new Error('AI service not configured')
    }

    const base64 = fileBuffer.toString('base64')
    const isPdf = fileName.toLowerCase().endsWith('.pdf')
    const mimeType = isPdf ? 'application/pdf' : 'image/png'

    const modelName = model === 'sonnet' ? 'claude-sonnet' : 'claude-haiku'
    this.logger.log(`Extracting invoice from ${fileName} (${mimeType}) using ${modelName}`)

    const tracing = this.langfuseService.startGeneration(
      {
        name: 'invoice-extraction',
        tags: ['vision', 'extraction', model],
      },
      {
        model: modelName,
        input: { fileName, mimeType, model },
      },
    )

    try {
      const startTime = Date.now()

      const response = await this.aiService.chatCompletion({
        model: modelName,
        messages: [
          new SystemMessage(EXTRACTION_SYSTEM_PROMPT),
          new HumanMessage({
            content: [
              { type: 'text', text: EXTRACTION_USER_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          }),
        ],
        temperature: 0,
        tags: ['vision', 'extraction'],
      })

      const endTime = Date.now()
      this.logger.log(`Vision extraction completed in ${endTime - startTime}ms`)

      // Parse response
      const content =
        typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

      // Clean up response - remove markdown code blocks if present
      let jsonStr = content.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      jsonStr = jsonStr.trim()

      const result = JSON.parse(jsonStr) as VisionExtractionResult

      if (tracing) {
        this.langfuseService.endGeneration(tracing.generation, result)
        this.langfuseService.flush().catch((err) => {
          this.logger.warn('Langfuse flush failed:', err)
        })
      }

      return result
    } catch (error) {
      this.logger.error('Vision extraction failed:', error)

      if (tracing) {
        this.langfuseService.endGeneration(tracing.generation, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        this.langfuseService.flush().catch(() => {})
      }

      throw error
    }
  }
}
