import React, { useState, useEffect } from 'react'
import { SellerIntroduce, SellerContent } from './Tags'
import Css from './FindSeller.module.scss'
import classNames from 'classnames'

import { Server } from '~/components/Properties'
const SellerListCard = (props) => {

    const { profileImages } = props

    let url = ''
    if(profileImages && profileImages.length > 0){
        url = Server.getThumbnailURL() + profileImages[0].imageUrl
    }

    return(
        <div className={classNames('d-flex p-3', Css.hover)}>
            <div className='d-flex flex-column'>
                <div className='d-flex mb-2'>
                    <img className='mr-2 rounded-sm' style={{width: 80, height: 80}} src={url} />
                    <div>
                        <SellerIntroduce {...props} />
                    </div>
                </div>
                <div className='mb-2'>
                    <SellerContent {...props}/>
                </div>
            </div>
            <div className='ml-auto d-flex align-items-center'>{'>'}</div>
        </div>


    )
}
export default SellerListCard