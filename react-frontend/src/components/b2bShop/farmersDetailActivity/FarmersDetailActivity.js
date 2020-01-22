import React, { Fragment, useState, useEffect } from 'react'
import { getB2bLoginUser } from '~/lib/b2bLoginApi'
import { getSellerBySellerNo } from '~/lib/b2bSellerApi'
import { getBuyerFoodsBySellerNoSorted } from '~/lib/b2bFoodsApi'
import { getRegularShop, addRegularShop, delRegularShopBySellerNoAndBuyerNo} from '~/lib/b2bShopApi'
import { Container, Row, Col, Badge } from 'reactstrap'
import { Hr, XButton, FarmersVisitorSummaryCard, SellerProfileCard, B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common'
import classNames from 'classnames'
import { Webview } from "../../../lib/webviewApi";
import { Link } from 'react-router-dom'
import ComUtil from '~/util/ComUtil'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Server } from '~/components/Properties'
const SubTitle = (props) => {
    const {onClick} = props
    return (
        <div className='bg-white mb-2'
             style={{
                 position: '-webkit-sticky',
                 position: 'sticky',
                 top: 0,
                 zIndex: 3
             }}
        >
            <Container>
                <Row>
                    <Col xs={12} className='p-0'>
                        <div className={classNames('ml-2 mr-2 pt-2 pb-2 f4 text-dark font-weight-bold', props.className)} onClick={onClick}>{props.children}</div>
                    </Col>
                </Row>
            </Container>
            <hr className='m-0'/>
        </div>
    )
}

