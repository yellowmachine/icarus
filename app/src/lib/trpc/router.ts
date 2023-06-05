import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import {z} from 'zod'
import { getStates, upWorkspace, downWorkspace, saveWorkspace, deleteWorkspace, cloneAndUpWorkspace } from '$lib/ika';
import { TRPCError } from '@trpc/server';
import type { WORKSPACE_EXPOSED } from '$lib/types';
import { getSubdomain } from '$lib/utils';

export const t = initTRPC.context<Context>().create();

export const auth = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next();
});

const authProcedure = t.procedure.use(auth)

async function _getStates(){
  const s = await getStates()
  const ret = s.map(w => ({...w, services: w.services.map(x => ({...x, ports: x.ports.map(y => ({...y, exposed: {port: getSubdomain(y.exposed.port)}}))}))}))
  return ret as WORKSPACE_EXPOSED[]
}

export const router = t.router({
  states: authProcedure.query(async () => {
    return await _getStates()
  }),
  up: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await upWorkspace(input.workspace)
    return await _getStates()
  }),
  cloneAndUp: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await cloneAndUpWorkspace(input.workspace)
    return await _getStates()
  }),
  down: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await downWorkspace(input.workspace)
    return await _getStates()
  }),
  delete: authProcedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await deleteWorkspace(input.workspace)
    return await _getStates()
  }),
  save: authProcedure.input(
    z.object({workspace: z.string(), readme: z.string(), specification: z.string()})
  ).mutation(async ({ input }) => {
    await saveWorkspace(input.workspace, input.readme, input.specification)
    return await _getStates()
  })
});

export type Router = typeof router;

