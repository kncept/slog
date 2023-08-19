import React, { ChangeEvent, useContext, useState } from 'react'
import AuthContext from '../AuthContext'
import { Loader } from '../loaders/loaders'
// import SimpleButton from './SimpleButton'
// import Uploady from '@rpldy/uploady'
// import UploadButton from "@rpldy/upload-button"

let apiBase = process.env.REACT_APP_API_ENDPOINT || ""
while (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1)
}

type Props = {
    draftId: string
    onUpload: (filename: string) => void
}

// eg: https://codefrontend.com/file-upload-reactjs/
const FileUpload: React.FC<Props> = ({draftId, onUpload}) => {
    const auth = useContext(AuthContext)
    const [file, setFile] = useState<File>()
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setFile(e.target.files[0])
        }
      }
    const handleUploadClick = () => {
        if (!file) {
            return
        }
        Loader(auth.currentUser).AddAttachment(draftId, file)
        .then(() => setFile(undefined))
        .then(() => onUpload(file.name))
    }
    return <div>
        <input type="file" onChange={handleFileChange} />
        <div>{file && `${file.name} - ${file.type}`}</div>
        <button onClick={handleUploadClick}>Upload</button>
    </div>
}

// npm i @rpldy/uploady @rpldy/upload-button
// const FileUploadManaged: React.FC<Props> = ({draftId}) => {
//     return <Uploady destination={{url: apiBase + '/image/draft/' + draftId}}>
//         <UploadButton />
//     </Uploady>
// }

export default FileUpload