import {parse, serialize} from "cookie"

const bitrixCityCookieName = "BITRIX_SM_ARG_CITY";
const bitrixCityDefault = "null";

addEventListener('fetch', event => {
	event.passThroughOnException()
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request) {
	if (new URL(request.url).searchParams.get('no-bitrix-worker')) {
		const response = await fetch(request)
		return new Response(response.body, response)
	}

	let modifiedRequest = await stripUtmFromRequest(request)

	modifiedRequest = await addParamFromCookie(modifiedRequest, bitrixCityCookieName, 'CF_CACHE_' + bitrixCityCookieName, bitrixCityDefault)
	modifiedRequest = await addParamToSplitMobileAndDesktop(modifiedRequest, '_CF_CACHE_MOBILE')

	const response = await fetch(modifiedRequest)

	let modifiedResponse = new Response(response.body, response)

	// modifiedResponse = await fixCurrentCity(modifiedRequest, modifiedResponse)

	modifiedResponse.headers.append(
		"CF-Worker-Modified-Url",
		modifiedRequest.url
	)

	// const url = new URL(request.url)

	// console.log(getCookie(request, bitrixCityCookieName), url.pathname === '/', !url.searchParams.get('argcity'))

	// Redirect to remove current city if is not Moscow or empty.
	// if (getCookie(request, bitrixCityCookieName) !== '1' && url.pathname === '/' && !url.searchParams.get('argcity')) {
	//return Response.redirect('https://globaldrive.ru/?argcity=1', 302);
	// }

	return modifiedResponse
}

// async function addParamToPreventCityDetection(request: Request) {
// 	let url = new URL(request.url)
//
// 	url = setSearchParam(url, 'PREVENT_CITY', '1')
//
// 	return new Request(url, request)
// }

function setSearchParam(url: URL, name: string, value: string,) {
	url.searchParams.set(name, value)

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

async function addParamFromCookie(request: Request, cookieName: string, paramName: string, defaultValue = '') {
	let url = new URL(request.url)

	const cookieValue = getCookie(request, cookieName)

	url.searchParams.set(paramName, cookieValue ? cookieValue : defaultValue);

	return new Request(url, request)
}

async function addParamToSplitMobileAndDesktop(request: Request, paramName: string) {
	let url = new URL(request.url)

	url.searchParams.set(paramName, isMobile(request.headers.get('User-Agent') ?? '') ? '1' : '0');

	return new Request(url, request)
}

function isMobile(userAgent: string) {
	let check = false;
	(function (a) {
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
	})(userAgent);
	return check;
}

async function fixCurrentCity(request: Request, response: Response) {
	let url = new URL(request.url)
	 // && !getCookie(request, bitrixCityCookieName)
	const argCityNumber = Number(getCookie(request, bitrixCityCookieName))

	if (!argCityNumber && url.pathname === '/') {
		response.headers.append('Set-Cookie', serialize(bitrixCityCookieName, ''))
	}

	return response
}
