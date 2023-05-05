import fetchPonyfill from 'fetch-ponyfill'
const {fetch, Headers} = fetchPonyfill({});


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
    return cache.lookup('post:' + id, () => {
      return fetch(process.env.REACT_APP_API_ENDPOINT + '/post/' + id, {
        method: 'GET',
        headers: new Headers({
          "X-header-test": "custom header test"
        })
      })
      .then(res => res.json())
    })
}

