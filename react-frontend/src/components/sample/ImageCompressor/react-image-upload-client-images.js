import React from 'react'
import {FaTimesCircle} from 'react-icons/fa'

export default props =>
    props.images.map((image, i) =>
        <div key={`image${i}`} className='fadein'>
            <div
                onClick={() => props.removeImage(image.public_id)}
                className='delete'
            >
                <FaTimesCircle />
            </div>
            <img src={image.secure_url} alt='사진' />
        </div>
    )