import React from 'react'
import './HBox.css'

type Props = {
    attachments: Array<string>
}

const DraftMediaDisplay: React.FC<Props> = ({attachments}) => {
    return <div className='attachments'>
        You can reference images in your post directy by name.
        {attachments.map(attachment => <span key={attachment}>{attachment}</span>)}
    </div>
}

export default DraftMediaDisplay