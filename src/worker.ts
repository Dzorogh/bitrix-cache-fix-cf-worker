import { stripUtmFromRequest } from "cf-strip-utm"
import { addParamFromCookie } from "add-param-from-cookie-cf"

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
