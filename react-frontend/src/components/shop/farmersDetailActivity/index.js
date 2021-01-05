import React, { useState, useEffect } from 'react'
import { getLoginUser } from '~/lib/loginApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import { getConsumerGoodsByProducerNoSorted } from '~/lib/goodsApi'
import { getFarmDiaryBykeys, getRegularShop, addRegularShop, delRegularShopByProducerNoAndConsumerNo } from '~/lib/shopApi'
import { Container, Row, Col, Badge } from 'reactstrap'
import { Hr, FarmersVisitorSummaryCard, ProducerProfileCard, FarmDiaryCard, SlideItemHeaderImage, SlideItemContent } from '~/components/common'
import { B2cBackHeader } from '~/components/common/headers'
import classNames from 'classnames'
import { Webview } from "~/lib/webviewApi";
import { Link } from 'react-router-dom'
import ComUtil from '~/util/ComUtil'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Server } from '~/components/Properties'
const SubTitle = (props) => {
    const {onClick} = props
    return (
        <div className='bg-white'
             style={{
                 position: 'sticky',
                 top: 0,
                 zIndex: 3
             }}
        >
            <Container>
                <Row>
                    <Col xs={12}>
                        <div className={classNames('pt-2 pb-2 f4 text-dark font-weight-bold', props.className)} onClick={onClick}>{props.children}</div>
                    </Col>
                </Row>
            </Container>
            <hr className='m-0'/>
        </div>
    )
}

