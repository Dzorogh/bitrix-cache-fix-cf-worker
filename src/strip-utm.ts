/**
 * Define regular expressions at top to have them precompiled.
 */
// const urlRegex = new RegExp('(refreshce|yclid|gclid|cx|ie|cof|siteurl|zanpid|origin|utm_(source|campaign|medium)|fb(cl)?id|fbclid|mr:[A-z]+ref(id|src))');
const urlRegex = new RegExp('(yclid|gclid|utm_(source|campaign|medium))');

export async function stripUtmFromRequest(request: Request) {

	let url = new URL(request.url)

	url = await normalizeUrl(url)

	return new Request(url, request)
}

async function normalizeUrl(url: URL) {
	let deleteKeys = []

	for(const key of url.searchParams.keys()) {
		if(key.match(urlRegex)){
			deleteKeys.push(key)
		}
	}

	deleteKeys.map(k => url.searchParams.delete(k))

	return url
}
