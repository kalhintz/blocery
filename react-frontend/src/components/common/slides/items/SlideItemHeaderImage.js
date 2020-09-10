import React, { Fragment, useState, useEffect, useRef } from 'react'
import Css from './SlideItemHeaderImage.module.scss'
import classNames from 'classnames'
import { TimeText } from '~/components/common'
import { AiFillClockCircle } from "react-icons/ai";
import { Server } from "../../../Properties";

function SlideImage(props){
    const { size = 'sm', imageUrl, imageWidth, imageHeight, saleEnd, discountRate, blyReview, remainedCnt = 0, onClick = () => null,

    showTimeText = false
    } = props

    //sold out 크기
    let  type;
    let blyReviewType;
    if(size === 'sm'){
        type = Css.typeSm
        blyReviewType = Css.blyReviewSm
    }else if(size === 'md'){
        type = Css.typeMd
        blyReviewType = Css.blyReviewMd
    }else if(size === 'lg'){
        type = Css.typeLg
        blyReviewType = Css.blyReviewLg
    }
    else if(size === 'xl'){
        type = Css.typeXl
        blyReviewType = Css.blyReviewXl
    }
    else if(size === 'xxl'){
        type = Css.typeXxl
        blyReviewType = Css.blyReviewXxl
    }

    const blyReviewUrl = Server.getImageURL() + 'JleRBdtW6CR7.png'

    return(
        <div className={classNames(Css.container, type)}
             style={{width: imageWidth, height: imageHeight}}
        >

            {
                showTimeText && <div className={Css.timeTextLayer}>
                    <AiFillClockCircle size={16} />
                    <div>예약구매</div>
                    <div><TimeText date={saleEnd} formatter={'[D-]DD HH[:]mm[:]ss'}/></div>
                </div>
            }

            {
                props.blyReview && <img className={classNames(Css.blyReview, blyReviewType)} src={`${blyReviewUrl}`} alt="블리리뷰" />
            }

            <img className={Css.img} src={`${imageUrl}`} alt="상품사진" />
            { remainedCnt <= 0 && <div className={Css.mask}>SOLD OUT</div> }
        </div>
    )
}

export default SlideImage