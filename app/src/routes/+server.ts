import { workspaceEmitter } from '../lib/utils';
import type { RequestHandler } from './$types';

function enqueue(controller: ReadableStreamDefaultController, msg: string){
	try{
		controller.enqueue('data: ' + msg + "\n\n");
	}catch(err){
		console.log('error in controller', err)
	}
	
}

export const GET: RequestHandler = () => {

	let f: (msg: any) => void;
	const stream = new ReadableStream({
		start(controller) {
			f = (msg: any) => enqueue(controller, `${msg}`)
			workspaceEmitter.on('log:out', f);
			workspaceEmitter.on('log:err', f);
		},
		cancel(x: any) {
			workspaceEmitter.removeListener('log:out', f)
			workspaceEmitter.removeListener('log:err', f)
			console.log('controller cancelled', x)
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};