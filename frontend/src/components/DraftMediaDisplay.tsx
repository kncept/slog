import React from 'react'
import SimpleButton from './SimpleButton'
import './DraftMediaDisplay.css'

type Props = {
    attachments: Array<string>
    insertAttachment: (value: string) => void
    deleteAttachment: (value: string) => void
}

const DraftMediaDisplay: React.FC<Props> = ({attachments, insertAttachment, deleteAttachment}) => {
    return <div className='Attachments'>
      {attachments.map((value: string, index: number) => <div className='AttachmentRow' key={index}>{value}
      <SimpleButton text='Insert' style={{color: 'green'}} onClick={() => insertAttachment(value)} />
      <SimpleButton text='Delete' style={{color: 'red'}} onClick={() => deleteAttachment(value)} />
      </div>)}
    </div>
}

export default DraftMediaDisplay

