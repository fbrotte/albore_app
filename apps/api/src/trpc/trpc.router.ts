import type { INestApplication, OnApplicationBootstrap } from '@nestjs/common'
import { Injectable, Inject } from '@nestjs/common'
import * as trpcExpress from '@trpc/server/adapters/express'
import { TrpcService } from './trpc.service'
import { AuthTrpc } from '../modules/auth/auth.trpc'
import { UsersTrpc } from '../modules/users/users.trpc'
import { AiTrpc } from '../modules/ai/ai.trpc'
import { CatalogTrpc } from '../modules/catalog/catalog.trpc'
import { ClientsTrpc } from '../modules/clients/clients.trpc'
import { AnalysesTrpc } from '../modules/analyses/analyses.trpc'
import { InvoicesTrpc } from '../modules/invoices/invoices.trpc'
import { InvoiceLinesTrpc } from '../modules/invoice-lines/invoice-lines.trpc'
import { SummariesTrpc } from '../modules/summaries/summaries.trpc'
import { ProposalCustomizationsTrpc } from '../modules/proposal-customizations/proposal-customizations.trpc'
import { createContext } from './trpc.context'

@Injectable()
export class TrpcRouter implements OnApplicationBootstrap {
  appRouter: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(AuthTrpc) private readonly authTrpc: AuthTrpc,
    @Inject(UsersTrpc) private readonly usersTrpc: UsersTrpc,
    @Inject(AiTrpc) private readonly aiTrpc: AiTrpc,
    @Inject(CatalogTrpc) private readonly catalogTrpc: CatalogTrpc,
    @Inject(ClientsTrpc) private readonly clientsTrpc: ClientsTrpc,
    @Inject(AnalysesTrpc) private readonly analysesTrpc: AnalysesTrpc,
    @Inject(InvoicesTrpc) private readonly invoicesTrpc: InvoicesTrpc,
    @Inject(InvoiceLinesTrpc) private readonly invoiceLinesTrpc: InvoiceLinesTrpc,
    @Inject(SummariesTrpc) private readonly summariesTrpc: SummariesTrpc,
    @Inject(ProposalCustomizationsTrpc)
    private readonly proposalCustomizationsTrpc: ProposalCustomizationsTrpc,
  ) {
    // Assemble modular routers
    this.appRouter = this.trpc.router({
      auth: this.authTrpc.router,
      users: this.usersTrpc.router,
      ai: this.aiTrpc.router,
      catalog: this.catalogTrpc.router,
      clients: this.clientsTrpc.router,
      analyses: this.analysesTrpc.router,
      invoices: this.invoicesTrpc.router,
      invoiceLines: this.invoiceLinesTrpc.router,
      summaries: this.summariesTrpc.router,
      proposalCustomizations: this.proposalCustomizationsTrpc.router,
    })
  }

  onApplicationBootstrap() {
    // Hook is called but we don't need to do anything here
    // since routers are already initialized in constructor
  }

  async applyMiddleware(app: INestApplication) {
    app.use(
      '/trpc',
      trpcExpress.createExpressMiddleware({
        router: this.appRouter,
        createContext,
      }),
    )
  }

  getRouter() {
    return this.appRouter
  }
}

export type AppRouter = TrpcRouter['appRouter']
