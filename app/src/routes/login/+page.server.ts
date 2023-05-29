import { JWT_SECRET } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = await request.formData();
      const password = data.get('password') as string;

      if(password === 'secret'){
        cookies.set('jwt', jwt.sign({ id: 'some-email' }, JWT_SECRET), { path: '/', secure: false });
        return { success: true };
      }else{
        return fail(401, { error: 'Authentication failed' });  
      }
    } catch {
      return fail(401, { error: 'Authentication failed' });
    }
  }
};