const FarmersDetailActivity = (props) => {

    // const { producerNo } = props.match.params
    const { producerNo } = ComUtil.getParams(props)

    const [producer, setProducer] = useState()                              //생산자
    const [goodsList, setGoodsList] = useState([])                          //상품목록
    const [farmDiaries, setFarmDiaries] = useState([])                      //생산일지목록
    const [farmDiariesTotalCount, setFarmDiariesTotalCount] = useState(0)   //생산일지목록 전체 카운트
    const [isAddedRegularShop, setIsAddedRegularShop] = useState(false)
    const [visitorCardForceUpdateIndex, setVisitorCardForceUpdateIndex] = useState(0)   //방문자수, 단골수 실시간 새로고침용 인덱스



    useEffect(() => {
        if(producerNo){

            //생산자 정보
            getProducerByProducerNo(producerNo).then(({data}) => {
                setProducer(data)
            })

            //단골등록여부
            setRegularShopState()


            const sorter = {direction: 'ASC', property: 'saleEnd'}
            //상품 정보
            getConsumerGoodsByProducerNoSorted(producerNo, sorter).then(({data}) => {
                if(data && data.length > 4){
                    data = data.slice(0, 4)   //4개 상품만 바인딩
                }
                setGoodsList(data)
            })

            //재배일지 정보
            getFarmDiaryBykeys({producerNo: producerNo}, true, 1, 5).then(({data}) => {
                setFarmDiaries(data.farmDiaries)
                setFarmDiariesTotalCount(data.totalCount)
            })


        }
    }, [])

    //생산자 판매상품 페이지로 이동
    function movePage({type, payload}) {
        // Webview.closePopupAndMovePage(`/producersGoodsList?producerNo=${producerNo}`)

        switch (type){
            //생산자 판매상품 이동
            case 'PRODUCERS_GOODS_LIST' :
                props.history.push(`/producersGoodsList?producerNo=${producerNo}`)
                // Webview.openPopup(`/producersGoodsList?producerNo=${producerNo}`, true)
                break
            //생산자 생산일지 이동
            case 'PRODUCERS_FARMDIARY_LIST' :
                props.history.push(`/producersFarmDiaryList?producerNo=${producerNo}`)
                // Webview.openPopup(`/producersFarmDiaryList?producerNo=${producerNo}`, true)
                break
            //팝업창 닫고 상품상세 강제 이동
            case 'GOODS_DETAIL' :
                // Webview.closePopupAndMovePage(`/goods?goodsNo=${payload.goodsNo}`)
                props.history.push(`/goods?goodsNo=${payload.goodsNo}`)
                break
            case 'PRODUCERS_FARMDIARY' :
                props.history.push(`/producersFarmDiary?diaryNo=${payload.diaryNo}`)
                // Webview.openPopup(`/producersFarmDiary?diaryNo=${payload.diaryNo}`, true)
                break
        }
    }

    function notify(msg, toastFunc) {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    //단골등록여부
    async function setRegularShopState() {
        const consumer = await getConsumer()
        if(!consumer) return

        //단골등록여부
        const {data: regularShop} = await getRegularShop(consumer.consumerNo, producerNo)

        if(regularShop === ''){
            setIsAddedRegularShop(false)

        }else{
            setIsAddedRegularShop(true)
        }
    }

    //consumer 반환
    async function getConsumer() {
        const loginUser = await getLoginUser()

        //로그인되어 있지 않거나 소비자가 아닌경우 null 반환
        if(loginUser === '' || loginUser.userType !== 'consumer') {
            return null
        }
        return { consumerNo: loginUser.uniqueNo, userType: loginUser.userType }
    }

    //단골추가(ADD_REGULARSHOP) | 단골취소(CANCEL_REGULARSHOP) 클릭
    async function onRegularShopClick({type}) {

        const consumer = await getConsumer()

        if(!consumer){
            alert('소비자 로그인 후 이용 가능합니다')
            Webview.openPopup('/login')
            return
        }

        const {consumerNo} = consumer

        switch (type){
            case 'ADD_REGULARSHOP' :
                notify('단골농장으로 등록하였습니다.', toast.info);
                await addRegularShop({producerNo, consumerNo})
                setIsAddedRegularShop(true)
                //방문 및 단골 강제 업데이트
                setVisitorCardForceUpdateIndex(visitorCardForceUpdateIndex+1)
                break
            case 'CANCEL_REGULARSHOP' :
                notify('단골농장 등록을 취소하였습니다.', toast.info);
                await delRegularShopByProducerNoAndConsumerNo(producerNo, consumerNo)
                setIsAddedRegularShop(false)
                //방문 및 단골 강제 업데이트
                setVisitorCardForceUpdateIndex(visitorCardForceUpdateIndex+1)
                break
        }
    }

    if(!producerNo){
        return (
            <div className='p-4 bg-light m-2 text-center'>
                <h6 className='lead'>"없는 생산자이거나 잘못된 정보 입니다"</h6>
                <h3><Link to={'/'} className={'text-info'}>Blocery 홈으로 이동하기</Link></h3>
            </div>
        )
    }

    if(!producer) return null

    return(
        <div className={'position-relative'}>

            <B2cBackHeader title={'상점정보'} history={props.history} />

            {/* X 버튼 */}
            {/*<div>*/}
            {/*/!*<div style={{position: 'absolute', top: 0, left: 0, zIndex: 2}} onClick={()=>{Webview.closePopup()}}>*!/*/}
            {/*<div style={{position: 'absolute', top: 0, left: 0, zIndex: 2}} onClick={()=>{props.history.goBack()}}>*/}
            {/*<XButton />*/}
            {/*</div>*/}
            {/*</div>*/}

            {/* 방문자수, 단골수 카드*/}
            <div style={{position: 'absolute', top: 66, right: 10, zIndex:2}}>
                <FarmersVisitorSummaryCard producerNo={producerNo} forceUpdateIndex={visitorCardForceUpdateIndex} />
            </div>

            {/* 생산자 프로필 */}
            <ProducerProfileCard {...producer} />

            {/* 단골등록 버튼 */}
            <div className='mb-3 text-center'>
                {
                    isAddedRegularShop ? <Badge className='p-2' color={'secondary'} onClick={onRegularShopClick.bind(this, {type:'CANCEL_REGULARSHOP'})}>단골취소</Badge> : <Badge className='p-2' color={'danger'} onClick={onRegularShopClick.bind(this, {type:'ADD_REGULARSHOP'})}> + 단골등록</Badge>
                }
            </div>
            <Hr />

            {/* 판매상품 */}
            <SubTitle onClick={movePage.bind(this, {type: 'PRODUCERS_GOODS_LIST'})}>판매상품 ></SubTitle>
            <div className='p-2'>
                <Container>
                    <Row>
                        {
                            goodsList.map(goods =>
                                <Col key={'goods_'+goods.goodsNo} xs={6} sm={4} lg={3} xl={2} className='p-1'>
                                    <div onClick={movePage.bind(this, {type: 'GOODS_DETAIL', payload: {goodsNo: goods.goodsNo}})}>
                                        <SlideItemHeaderImage
                                            imageHeight={130}
                                            // saleEnd={goods.saleEnd}
                                            imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                            discountRate={Math.round(goods.discountRate)}
                                            remainedCnt={goods.remainedCnt}
                                            blyReview={goods.blyReviewConfirm}
                                        />
                                        <SlideItemContent
                                            className={'p-2'}
                                            directGoods={goods.directGoods}
                                            goodsNm={goods.goodsNm}
                                            currentPrice={goods.currentPrice}
                                            consumerPrice={goods.consumerPrice}
                                            discountRate={goods.discountRate}
                                        />
                                    </div>
                                </Col>
                            )
                        }

                    </Row>
                </Container>
            </div>
            <Hr />

            {/* 생산일지 */}
            <SubTitle onClick={movePage.bind(this, {type: 'PRODUCERS_FARMDIARY_LIST'})}>생산일지 ></SubTitle>

            <div className='pt-3'>
                {
                    farmDiaries.map((farmDiary, index) =>
                        <FarmDiaryCard key={`diaryCard_${index}`} {...farmDiary}
                                       onClick={movePage.bind(this, {type: 'PRODUCERS_FARMDIARY', payload: {diaryNo: farmDiary.diaryNo}})}
                        />
                    )
                }
            </div>

            <ToastContainer/>
        </div>

    )
}

export default FarmersDetailActivity
