// lib/trpc/router.ts
import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import {z} from 'zod'
import { getStates, upWorkspace, downWorkspace, saveWorkspace, deleteWorkspace } from '$lib/ika';

export const t = initTRPC.context<Context>().create();

export const router = t.router({
  up: t.procedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await upWorkspace(input.workspace)
    const x = await getStates()
    //console.log(x)
    return x
  }),
  down: t.procedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await downWorkspace(input.workspace)
    return await getStates()
  }),
  delete: t.procedure.input(
    z.object({workspace: z.string()})
  ).mutation(async ({ input }) => {
    await deleteWorkspace(input.workspace)
    return await getStates()
  }),
  save: t.procedure.input(
    z.object({workspace: z.string(), readme: z.string(), specification: z.string()})
  ).mutation(async ({ input }) => {
    await saveWorkspace(input.workspace, input.readme, input.specification)
    return await getStates()
  })
});

export type Router = typeof router;

