import { router } from '$lib/trpc/router'
import { createTRPCHandle } from 'trpc-sveltekit'
import { createContext } from '$lib/trpc/context'
import { createRouteGuard } from 'sveltekit-route-guard'
import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit'
import { verify } from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private'

const trpcHandle = createTRPCHandle({
 router,
 createContext
})

type User = {
    id: string
}

const getCurrentUser = (event: RequestEvent) => {
    try {
     const token = event.cookies.get('jwt')
     return verify(token || '', JWT_SECRET) as User
    } catch (_) {
     return null
    }
   }

export const handle: Handle = createRouteGuard({
 redirect,
 next: trpcHandle,
 routes: [
    {
     pathname: '/',
     meta: {
      auth: true
     }
    },
    {
     pathname: '/login',
     meta: {
      auth: false
     }
    }
   ],
 beforeEach(to, event, next) {
    // check if the user is authenticated ot not
    const user = getCurrentUser(event)
    if (user) event.locals.user = user.id
  
    // not authenticated and requires authentication is true
    if (!user && to.meta?.auth) {
     return next('/login')
    }
  
    // already authenticated, can't go to /login
    if (user && to.meta?.auth === false) {
     return next('/')
    }
  
    // no guard, continue the request
    return next()
   }
  })