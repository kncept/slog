import React from 'react'
import './HBox.css'

type Props = {
    attachments: Array<string>
}

const DraftMediaDisplay: React.FC<Props> = ({attachments}) => {
    return <div className='attachments'>
        {attachments.map(attachment => <span key={attachment}>Media: {attachment}</span>)}
    </div>
}

export default DraftMediaDisplay