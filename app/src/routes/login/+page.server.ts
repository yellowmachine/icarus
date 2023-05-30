import { JWT_SECRET, PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const password = data.get('password') as string;
    if(password === PASSWORD){
      cookies.set('jwt', jwt.sign({ id: 'some-email' }, JWT_SECRET), { path: '/', secure: false });
      throw redirect(302, '/login')
    }else{
      return fail(401, { error: 'Authentication failed' });  
    }
  }
};
