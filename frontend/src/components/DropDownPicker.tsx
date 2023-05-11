import React, { useState } from 'react'
import './DropDownPicker.css'

type Props = {
    disabled?: boolean
    text: string
    values: Array<string>
    onSelect: (value: string) => void
}


const DropDownPicker: React.FC<Props> = ({disabled, text, values, onSelect}) => {
    const [open, setOpen] = useState(false)
    if (disabled === true) {
        return <div className='DisabledDropDownPicker'>
            <div className='DropDownPickerText'>{text}</div>
        </div>
    }
    return <div className='DropDownPicker'>
        <div className='DropDownPickerText' onClick={() => {setOpen(!open)}}>{text}</div>

        {open && <div className='DropDownPickerItems'>
            {values.map((v, i)   => { return <div key={i} className='DropDownPickerItem' onClick={() => {setOpen(false); onSelect(v)}}>
            {v}
            </div>})}
        </div>}

    </div>


}

export default DropDownPicker