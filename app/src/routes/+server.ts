import { workspaceEmitter } from '../lib/ika';

/** @type {import('./$types').RequestHandler} */
export const GET = () => {

	const stream = new ReadableStream({
		start(controller) {
			workspaceEmitter.on('event:ps', (msg: any) => {
				controller.enqueue('data: ' + JSON.stringify(msg) + "\n\n");
			});
			workspaceEmitter.on('event:log', (msg: any) => {
				controller.enqueue('data: ' + JSON.stringify(msg) + "\n\n");
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