const FarmersDetailActivity = (props) => {

    // const { sellerNo } = props.match.params
    const { sellerNo } = ComUtil.getParams(props)

    const [seller, setSeller] = useState()                              //판매자
    const [foodsList, setFoodsList] = useState([])                          //상품목록
    // const [farmDiaries, setFarmDiaries] = useState([])                      //생산일지목록
    // const [farmDiariesTotalCount, setFarmDiariesTotalCount] = useState(0)   //생산일지목록 전체 카운트
    const [isAddedRegularShop, setIsAddedRegularShop] = useState(false)
    const [visitorCardForceUpdateIndex, setVisitorCardForceUpdateIndex] = useState(0)   //방문자수, 단골수 실시간 새로고침용 인덱스



    useEffect(() => {
        if(sellerNo){
            
            //생산자 정보
            getSellerBySellerNo(sellerNo).then(({data}) => {
                setSeller(data)
            })

            //단골등록여부
            setRegularShopState()


            const sorter = {direction: 'ASC', property: 'saleEnd'}
            //상품 정보
            getBuyerFoodsBySellerNoSorted(sellerNo, sorter).then(({data}) => {
                if(data && data.length > 4){
                    data = data.slice(0, 4)   //4개 상품만 바인딩
                }
                setFoodsList(data)
            })

            //재배일지 정보
            // getFarmDiaryBykeys({sellerNo: sellerNo}, true, 1, 5).then(({data}) => {
            //     setFarmDiaries(data.farmDiaries)
            //     setFarmDiariesTotalCount(data.totalCount)
            // })


        }
    }, [])

    //생산자 판매상품 페이지로 이동
    function movePage({type, payload}) {
        // Webview.closePopupAndMovePage(`/producersGoodsList?producerNo=${producerNo}`)

        switch (type){
            //생산자 판매상품 이동
            case 'PRODUCERS_GOODS_LIST' :
                props.history.push(`/sellersFoodsList?sellerNo=${sellerNo}`)
                break
            // //생산자 생산일지 이동
            // case 'PRODUCERS_FARMDIARY_LIST' :
            //     props.history.push(`/producersFarmDiaryList?sellerNo=${sellerNo}`)
            //     break
            //팝업창 닫고 상품상세 강제 이동
            case 'GOODS_DETAIL' :
                Webview.closePopupAndMovePage(`/b2b/foods?foodsNo=${payload.foodsNo}`)
                break
            // case 'PRODUCERS_FARMDIARY' :
            //     props.history.push(`/producersFarmDiary?diaryNo=${payload.diaryNo}`)
            //     break
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
        const buyer = await getBuyer()
        if(!buyer) return

        //단골등록여부
        const {data: regularShop} = await getRegularShop(buyer.buyerNo, sellerNo)

        if(regularShop === ''){
            setIsAddedRegularShop(false)

        }else{
            setIsAddedRegularShop(true)
        }
    }

    //buyer 반환
    async function getBuyer() {
        const loginUser = await getB2bLoginUser()

        //로그인되어 있지 않거나 소비자가 아닌경우 null 반환
        if(loginUser === '' || loginUser.userType !== 'buyer') {
            return null
        }
        return { buyerNo: loginUser.uniqueNo, userType: loginUser.userType }
    }

    //단골추가(ADD_REGULARSHOP) | 단골취소(CANCEL_REGULARSHOP) 클릭
    async function onRegularShopClick({type}) {

        const buyer = await getBuyer()

        if(!buyer){
            alert('소비자 로그인 후 이용 가능합니다')
            Webview.openPopup('/b2b/login')
            return
        }

        const {buyerNo} = buyer

        switch (type){
            case 'ADD_REGULARSHOP' :
                notify('즐겨찾는 업체로 등록하였습니다.', toast.info);
                await addRegularShop({sellerNo, buyerNo})
                setIsAddedRegularShop(true)
                //방문 및 단골 강제 업데이트
                setVisitorCardForceUpdateIndex(visitorCardForceUpdateIndex+1)
                break
            case 'CANCEL_REGULARSHOP' :
                notify('즐겨찾는 업체 등록을 취소하였습니다.', toast.info);
                await delRegularShopBySellerNoAndBuyerNo(sellerNo, buyerNo)
                setIsAddedRegularShop(false)
                //방문 및 단골 강제 업데이트
                setVisitorCardForceUpdateIndex(visitorCardForceUpdateIndex+1)
                break
        }
    }

    if(!sellerNo){
        return (
            <div className='p-4 bg-light m-2 text-center'>
                <h6 className='lead'>"없는 판매자이거나 잘못된 정보 입니다"</h6>
                <h3><Link to={'/'} className={'text-primary'}>Blocery 홈으로 이동하기</Link></h3>
            </div>
        )
    }

    return(
        <div>

            {/* X 버튼 */}
            <div>
                <div style={{position: 'absolute', top: 0, left: 0, zIndex: 2}} onClick={()=>{Webview.closePopup()}}>
                    <XButton />
                </div>
            </div>

            {/* 방문자수, 단골수 카드*/}
            <div style={{position: 'absolute', top: 10, right: 10, zIndex:2}}>
                <FarmersVisitorSummaryCard sellerNo={sellerNo} forceUpdateIndex={visitorCardForceUpdateIndex} />
            </div>

            {/* 생산자 프로필 */}
            <SellerProfileCard {...seller} />

            {/* 단골등록 버튼 */}
            <div className='mb-3 text-center'>
                {
                    isAddedRegularShop ? <Badge className='p-2' color={'secondary'} onClick={onRegularShopClick.bind(this, {type:'CANCEL_REGULARSHOP'})}>즐겨찾기 취소</Badge>
                        : <Badge className='p-2' color={'danger'} onClick={onRegularShopClick.bind(this, {type:'ADD_REGULARSHOP'})}> + 즐겨찾기 등록</Badge>
                }
            </div>
            <Hr />

            {/* 판매상품 */}
            <SubTitle onClick={movePage.bind(this, {type: 'PRODUCERS_GOODS_LIST'})}>판매상품 ></SubTitle>
            <div className='mb-2 ml-2'>
                <Container>
                    <Row>
                        {
                            foodsList.map(foods =>
                                <Col key={'foods'+foods.foodsNo} xs={6} sm={4} lg={3} xl={2} className='p-0'>
                                    <div className='mr-2 mb-2 border' onClick={movePage.bind(this, {type: 'GOODS_DETAIL', payload: {foodsNo: foods.foodsNo}})}>
                                        <B2bSlideItemHeaderImage
                                            imageHeight={130}
                                            // saleEnd={goods.saleEnd}
                                            imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                            discountRate={Math.round(foods.discountRate)}
                                            remainedCnt={foods.remainedCnt}
                                        />
                                        <B2bSlideItemContent
                                            className={'p-2'}
                                            directGoods={foods.directGoods}
                                            goodsNm={foods.goodsNm}
                                            currentPrice={foods.currentPrice}
                                            consumerPrice={foods.consumerPrice}
                                            // discountRate={goods.discountRate}
                                        />
                                    </div>
                                </Col>
                            )
                        }

                    </Row>
                </Container>
            </div>
            <ToastContainer/>
        </div>

    )
}

export default FarmersDetailActivity
