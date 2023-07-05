import {addParamFromCookie} from "add-param-from-cookie-cf"
import {parse} from "cookie"

const bitrixCityCookieName = "BITRIX_SM_ARG_CITY";
const bitrixCityDefault = "1";

addEventListener('fetch', event => {
	event.passThroughOnException()
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request) {
	let modifiedRequest = await stripUtmFromRequest(request)

	modifiedRequest = await addParamFromCookie(modifiedRequest, bitrixCityCookieName, bitrixCityDefault)

	const response = await fetch(modifiedRequest)

	const modifiedResponse = new Response(response.body, response);

	modifiedResponse.headers.append(
		"CF-Worker-Modified-Url",
		modifiedRequest.url
	);

	return modifiedResponse;
}

async function addParamToPreventCityDetection(request: Request) {
	let url = new URL(request.url)

	url = setSearchParam(url, 'PREVENT_CITY', '1')

	return new Request(url, request)
}

function setSearchParam(url: URL, name: string, value: string,) {
	url.searchParams.set(name, value);

	return url
}

function getCookie(request: Request, cookieName: string): string | null {
	const cookie = parse(request.headers.get("Cookie") || "");
	if (cookie[cookieName] != null) {
		return String(cookie[cookieName])
	} else {
		return null
	}
}

const urlRegex = new RegExp('(yclid|gclid|_openstat|utm_(source|campaign|medium|term|content))');

async function stripUtmFromRequest(request: Request) {
	let url = new URL(request.url)

	url = await normalizeUrl(url)

	return new Request(url, request)
}

function normalizeUrl(url: URL) {
	let deleteKeys = []

	for (const key of url.searchParams.keys()) {
		if (key.match(urlRegex)) {
			deleteKeys.push(key)
		}
	}

	deleteKeys.forEach(k => url.searchParams.delete(k))

	return url
}
