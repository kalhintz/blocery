import React from 'react'
import {FaImages, FaImage} from 'react-icons/fa'

export default props =>
    <div className='buttons fadein'>
        <div className='button'>
            <label htmlFor='single'>
                <FaImage color='#3B5998' />
            </label>
            <input type='file' id='single' onChange={props.onChange} />
        </div>

        <div className='button'>
            <label htmlFor='multi'>
                <FaImages color='#6d84b4' />
            </label>
            <input type='file' id='multi' onChange={props.onChange} multiple />
        </div>
    </div>