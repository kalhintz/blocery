import React, { Fragment, useState, useEffect } from 'react'
import Style from './B2bSlideItemHeaderImage.module.scss'
import classNames from 'classnames'
import { TimeText } from '~/components/common'



function B2bSlideImage(props){
    const { imageUrl, imageWidth, imageHeight, saleEnd, discountRate, remainedCnt = 0, onClick = () => null } = props
    const imageBoxStyle = {
        width: imageWidth,
        height: imageHeight
    }
    return(
        <div className={classNames(Style.imageBox, 'cursor-pointer')} style={imageBoxStyle} onClick={onClick}>
            {
                (discountRate && discountRate > 0) ? <div className={Style.discountLayer}>{Math.round(discountRate, 0)}%</div> : null
            }
            <img className={Style.image} src={imageUrl} />
            {
                remainedCnt <= 0 && <div className={classNames( Style.soldOut)}>SOLD OUT</div>
            }
        </div>
    )
}

export default B2bSlideImage