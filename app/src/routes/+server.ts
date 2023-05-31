import { workspaceEmitter } from '../lib/ika';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {

	const stream = new ReadableStream({
		start(controller) {
			workspaceEmitter.on('log:out', (msg: any) => {
				controller.enqueue('data: ' + JSON.stringify(msg) + "\n\n");
			});
			workspaceEmitter.on('log:err', (msg: any) => {
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