import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://localhost:4000'
const LITELLM_API_KEY = process.env.LITELLM_MASTER_KEY || 'sk-1234'

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${LITELLM_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LITELLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>
  }
  return data.data[0].embedding
}

async function regenerateEmbeddings() {
  console.log('🔄 Regenerating service embeddings with real OpenAI embeddings...\n')

  // Get all services
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      semanticDescription: true,
    },
  })

  console.log(`Found ${services.length} services to process\n`)

  let success = 0
  let failed = 0

  for (const service of services) {
    try {
      // Generate embedding from semantic description
      const embedding = await generateEmbedding(service.semanticDescription)
      const embeddingStr = `[${embedding.join(',')}]`

      // Update service with real embedding
      await prisma.$executeRaw`
        UPDATE services
        SET "descriptionEmbedding" = ${embeddingStr}::vector,
            "updatedAt" = NOW()
        WHERE id = ${service.id}
      `

      success++
      console.log(`  ✅ ${service.name}`)
    } catch (error) {
      failed++
      console.error(
        `  ❌ ${service.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`\n🎉 Done: ${success} updated, ${failed} failed`)
}

regenerateEmbeddings()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
