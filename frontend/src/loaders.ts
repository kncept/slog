import fetchPonyfill from 'fetch-ponyfill'
const {fetch, Headers} = fetchPonyfill({});

let apiBase = process.env.REACT_APP_API_ENDPOINT || ""
while (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1)
}

// super basic parallel request cache
class Cache {
  activeRequests: Record<string, any> = {}

  async lookup(key: string, provide: () => Promise<any>): Promise<any> {
    let value = this.activeRequests[key]
    if (value !== null && value !== undefined) {
      return value
    }
    value = provide()
    .then(val => {
      delete this.activeRequests[key]
      return val
    })
    this.activeRequests[key] = value
    return value
  }

}

const cache = new Cache()

export const GetPost: (id: string) => Promise<any> = (id: string) => {
    return cache.lookup('post:' + id, async (): Promise<any> => {
      const res = await fetch(apiBase + '/post/' + id, {
        method: 'GET',
        headers: new Headers({
          "Accept": "application/json"
        })
      });
      return await res.json();
    })
}

