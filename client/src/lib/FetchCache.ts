export function fetch(url: string, options?: any): Promise<Response> {
  return new Promise((resolve, reject) => {
    const regex = /date=(\d+).*?&refDate=(\d+)/;
    if (regex.test(url)) {
      // get the date and refDate from the url without using replace from the group
      let groups = regex.exec(url)!!;
      let date = parseFloat(groups[1]);
      let refDate = parseFloat(groups[2]);
      // now round the date and refDate to the nearest 30 minutes
      date = Math.round(date / 1800) * 1800;
      refDate = Math.round(refDate / 1800) * 1800;
      url = url.replace(regex, "date=" + date + "&refDate=" + refDate);
    }
    let startupTime = performance.now();
    // if the url matches this regex string 
    const cacheKey = url + JSON.stringify(options);
    let cached = sessionStorage.getItem(cacheKey);

    let cacheRule = "cache-first";
    if (options && options.cache) {
      cacheRule = options.cache.rule || cacheRule;
    }
    if (cached && (cacheRule === "cache-first") || cacheRule === "cache-only") {
      const parsedCache = JSON.parse(cached!!);
      const cacheDate = parsedCache["cacheDate"];
      const cacheAge = new Date().getTime() - cacheDate;

      // Can you make that 30 minutes?
      const cacheMaxAge = 30 * 60 * 1000;
      if (cacheAge > cacheMaxAge) {
        cached = null;
        sessionStorage.removeItem(cacheKey);
        console.log("%c 🗑️ Invalidated cache for " + url, "background: #474747;");
      }
    }
    
    if (cached && (cacheRule === "cache-first" || cacheRule === "cache-only")) {
      console.log("%c⚡ Cached response for " + url + " took " + ((performance.now() - startupTime) / 1000) + "s", "background: #087ac7; color: white");
      resolve(new Response(new Blob([cached])));
    } else if (cacheRule !== "cache-only") {
      window.fetch(url, options)
        .then((response) => {
          console.log("%c🚀 Response for " + url + " took " + ((performance.now() - startupTime) / 1000) + "s", "background: #9b0aab;");
          if (response.ok) {
              response.clone().json().then((data) => {
                data["cacheDate"] = new Date().getTime();
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                resolve(response);
            });
          } else {
            console.error("%c ‼️ Response for " + url + " failed", "background: #9e0000;")
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}

console.log("%c🚀 Using FetchCache instead of JS Fetch", "font-size: 24px")