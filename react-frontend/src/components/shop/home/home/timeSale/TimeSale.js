import React, {useEffect, useState, useRef} from 'react'
import Css from './TimeSale.module.scss'
import { TimeText, SlideItemHeaderImage, Sticky } from '~/components/common'
import { Icon } from '~/components/common/icons'
import classNames from 'classnames'
import {getTimeSaleList} from '~/lib/shopApi'
import { exchangeWon2BLCTHome } from "~/lib/exchangeApi"
import {Server} from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
// import {Icons} from '~/components/common/icons'
import {Link} from 'react-router-dom'

import styled from 'styled-components';
import {getValue} from '~/styledComponents/Util'
import { Div, Span, Img, Flex, Right, Hr, Fixed } from '~/styledComponents/shared/Layouts'
import { HrThin, Badge } from '~/styledComponents/mixedIn'

import moment from 'moment'

const CustomBadge = styled(Badge)`
    padding-top: ${getValue(4)};
    padding-bottom: ${getValue(4)};
    text-align: center;
    color: white;
    font-size: ${getValue(12)};
`;

function Content(props){
    const {goods, ...rest} = props
    const {goodsNm, defaultDiscountRate, defaultCurrentPrice, consumerPrice, timeSaleDiscountRate, timeSalePrice} = goods

    return(
        <Div {...rest} fontSize={12}>
            <Div bold mb={10} fontSize={16} textAlign={'left'}>{goodsNm}</Div>
            <Flex mb={10} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'secondary'}>판매가</CustomBadge></Div>
                <Div fg={'danger'} bold textAlign={'right'} mr={5}>{defaultDiscountRate.toFixed(0)}%</Div>
                <Div bold fg={'black'} mr={5}>{ComUtil.addCommas(defaultCurrentPrice)}원</Div>
                <Div fontSize={12} fg={'dark'}><strike>{ComUtil.addCommas(consumerPrice)}원</strike></Div>
                <Flex fontSize={12} ml={10} alignItems={'center'}>
                    <Icon name={'blocery'} />
                    <Div ml={2}><Span bold>{exchangeWon2BLCTHome(defaultCurrentPrice)}</Span> BLY</Div>
                </Flex>
            </Flex>
            <Flex fg={'black'} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'green'}>포텐타임가</CustomBadge></Div>
                <Div fg={'danger'} bold textAlign={'right'} mr={5}>{timeSaleDiscountRate.toFixed(0)}%</Div>
                <Div bold fg={'black'} mr={5}>{ComUtil.addCommas(timeSalePrice)}원</Div>
                <Div fontSize={12} fg={'dark'}><strike>{ComUtil.addCommas(consumerPrice)}원</strike></Div>
                <Flex fontSize={12} ml={10} alignItems={'center'}>
                    <Icon name={'blocery'} />
                    <Div ml={2}><Span bold>{exchangeWon2BLCTHome(timeSalePrice)}</Span> BLY</Div>
                </Flex>
            </Flex>
        </Div>
    )
}

export default function(props) {

    const [data, setData] = useState()
    const [isTop, setIsTop] = useState(false)

    const timeRef = useRef(null)


    useEffect(() => {

        async function fetch() {
            const data = await getData()
            setData(data)
            if (data.length > 0) {
                window.addEventListener('scroll', handleScroll)
            }
        }

        fetch()

        // console.log("tiemSale!!!!!!!!!!")
        // setLastSeenTimeSale(); //timeSale에 진입한 시간 update to Consumer

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }

    }, [])

    async function getData() {
        const {data} = await getTimeSaleList()
        return data

    }

    function handleScroll() {

        if (timeRef) {
            const {top} = timeRef.current.getBoundingClientRect()

            if (top === 0) {
                if (!isTop) {
                    setTimeout(() => {
                        setIsTop(true)
                    }, 100)

                }
            } else {
                // if(isTop){
                setIsTop(false)
                // }
            }
        }


    }
    if (!data) return null

    const inTimeSalePeriod = data[0] ? data[0].inTimeSalePeriod : false

    let diffDays = ''

    if (data[0]) {
        const diffDaysStart = moment.duration(moment().diff(data[0].timeSaleStart))._data.days
        const diffDaysEnd = moment.duration(moment().diff(data[0].timeSaleEnd))._data.days

        if (inTimeSalePeriod) {
            diffDays = diffDaysEnd
        } else {
            diffDays = diffDaysStart
        }
    }

    return(
        <div className={Css.wrap}>
            <img className={Css.img} src='https://blocery.com/images/RjGTBBzizSNB.jpg' alt="타임세일이미지"/>
            <Sticky innerRef={timeRef}>
                <div className={classNames(Css.timeText, isTop && Css.timeTextSmall)}>
                    {
                        data.length <= 0 && <div className={Css.noTimeSale}>진행중인 포텐타임 상품이 없습니다</div>
                    }

                    {
                        data.length > 0 && (
                            inTimeSalePeriod ?
                                <div>{ComUtil.utcToString(data[0].timeSaleEnd, 'YYYY.MM.DD HH:mm')} 포텐타임이 종료됩니다</div>
                                :
                                <div>{ComUtil.utcToString(data[0].timeSaleStart, 'YYYY.MM.DD HH:mm')} 포텐타임이 시작됩니다</div>
                        )
                    }
                    {
                        data.length > 0 && <TimeText date={moment(inTimeSalePeriod ? data[0].timeSaleEnd : data[0].timeSaleStart )} formatter={diffDays>=0 ?'[D-Day] DD HH[:]mm[:]ss': '[D-]DD HH[:]mm[:]ss'}/>
                    }
                </div>
            </Sticky>


            {
                data.map((goods, index) =>
                    <Link key={'goods'+index} to={`/goods?goodsNo=${goods.goodsNo}`} className={Css.link}>
                        <div className={Css.outline}>
                            <SlideItemHeaderImage {...goods} imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl} size={'xl'} blyReview={goods.blyReviewConfirm}/>
                            <Content

                                goods={{...goods}}

                                     style={{
                                         padding: 16,
                                     }}
                            />
                        </div>
                    </Link>
                )
            }
            {/*<div style={{height: 60}}></div>*/}

            <hr className={Css.lineLight}/>
            <div className={Css.detailCard}>
                <div className={Css.header}>
                    <div>공통 유의사항</div>
                </div>
                <div className={Css.body}>
                    - 본 포텐타임은 당사 사정에 따라 변동되거나 조기 종료될 수 있습니다.
                </div>
            </div>
            <hr className={Css.lineLight}/>
            <div className={Css.detailCard}>
                <div className={Css.header}>
                    <div>구매 시 유의사항</div>
                </div>
                <div className={Css.body}>
                    - 상품 구매 시 다수 고객이 접속할 경우 결제완료 기준으로 선착순 구매 처리되며, 이후 결제 건은 취소 처리될 수 있습니다.<br/>
                    - 당사의 내부 기준에 따라, 한 고객이 여러 이메일아이디를 사용해 상품을 구매한 것으로 추정될 시 포텐타임 대상에서 제외될 수 있습니다.
                </div>
            </div>
            <div style={{height: 60}}></div>


        </div>
    )
}