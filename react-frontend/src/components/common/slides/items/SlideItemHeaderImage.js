import React from 'react'
import Css from './SlideItemHeaderImage.module.scss'
import classNames from 'classnames'
import { TimeText } from '~/components/common'
import { AiFillClockCircle } from "react-icons/ai";
import { Server } from "../../../Properties";
import moment from 'moment'
import {Div, Flex, Img} from "~/styledComponents/shared";
import RewardCoupon from '~/images/icons/ic_rewardCoupon.png'

function SlideImage(props){
    const { size = 'sm', imageUrl, imageWidth, imageHeight, saleEnd, discountRate, blyReview, remainedCnt = 0,
        buyingRewardFlag,
        onClick = () => null,

    showTimeText = false
    } = props

    //sold out 크기
    let  type;
    let iconWidth;
    let position;
    if(size === 'sm'){
        type = Css.typeSm
        iconWidth = 35
        position = 7
    }else if(size === 'md'){
        type = Css.typeMd
        iconWidth = 40
        position = 10
    }else if(size === 'lg'){
        type = Css.typeLg
        iconWidth = 50
        position = 15
    }
    else if(size === 'xl'){
        type = Css.typeXl
        iconWidth = 60
        position = 20
    }
    else if(size === 'xxl'){
        type = Css.typeXxl
        iconWidth = 70
        position = 25
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
                    <div>
                        <TimeText date={saleEnd} formatter={(moment.duration(moment().diff(saleEnd))._data.days >= 0 &&
                            moment.duration(moment().diff(saleEnd))._data.months >= 0) ? '[D-Day] DD HH[:]mm[:]ss' : '[D-]DD HH[:]mm[:]ss'}/>
                    </div>
                </div>
            }
            <Flex absolute left={position} bottom={position}>
                {
                    props.blyReview && <Img src={`${blyReviewUrl}`} width={iconWidth} alt="블리리뷰" />
                }
                {
                    //blyReview 와 겹치도록 함
                    buyingRewardFlag && <Img src={RewardCoupon} width={iconWidth} ml={props.blyReview ? 2 : 0 }/>
                }
            </Flex>

            <img className={Css.img} src={`${imageUrl}`} alt="상품사진" />
            { remainedCnt <= 0 && <div className={Css.mask}>SOLD OUT</div> }
        </div>
    )
}

export default SlideImage