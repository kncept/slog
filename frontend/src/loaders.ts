import fetchPonyfill from 'fetch-ponyfill'
const {fetch, Request, Response, Headers} = fetchPonyfill({});

// console.log('REACT_APP_API_ENDPOINT', process.env.REACT_APP_API_ENDPOINT)

export const GetPost: (id: string) => Promise<any> = (id: string) => {
    console.log('invoking GetPost for: ' + process.env.REACT_APP_API_ENDPOINT + "/post/" + id)

    return fetch(process.env.REACT_APP_API_ENDPOINT + "/post/" + id, {
      method: "GET",
      headers: new Headers({
        "X-header-test": "custom header test"
      })
    })
    .then(res => res.json())
    .then(obj => {
      console.log(obj);
      return obj
    })
}

