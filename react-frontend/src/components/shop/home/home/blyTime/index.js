import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components';
import {getValue} from '~/styledComponents/Util'
import Css from './BlyTime.module.scss'
import { TimeText, SlideItemHeaderImage, Sticky } from '~/components/common'
import { Icon } from '~/components/common/icons'
import classNames from 'classnames'

import {getBlyTimeList, getEventInfo} from '~/lib/shopApi'
import {getEventNoByType} from '~/lib/adminApi'
import { exchangeWon2BLCTHome } from "~/lib/exchangeApi"
import {Server} from '~/components/Properties'
import ComUtil from '~/util/ComUtil'

import {Link} from 'react-router-dom'
import { Div, Span, Flex } from '~/styledComponents/shared/Layouts'
import { Badge } from '~/styledComponents/mixedIn'
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
    const {goodsNm, defaultDiscountRate, defaultCurrentPrice, consumerPrice, blyTimeReward} = goods
    return(
        <Div {...rest} fontSize={12}>
            <Div bold mb={10} fontSize={16} textAlign={'left'}>{goodsNm}</Div>
            <Flex mb={10} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'secondary'}>판매가</CustomBadge></Div>
                <Div fg={'danger'} bold textAlign={'right'} mr={5}>{defaultDiscountRate.toFixed(0)}%</Div>
                <Div bold fg={'black'} mr={5}>{ComUtil.addCommas(defaultCurrentPrice)}원</Div>
                <Div fontSize={12} fg={'dark'}><del>{ComUtil.addCommas(consumerPrice)}원</del></Div>
                <Flex fontSize={12} ml={10} alignItems={'center'}>
                    <Icon name={'blocery'} />
                    <Div ml={2}><Span bold><exchangeWon2BLCTHome.Tag won={defaultCurrentPrice}/></Span> BLY</Div>
                    {/*<Div ml={2}><Span bold>{exchangeWon2BLCTHome(defaultCurrentPrice)}</Span> BLY</Div>*/}
                </Flex>
            </Flex>
            <Flex fg={'black'} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'green'}>블리타임</CustomBadge></Div>
                <Div>카드결제 금액의 <Span bold>{ComUtil.addCommas(blyTimeReward.toFixed(0))}%</Span> 적립</Div>
            </Flex>
        </Div>
    )
}

export default function(props){
    const [data, setData] = useState()
    const [html, setHtml] = useState()
    const [isTop, setIsTop] = useState(false)

    const timeRef = useRef(null)


    useEffect(()=>{

        async function fetch(){

            setMainHtml()

            const data = await getData()
            // console.log({eventData})
            // setHtml()
            setData(data)
            if(data.length > 0){
                window.addEventListener('scroll', handleScroll)
            }
        }
        fetch()

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }

    }, [])

    async function getData(){
        const {data} = await getBlyTimeList()
        return data
    }

    async function setMainHtml() {

        //설정되어 있는 이벤트 번호 가져오기
        const {data: eventNo} = await getEventNoByType('blyTime')

        console.log({eventNo})

        let eventContent;

        if (eventNo) {
            //이벤트 번호로 이벤트 html 데이터 가져오기
            const {data: eventData} = await getEventInfo(eventNo)

            eventContent = eventData.eventContent || false
        }else {
            eventContent = false
        }

        setHtml(eventContent)

    }
    function handleScroll(){

        if(timeRef){
            const {top} = timeRef.current.getBoundingClientRect()

            if(top === 0){
                if(!isTop){
                    setTimeout(()=>{
                        setIsTop(true)
                    }, 100)

                }
            }else{
                // if(isTop){
                setIsTop(false)
                // }
            }
        }


    }

    let diffDays
    let inBlyTimePeriod
    if(!data || data === undefined) { return null }
    else {
        inBlyTimePeriod = data[0] ? data[0].inBlyTimePeriod : false
        const diffDaysStart = data[0] && moment.duration(moment().diff(data[0].blyTimeStart))._data.days
        const diffDaysEnd = data[0] && moment.duration(moment().diff(data[0].blyTimeEnd))._data.days

        if (inBlyTimePeriod) {
            diffDays = diffDaysEnd
        } else {
            diffDays = diffDaysStart
        }
    }

    return(
        <div className={Css.wrap}>

            {
                html !== undefined && (
                    html ? (
                            <div className={"ql-container ql-snow ql-no-border"}>
                                <div className={'ql-editor ql-no-border ql-no-resize p-0'}
                                     dangerouslySetInnerHTML={{
                                         __html: html
                                     }}></div>
                            </div>) :
                        (
                            <img className={Css.img} src='https://blocery.com/images/JwRFxncDPl8l.jpg' alt="블리타임이미지"/>
                        )
                )
            }



            <Sticky innerRef={timeRef}>
                <div className={classNames(Css.timeText, isTop && Css.timeTextSmall)}>
                    {
                        data.length <= 0 && <div className={Css.noTimeSale}>진행중인 블리타임 상품이 없습니다</div>
                    }

                    {
                        data.length > 0 && (
                            inBlyTimePeriod ?
                                <Div>{ComUtil.utcToString(data[0].blyTimeEnd, 'YYYY.MM.DD HH:mm')} 블리타임이 종료됩니다</Div>
                                :
                                <Div>{ComUtil.utcToString(data[0].blyTimeStart, 'YYYY.MM.DD HH:mm')} 블리타임이 시작됩니다</Div>
                        )
                    }
                    {
                        data.length > 0 && <TimeText date={moment(inBlyTimePeriod ? data[0].blyTimeEnd : data[0].blyTimeStart )} formatter={diffDays>=0 ?'[D-Day] DD HH[:]mm[:]ss': '[D-]DD HH[:]mm[:]ss'}/>
                    }
                </div>
            </Sticky>


            {
                data.map((goods, index) =>
                    <Link key={'goods'+index} to={`/goods?goodsNo=${goods.goodsNo}`} className={Css.link}>
                        <div className={Css.outline}>
                            <SlideItemHeaderImage {...goods} imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl} size={'xl'} blyReview={goods.blyReviewConfirm} />
                            <Content

                                goods={{...goods}}

                                style={{
                                    padding: 16,
                                    marginBottom: 34
                                }}
                            />
                        </div>
                        {/*<HrHeavyX2 mb={15} />*/}
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
                    - 본 블리타임은 당사 사정에 따라 변동되거나 조기 종료될 수 있습니다.
                </div>
            </div>
            <hr className={Css.lineLight}/>
            <div className={Css.detailCard}>
                <div className={Css.header}>
                    <div>구매 시 유의사항</div>
                </div>
                <div className={Css.body}>
                    - 상품 구매 시 <b>카드결제 금액을 기준으로 설정된 %만큼 적립</b>됩니다.<br/>
                    - 상품 구매 시 다수 고객이 접속할 경우 결제완료 기준으로 선착순 구매 처리되며, 이후 결제 건은 취소 처리될 수 있습니다.<br/>
                    - 당사의 내부 기준에 따라, 한 고객이 여러 이메일아이디를 사용해 상품을 구매한 것으로 추정될 시 블리타임 보상 대상에서 제외될 수 있습니다.
                </div>
            </div>
            <div style={{height: 60}}></div>

        </div>
    )
}