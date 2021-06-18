import React, {useEffect, useState, useRef} from 'react'
import Css from './TimeSale.module.scss'
import { SlideItemHeaderImage, Sticky  } from '~/components/common'
import { Icon } from '~/components/common/icons'
import {getTimeSaleList, getEventInfo, getPotentTimeList, getPotenCouponMaster} from '~/lib/shopApi'
import {getEventNoByType} from '~/lib/adminApi'
import { exchangeWon2BLCTHome } from "~/lib/exchangeApi"
import {Server} from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components';
import {getValue} from '~/styledComponents/Util'
import { Div, Span, Flex, Link } from '~/styledComponents/shared'
import { Badge } from '~/styledComponents/mixedIn'
import moment from 'moment-timezone'
import {RiCoupon3Line} from 'react-icons/ri'

const CustomBadge = styled(Badge)`
    padding-top: ${getValue(4)};
    padding-bottom: ${getValue(4)};
    text-align: center;
    color: white;
    font-size: ${getValue(12)};
`;
const TransparentPanel = styled(Div)`
    background-color: rgba(0,0,0, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;
const ImageContainer = styled.div`
    position: relative;
    
    &::after {
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0, 0.1);
        // z-index: 99;
    }
`;

function Card(props){
    console.log('=============')
    const {goods, ...rest} = props
    const {goodsNm, defaultDiscountRate, defaultCurrentPrice, consumerPrice, timeSaleDiscountRate, timeSalePrice, timeSaleStart, timeSaleEnd} = goods
    const startTime = moment(goods.timeSaleStart)

    const [couponMaster, setCouponMaster] = useState()

    useEffect(() => {
        getPotenCoupon()
    }, [])

    //포텐타임중 쿠폰 마스터 조회
    const getPotenCoupon = async () => {
        //포텐타임중인 상품일 경우 쿠폰 마스터 조회
        // if (goods.inTimeSalePeriod) {
        //     alert()
        const {data} = await getPotenCouponMaster(goods.goodsNo)
        setCouponMaster(data)
        console.log({data})
        // }
    }


    if (!couponMaster) return null

    const potenPrice = timeSalePrice - (timeSalePrice * (couponMaster.potenCouponDiscount / 100))
    const potenDiscountRate =  (100 - ((potenPrice / goods.consumerPrice) * 100))
    return(
        <Link to={`/goods?goodsNo=${goods.goodsNo}`}
              display={'block'}
              bg={'white'}

        >
            <ImageContainer>
                <SlideItemHeaderImage {...goods} imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl} size={'xl'} blyReview={goods.blyReviewConfirm} />
                {
                    (startTime.isAfter(moment())) && (
                        <>
                            <Div absolute zIndex={1} center bold fg={'white'} width={'100%'} top={'50%'} left={'50%'} textAlign={'center'}>

                                <Div fontSize={22} >
                                    {
                                        startTime.format("MM[월 ]DD[일]")
                                    }
                                </Div>
                                <Div fontSize={50} lineHeight={52}>
                                    {
                                        startTime.format("HH:mm")
                                    }
                                </Div>
                            </Div>
                            <TransparentPanel></TransparentPanel>
                        </>
                    )
                }
            </ImageContainer>

            <Div {...rest} fontSize={12}>
                <Div fg={'dark'} fontSize={12} mb={10} >
                    {`이벤트 기간 : ${ComUtil.utcToString(timeSaleStart, 'MM.DD[일 ]HH:mm')} ~ ${ComUtil.utcToString(timeSaleEnd, 'MM.DD[일 ]HH:mm')}`}
                </Div>
                <Div bold mb={10} fontSize={16} textAlign={'left'}>{goodsNm}</Div>
                <Flex mb={10} fontSize={14}>
                    <Div mr={10} width={80}><CustomBadge bg={'secondary'}>상시판매가</CustomBadge></Div>
                    <Div fg={'danger'} bold textAlign={'right'} mr={5}>{defaultDiscountRate.toFixed(0)}%</Div>
                    <Div bold fg={'black'} mr={5}>{ComUtil.addCommas(defaultCurrentPrice)}원</Div>
                    <Div fontSize={12} fg={'dark'}><del>{ComUtil.addCommas(consumerPrice)}원</del></Div>
                    <Flex fontSize={12} ml={10} alignItems={'center'}>
                        <Icon name={'blocery'} />
                        <Div ml={2}><Span bold><exchangeWon2BLCTHome.Tag won={defaultCurrentPrice}/></Span> BLY</Div>
                    </Flex>
                </Flex>
                <Flex fg={'black'} fontSize={14} alignItems={'flex-start'}>
                    <Div mr={10} width={80}><CustomBadge bg={'green'}>포텐타임가</CustomBadge></Div>
                    <Flex>
                        <Div fg={'danger'} bold textAlign={'right'} mr={5}>{potenDiscountRate.toFixed(0)}%</Div>
                        <Div bold fg={'black'} mr={5}>{ComUtil.addCommas(potenPrice.toFixed(0))}원</Div>
                        <Div fontSize={12} fg={'dark'}><del>{ComUtil.addCommas(consumerPrice)}원</del></Div>
                        <Flex fontSize={12} ml={10}>
                            <Icon name={'blocery'} />
                            <Div ml={2}><Span bold><exchangeWon2BLCTHome.Tag won={potenPrice}/></Span> BLY</Div>
                        </Flex>
                    </Flex>

                    {
                        // `[쿠폰가] (${couponMaster.potenCouponDiscount}%) 포텐타임 자동쿠폰 사용 시 ${ComUtil.addCommas(timeSalePrice - (timeSalePrice * (couponMaster.potenCouponDiscount / 100)))}원`
                    }
                    {/*70% 3,000원 10000원 34BLY*/}
                    {/*(포텐타임 자동쿠폰 할인)  timeSalePrice 7000원 * (0.5)*/}
                </Flex>
                <Flex mt={10} fontSize={13} fg={'black'} lighter>
                    <Flex><RiCoupon3Line/></Flex>
                    <Div ml={5} >포텐타임 기간 내 사용 가능한 추가할인 쿠폰 제공</Div>
                </Flex>
            </Div>

        </Link>
    )
}

const TimeSale = (props) => {

    const [data, setData] = useState()
    const [html, setHtml] = useState()
    const [isTop, setIsTop] = useState(false)

    const timeRef = useRef(null)

    useEffect(() => {

        async function fetch() {
            setMainHtml()
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
        //TODO 2월 행사중에만 쓰이는 포텐타임 다중상품
        const {data} = await getTimeSaleList()    // 2월 이벤트 종료후 원복
        //const {data} = await getPotentTimeList()
        console.log({potenData: data})
        return data

    }



    async function setMainHtml() {

        //설정되어 있는 이벤트 번호 가져오기
        const {data: eventNo} = await getEventNoByType('potenTime')

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
        <Div relative
            // className={Css.wrap}
             bg={'backgroundDark'}
             shadow={'sm'}
        >
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
                            <img className={Css.img} src='https://blocery.com/images/RjGTBBzizSNB.jpg' alt="포텐타임이미지"/>
                        )
                )
            }

            {/*//2월이벤트 후 아래 Sticky로 원복*/}
            <Sticky innerRef={timeRef}>
                {
                    (data.length <= 0) &&
                    <Div py={16}>
                        <Div py={9} px={10} bg={'green'} fg={'white'} fontSize={16}
                             rounded={3}
                             mx={20}
                             textAlign={'center'}>진행중인 포텐타임 상품이 없습니다</Div>
                    </Div>
                }
            </Sticky>


            {/*21년2월 이벤트 후 다시사용  -- 사용안함 */}
            {/*<Sticky innerRef={timeRef}>*/}
            {/*    <div className={classNames(Css.timeText, isTop && Css.timeTextSmall)}>*/}
            {/*        {*/}
            {/*            data.length <= 0 && <div className={Css.noTimeSale}>진행중인 포텐타임 상품이 없습니다</div>*/}
            {/*        }*/}
            {/*        {*/}
            {/*            data.length > 0 && (*/}
            {/*                inTimeSalePeriod ?*/}
            {/*                    <div>{ComUtil.utcToString(data[0].timeSaleEnd, 'YYYY.MM.DD HH:mm')} 포텐타임이 종료됩니다</div>*/}
            {/*                    :*/}
            {/*                    <div>{ComUtil.utcToString(data[0].timeSaleStart, 'YYYY.MM.DD HH:mm')} 포텐타임이 시작됩니다</div>*/}
            {/*            )*/}
            {/*        }*/}
            {/*        {*/}
            {/*            data.length > 0 && <TimeText date={moment(inTimeSalePeriod ? data[0].timeSaleEnd : data[0].timeSaleStart )} formatter={diffDays>=0 ?'[D-Day] DD HH[:]mm[:]ss': '[D-]DD HH[:]mm[:]ss'}/>*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*</Sticky>*/}


            {
                data.map((goods, index) =>
                    <Card
                        key={'goods'+index}
                        goods={{...goods}}
                        style={{
                            padding: 16,
                            paddingBottom: 48
                        }}
                    />
                )
            }

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
                    - 포텐타임 상품 구매 시 추가할인 쿠폰이 자동으로 지급되어 사용이 되며, 상시 판매가에 추가할인이 적용됩니다.<br/>
                    - 구매 시 추가할인 쿠폰을 사용 가능한 다른 쿠폰으로 변경하면 추가할인이 적용되지 않습니다.<br/>
                    - 포텐타임 상품 구매 후 취소 시 쿠폰이 재발급되지 않으며, 동일한 포텐타임 상품을 구매할 경우에는 추가할인 쿠폰이 자동 재지급되어 사용 가능합니다.
                    (단, 포텐타임 기간이 종료되면 추가할인 쿠폰 사용이 불가능합니다.)<br/>
                    - 상품 구매 시 다수 고객이 접속할 경우 결제완료 기준으로 선착순 구매 처리되며, 이후 결제 건은 취소 처리될 수 있습니다.<br/>
                    - 당사의 내부 기준에 따라, 한 고객이 여러 이메일아이디를 사용해 상품을 구매한 것으로 추정될 시 포텐타임 대상에서 제외될 수 있습니다.
                </div>
            </div>
            <div style={{height: 60}}></div>


        </Div>
    )
}
export default TimeSale