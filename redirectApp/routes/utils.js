import yahooFinance from "yahoo-finance2";
import hljs from "highlight.js/lib/core";
import jsonLang from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";

// Get around some CodeSandBox quirks by forcing
// browser versions of the below.
yahooFinance._env.URLSearchParams = URLSearchParams;
yahooFinance._env.fetch = fetch;

hljs.registerLanguage("json", jsonLang);

function showObj(obj) {
  console.log(obj);
  const json = JSON.stringify(obj, null, 2);

  const highlighted = hljs.highlight("json", json).value;
  let html = "<pre><code>" + highlighted + "</pre></code>";

  // Dates
  html = html.replace(
    /<span class="hljs-string">&quot;(\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z)&quot;<\/span>/g,
    '<span class="hljs-title">$1</span>'
  );

  document.getElementById("app").innerHTML = html;
}

function show(func) {
  func()
    .then((result) => showObj(result))
    .catch(({ name, message }) => showObj({ name, message }));
}

if (!yahooFinance._fetchOrig) {
  yahooFinance._fetchOrig = yahooFinance._fetch;
  yahooFinance._fetch = function proxyFetch(urlBase, ...args) {
    urlBase = "https://yf2-cors.herokuapp.com/" + urlBase;
    return this._fetchOrig(urlBase, ...args);
  };
}

export { show };
