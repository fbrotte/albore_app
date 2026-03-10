import { Injectable, Inject } from '@nestjs/common'
import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { ClientsService } from './clients.service'
import { CreateClientSchema, UpdateClientSchema } from '@template-dev/shared'

@Injectable()
export class ClientsTrpc {
  router: ReturnType<TrpcService['router']>

  constructor(
    @Inject(TrpcService) private readonly trpc: TrpcService,
    @Inject(ClientsService) private readonly clientsService: ClientsService,
  ) {
    this.router = this.trpc.router({
      list: this.trpc.protectedProcedure.query(async () => {
        return this.clientsService.findAll()
      }),

      getById: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .query(async ({ input }) => {
          return this.clientsService.findById(input.id)
        }),

      create: this.trpc.protectedProcedure
        .input(CreateClientSchema)
        .mutation(async ({ input, ctx }) => {
          return this.clientsService.create(ctx.user!.userId, input)
        }),

      update: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid(), data: UpdateClientSchema }))
        .mutation(async ({ input }) => {
          return this.clientsService.update(input.id, input.data)
        }),

      delete: this.trpc.protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(async ({ input }) => {
          return this.clientsService.delete(input.id)
        }),
    })
  }
}
