import { getStates } from '../lib/ika';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const ps = await getStates()

    return {
        ps
    };
}

