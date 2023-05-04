import axios from 'axios'

// console.log('REACT_APP_API_ENDPOINT', process.env.REACT_APP_API_ENDPOINT)

export const GetPost2: (
  id: string,
  success?: (_: any) => void,
  failure?: (_: any) => void
) => void = (id: string) => {
    console.log('invoking GetPost2 for: ' + process.env.REACT_APP_API_ENDPOINT + "/post/" + id)
    return axios({
        method: "get",
        url: process.env.REACT_APP_API_ENDPOINT + "/post/" + id,
        // params: {
        //   _limit: 5,
        // },
        headers: {
            "X-header-test": "custom header test",
        }
      })
      .then(resp => {
        const data = resp.data
        console.log('data ', data)
        return data
      })
      .catch(console.log)
}

export const GetPost: (id: string) => Promise<any> = (id: string) => {
    console.log('invoking GetPost for: ' + process.env.REACT_APP_API_ENDPOINT + "/post/" + id)
    return axios({
        method: "get",
        url: process.env.REACT_APP_API_ENDPOINT + "/post/" + id,
        // params: {
        //   _limit: 5,
        // },
        headers: {
            "X-header-test": "custom header test",
        }
      })
      .then(console.log)
      .catch(console.log)


    // return axios
    //     .get(process.env.REACT_APP_API_ENDPOINT + "/post/" + id)
    //     .catch(console.log)
}

