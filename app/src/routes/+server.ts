import { workspaceEmitter } from '../lib/ika';
import type { RequestHandler } from './$types';

function enqueue(controller: ReadableStreamDefaultController, msg: any){
	try{
		controller.enqueue('data: ' + msg /*JSON.stringify(msg)*/ + "\n\n");
	}catch(err){
		console.log(err)
	}
	
}

export const GET: RequestHandler = () => {

	const stream = new ReadableStream({
		start(controller) {
			workspaceEmitter.on('log:out', (msg: any) => {
				enqueue(controller, msg)
			});
			workspaceEmitter.on('log:err', (msg: any) => {
				enqueue(controller, msg)
			});
		},
		cancel() {
			
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