import { CookieJar } from "cookiejar";
import { JSDOM } from "jsdom";

const cookieJar = new CookieJar();

const cookieArgs = ["secure.birds.cornell.edu", "/"];
const cookieAccessInfo = {
  domain: cookieArgs[0],
  path: cookieArgs[1],
  secure: true,
  script: false,
};
const ebirdCookieArgs = ["ebird.org", "/"];
const ebirdCookieAccessInfo = {
  domain: ebirdCookieArgs[0],
  path: ebirdCookieArgs[1],
  secure: true,
  script: false,
};
async function doRequest(name, url, args, cookieDomain, verbose) {
  if (verbose)
    console.log(
      `[${name}] Requesting ${url}:\n${JSON.stringify(args, null, 2)}`
    );
  const response = await fetch(url, args);
  cookieJar.setCookies(response.headers.getSetCookie(), cookieDomain, "/");
  if (verbose) console.log(response);
  return response;
}

async function login({ username, password, verbose }) {
  await doRequest(
    "prewarm session",
    "https://ebird.org/home",
    {
      headers: {
        host: "ebird.org",
        cookie: cookieJar.getCookies(ebirdCookieAccessInfo).toValueString(),
        referer: "https://secure.birds.cornell.edu",
      },
      redirect: "manual",
    },
    "ebird.org",
    verbose
  );

  const loginPageResponse = await doRequest(
    "loginPage",
    "https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US",
    {
      headers: {
        host: "secure.birds.cornell.edu",
        referer: "https://ebird.org",
      },
    },
    "secure.birds.cornell.edu",
    verbose
  );

  const executionToken = JSDOM.fragment(
    await loginPageResponse.text()
  ).querySelector('input[name="execution"]').value;

  const loginArgs = {
    method: "post",
    body: new URLSearchParams({
      service: "https://ebird.org/login/cas?portal=ebird",
      locale: "en_US",
      username,
      password,
      rememberMe: "on",
      execution: executionToken,
      _eventId: "submit",
    }),
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      host: "secure.birds.cornell.edu",
      origin: "https://secure.birds.cornell.edu",
      referer:
        "https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US",
      cookie: cookieJar.getCookies(cookieAccessInfo).toValueString(),
    },
    redirect: "manual",
  };

  const loginResponse = await doRequest(
    "login",
    "https://secure.birds.cornell.edu/cassso/login",
    loginArgs,
    "secure.birds.cornell.edu",
    verbose
  );

  await doRequest(
    "follow",
    loginResponse.headers.get("location"),
    {
      headers: {
        host: "ebird.org",
        cookie: cookieJar.getCookies(ebirdCookieAccessInfo).toValueString(),
        referer: "https://secure.birds.cornell.edu",
      },
      redirect: "manual",
    },
    "ebird.org",
    verbose
  );
}

export async function fetchLifeList({ username, password, verbose }) {
  await login({ username, password, verbose });

  const lifeListArgs = {
    headers: {
      host: "ebird.org",
      cookie: cookieJar.getCookies(ebirdCookieAccessInfo).toValueString(),
      referer: "https://ebird.org/myebird",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-encoding": "gzip, deflate, br, zstd",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0",
    },
  };
  const lifeListResponse = await doRequest(
    "fetchList",
    "https://ebird.org/lifelist?time=life&r=world",
    lifeListArgs,
    "ebird.org",
    verbose
  );

  return lifeListResponse.text();
}
