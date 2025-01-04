/* eslint-disable @typescript-eslint/no-explicit-any */
// Check requests for a pre-shared secret
const hasValidHeader = (request: Request, env: any) => {
	return request.headers.get('X-Custom-Auth-Key') === env.AUTH_KEY_SECRET;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function authorizeRequest(request: Request, env: any, key: string) {
	switch (request.method) {
		case 'PUT':
		case 'DELETE':
			return hasValidHeader(request, env);
		case 'GET':
			// return ALLOW_LIST.includes(key);
			return true;
		default:
			return false;
	}
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	async fetch(request: Request, env: { MY_BUCKET: any }): Promise<Response> {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		if (!authorizeRequest(request, env, key)) {
			return new Response('Forbidden', { status: 403 });
		}

		switch (request.method) {
			case 'PUT':
				await env.MY_BUCKET.put(key, request.body);
				return new Response(`Put ${key} successfully!`);
			case 'GET':
				const object = await env.MY_BUCKET.get(key);

				if (object === null) {
					return new Response('Object Not Found', { status: 404 });
				}

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);

				return new Response(object.body, {
					headers,
				});
			case 'DELETE':
				await env.MY_BUCKET.delete(key);
				return new Response('Deleted!');

			default:
				return new Response('Method Not Allowed', {
					status: 405,
					headers: {
						Allow: 'PUT, GET, DELETE',
					},
				});
		}
	},
};
