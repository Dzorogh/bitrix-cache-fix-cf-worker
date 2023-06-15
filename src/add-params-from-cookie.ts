import { parse } from 'cookie'

const COOKIE_NAME = "BITRIX_SM_ARG_CITY";

export async function addParamFromCookie(request: Request) {

	let url = new URL(request.url)

	const cityId = parseCityIdCookie(request)

	url = await addCityIdToUrl(url, cityId)

	return new Request(url, request)
}

function addCityIdToUrl(url: URL, cityId: string) {
	url.searchParams.set('_CF_CACHE_' + COOKIE_NAME, cityId);

	return url
}

function parseCityIdCookie(request: Request): string {
	const cookie = parse(request.headers.get("Cookie") || "");
	if (cookie[COOKIE_NAME] != null) {
		return String(cookie[COOKIE_NAME])
	} else {
		return ''
	}
}
