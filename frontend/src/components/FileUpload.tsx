import React, { ChangeEvent, useState } from 'react'
import SimpleButton from './SimpleButton'
// import Uploady from '@rpldy/uploady'
// import UploadButton from "@rpldy/upload-button"

let apiBase = process.env.REACT_APP_API_ENDPOINT || ""
while (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1)
}

type Props = {
    draftId: string
}

// eg: https://codefrontend.com/file-upload-reactjs/
const FileUpload: React.FC<Props> = ({draftId}) => {
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

        // 👇 Uploading the file using the fetch API to the server
        fetch(`${apiBase}/image/draft/${draftId}`, {
                method: 'POST',
                body: file,
                // 👇 Set headers manually for single file upload
                headers: {
                'content-type': file.type,
                'content-length': `${file.size}`, // 👈 Headers need to be a string
                'content-disposition': `file; filename=${file.name}`,
                'content-name': file.name,
            },
        })
        .then(() => setFile(undefined))
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