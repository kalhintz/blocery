import React, {useEffect, useState} from 'react'
import styled from 'styled-components';
import {getValue} from '~/styledComponents/Util'
import Css from './SuperReward.module.scss'
import { SlideItemHeaderImage} from '~/components/common'

import {getSuperRewardList, getEventInfo} from '~/lib/shopApi'
import {getEventNoByType} from '~/lib/adminApi'
import {Server} from '~/components/Properties'
import { Div, Flex, Link} from '~/styledComponents/shared'
import moment from 'moment-timezone'
import Content from './Content'
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import loadable from '@loadable/component'

const SuperRewardHistory = loadable(() => import(
    /* webpackChunkName: "superRewardHistory" */
    /* webpackPrefetch: true */
    './SuperRewardHistory'))

const DefaultImage = loadable(() =>
    /* webpackChunkName: "superRewardDefaultImage" */
    /* webpackPrefetch: true */
    import('./DefaultImage'))

const TransparentPanel = styled(Div)`
    background-color: rgba(0,0,0, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    border-top-left-radius: ${getValue(8)};
    border-top-right-radius: ${getValue(8)};
`;

const ImageContainer = styled.div`
    position: relative;
    
    img {
        border-top-left-radius: ${getValue(8)};
        border-top-right-radius: ${getValue(8)};
    }
    
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
    
    //SOLD OUT 배경색상도 라운딩 처리
    & > div > div:last-child {
        border-top-left-radius: ${getValue(8)};
        border-top-right-radius: ${getValue(8)};
    }
    
    //SOLD OUT 배경색상도 라운딩 처리
    ::after {
        border-top-left-radius: ${getValue(8)};
        border-top-right-radius: ${getValue(8)};
    }
`;

const Card = ({goods}) => {

    const startTime = moment(goods.superRewardStart)

    return(
        <Div p={16} >

            <Link to={`/goods?goodsNo=${goods.goodsNo}`}
                  display={'block'}

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
                                    <Div fontSize={22} lineHeight={42} mt={10}>
                                        {
                                            goods.superRewardReward + '% 적립'
                                        }
                                    </Div>
                                </Div>
                                <TransparentPanel></TransparentPanel>
                            </>
                        )
                    }

                </ImageContainer>

                <Content
                    goods={{...goods}}
                />

            </Link>
        </Div>
    )
}

const BannerContainer = styled.div`
    img {
        width: 100%;
    }
`

export default function(props){
    const [data, setData] = useState()
    const [html, setHtml] = useState()
    const [historyComp, setHistoryComp] = useState(null)

    const [showHistory, setShowHistory] = useState(false)

    useEffect(()=>{

        async function fetch(){

            setMainHtml()

            const data = await getData()

            setData(data)
        }
        fetch()

    }, [])

    async function getData(){
        const {data} = await getSuperRewardList()

        return data
    }

    async function setMainHtml() {

        //설정되어 있는 이벤트 번호 가져오기
        const {data: eventNo} = await getEventNoByType('superReward')

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

    if(!data || data === undefined) { return null }


    return(
        <Div
            relative
            // className={Css.wrap}
            bg={'backgroundDark'}
            shadow={'sm'}
        >

            <BannerContainer>
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
                                <DefaultImage />
                            )

                    )
                }
            </BannerContainer>

            <Div py={16}>
                {
                    data.length > 0 && (
                        <Div bold textAlign={'center'} mb={5} fontSize={15} fg={'danger'}>
                            <Div>* 본 슈퍼리워드는 보유하고 있는 재고 소진 시 </Div>
                            <Div>결제완료 시간에 따라 자동취소처리 될 수 있습니다.</Div>
                        </Div>
                    )
                }
                {
                    (data.length <= 0) && (
                        <Div py={9} px={10} bg={'green'} fg={'white'} fontSize={16}
                             rounded={3}
                             mx={20}
                             textAlign={'center'} >진행중인 슈퍼리워드 상품이 없습니다</Div>
                    )
                }

                {
                    data.map((goods, index) =>
                        <Card goods={goods} key={'goods'+index} />
                    )
                }





            </Div>


            <Div py={16}>
                <Flex px={16} cursor={1} onClick={() => setShowHistory(!showHistory)}>
                    <u>종료된 이벤트 보기</u>
                    <Div ml={5}>
                        {
                            showHistory ? <IoIosArrowDown/> : <IoIosArrowUp/>
                        }
                    </Div>
                </Flex>
                {
                    showHistory && <SuperRewardHistory />
                }
            </Div>

            <hr className={Css.lineLight}/>
            <div className={Css.detailCard}>
                <div className={Css.header}>
                    <div>공통 유의사항</div>
                </div>
                <div className={Css.body}>
                    - 본 슈퍼리워드는 당사 사정에 따라 변동되거나 조기 종료될 수 있습니다.
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
                    - 당사의 내부 기준에 따라, 한 고객이 여러 이메일아이디를 사용해 상품을 구매한 것으로 추정될 시 슈퍼리워드 보상 대상에서 제외될 수 있습니다.<br/>
                    - 본 슈퍼리워드는 보유하고 있는 재고 소진 시 결제완료 시간에 따라 자동취소처리 될 수 있습니다.
                </div>
            </div>
            <div style={{height: 60}}></div>

        </Div>
    )
}