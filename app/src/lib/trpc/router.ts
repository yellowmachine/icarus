import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import {z} from 'zod'
import { getExposedStates, upWorkspace, downWorkspace, saveWorkspace, deleteWorkspace, cloneAndUpWorkspace } from '$lib/ika';
import { TRPCError } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const auth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next();
});

const authProcedure = t.procedure.use(auth)

export const router = t.router({
  states: authProcedure.query(async () => {
    return await getExposedStates()
  }),
  up: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await upWorkspace(input.workspace)
    return await getExposedStates()
  }),
  cloneAndUp: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await cloneAndUpWorkspace(input.workspace)
    return await getExposedStates()
  }),
  down: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await downWorkspace(input.workspace)
    return await getExposedStates()
  }),
  delete: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await deleteWorkspace(input.workspace)
    return await getExposedStates()
  }),
  save: authProcedure.input(
    z.object({workspace: z.string(), readme: z.string(), specification: z.string()})
  ).mutation(async ({ input }) => {
    await saveWorkspace(input.workspace, input.readme, input.specification)
    return await getExposedStates()
  })
});

export type Router = typeof router;

