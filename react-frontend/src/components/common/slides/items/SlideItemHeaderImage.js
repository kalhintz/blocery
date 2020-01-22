import React, { Fragment, useState, useEffect } from 'react'
import Style from './SlideItemHeaderImage.module.scss'
import classNames from 'classnames'
import { TimeText } from '~/components/common'

function SlideImage(props){
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
                saleEnd && (
                    <div className={Style.timeLayer}>
                        <span className='f2'>
                            <TimeText date={saleEnd} formatter={'DD[일 ]HH[:]mm[:]ss'}/>
                        </span>
                        <small> 남음</small>
                    </div>
                )
            }
            {
                remainedCnt <= 0 && <div className={classNames( Style.soldOut)}>SOLD OUT</div>
            }
        </div>
    )
}

export default SlideImage