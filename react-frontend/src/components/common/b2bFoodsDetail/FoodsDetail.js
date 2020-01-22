import React, { Fragment, Component, useState, useEffect } from 'react'
import moment from 'moment-timezone'

//import './GoodsDetail.scss'
import Style from './FoodsDetail.module.scss'
import { Button, Badge, Container, Row, Col } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus, faClock, faBolt } from '@fortawesome/free-solid-svg-icons'
import ComUtil from '~/util/ComUtil'
import { Const } from '../../Properties'

import classNames from 'classnames'

//Open source 로 대체. 기존 컴포넌트는 사용중지
// import GoodsImage from './GoodsImage'

// import TabSection from './TabSection'
import { Webview } from '~/lib/webviewApi'

import { HrGoodsPriceCard, ModalAlert, ModalWithNav, B2bAddCart, IconStarGroup, ToastUIEditorViewer, AddDeal } from '~/components/common'
import { Server } from '~/components/Properties'

import { getB2bLoginUserType, getB2bLoginUser } from '~/lib/b2bLoginApi'
import { getFoodsReviewByFoodsNo, getFoodsQnAByKeys, getOtherFoodsReviewByItemNo } from '~/lib/b2bShopApi'
import { getFoodsContent} from '~/lib/b2bFoodsApi'

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css"
import { ToastContainer, toast } from 'react-toastify'                              //토스트

import TabSection from './TabSection'
import FarmDiaryContent from './FarmDiaryContent'
import FoodsReviewContent from './FoodsReviewContent'
import FoodsQnAContent from './FoodsQnAContent'

const Hr = () => <hr className='m-0 bg-secondary border-0' style={{height: 10}}/>

const FoodsDetail = (props) => {

    //hooks
    const [tabId, setTabId] = useState(1)

    //구매후기
    const [foodsReviewData, setFoodsReviewData] = useState([])
    const [foodsReviewDataPage,setFoodsReviewDataPage] = useState(1)
    const [foodsReviewDataTotalCount, setFoodsReviewDataTotalCount] = useState(0)
    const [foodsReviewDataAvgScore, setFoodsReviewDataAvgScore] = useState(0)

    //구매후기-다른상품후기
    const [foodsReviewOtherData, setFoodsReviewOtherData] = useState([])
    const [foodsReviewOtherDataPage,setFoodsReviewOtherDataPage] = useState(1)
    const [foodsReviewOtherDataTotalCount, setFoodsReviewOtherDataTotalCount] = useState(0)

    //상품문의
    const [foodsQnAData, setFoodsQnAData] = useState([])
    const [foodsQnADataPage, setFoodsQnADataPage] = useState(1)
    const [foodsQnADataTotalCount, setFoodsQnADataTotalCount] = useState(0)

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    const [foodsContent, setFoodsContent]= useState('')

    const [cartModal, setCartModal] = useState(false);

    const [orderModal, setOrderModal] = useState(false);

    const [finishedSaleFoods, setFinishedSaleFoods] = useState(false);
    const [finishCurrentPrice, setFinishCurrentPrice] = useState(0);

    //화면 로드시 생산일지, 구매후기, 다른상품구매후기 조회(이때 하는 이유는 사용자 리뷰를 미리 바인딩 해야 하기 때문)
    useEffect(() => {
        searchFoodsContent()
        searchFoodsReviewData()
        searchFoodsReviewOtherData()
        searchFoodsQnAData()

        // 판매종료
        const isFinishFoods = isFinishedDate(ComUtil.utcToTimestamp(props.foods.saleEnd));
        // if(props.foods.saleStopped)
        // 판매중지

        if(isFinishFoods || props.foods.saleStopped) {
            setFinishedSaleFoods(true); // 판매마감 상품인지 판단
            setFinishCurrentPrice(0);
        }

    }, [])


    const isFinishedDate = (monentDate) => {
        const now = ComUtil.utcToTimestamp(moment());
        return (monentDate < now);
    }


    const serverImageUrl = Server.getImageURL()
    const serverThumbnailUrl = Server.getImageURL()

    const onCartClick = async () => {
        if(await isOkay()){
            setCartModal(true)
        }
    }

    const onCartPopupClose = (res) => {
        //장바구니담기 팝업에서 구매하거가기 눌렀을 경우 /cartList 로 이동
        if(res) props.history.push(res)
        else
            setCartModal(!cartModal)
    }

    //즉시구매 클릭
    const onBuyClick = async () => {
        if(await isOkay()){
            setOrderModal(true) //구매하기 모달
        }
    }

    //즉시구매 모달 닫기
    const onOrderPopupClose = (res) => {
        setOrderModal(!orderModal)
    }

    //즉시구매 모달에서 확인 클릭
    async function moveDirectBuy(res) {
        if(await isOkay()){
            alert('TODO 장비구니에 추가 후 장바구니로 이동');
            //TODO 장비구니에 추가 후 장바구니로 이동
            // Webview.openPopup(`/b2b/directBuy?foodsNo=${props.foods.foodsNo}&qty=${res.qty}`, true) //구매로 이동 : true=noRefresh.(단순 팝업 닫아서 상세화면이 refresh될때 Home으로 가능현상 방지
        }
    }

    //구매가능여부 (로그인 및 소비자 인지 체크)
    async function isOkay() {
        if (!(await isUserTypeOf('buyer'))) {
            alert('소비자 로그인 후 이용 가능 합니다')
            Webview.openPopup('/b2b/login',  true); //로그인으로 이동팝업
            return false
        }
        return true
    }

    //userType 체크
    const isUserTypeOf = async (userType) => {
        //로그인 check
        const {data:loginUserType} = await getB2bLoginUserType();
        return loginUserType === userType ? true : false
    }

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    //상품설명, 구매안내, 재배일자, 후기 클릭
    async function onTabSectionClick(tabId){
        switch(tabId){

            //상품설명
            // case 1:
            //     return tabContent.foodsExplanation = tabContent.foodsExplanation || FoodsExplanation()
            //구매안내
            // case 2:
            //     return tabContent.buyingInfo = tabContent.buyingInfo || BuyingInfo()
            //생산일지
            case 3:
                //데이터가 없는 경우만 조회함
                // farmDiaryData.length <= 0 && searchFarmDiaryData()
                break
            //구매후기
            case 4:
                //데이터가 없는 경우만 조회함
                foodsReviewData.length <= 0 && searchFoodsReviewData()
                break
            //상품문의
            case 5:
                foodsQnAData.length <= 0 && searchFoodsQnAData()
                break
        }
        setTabId(tabId)
    }

    //구매안내
    function BuyingInfo() {
        const { goodsTypeCode  } = props.foods
        console.log(goodsTypeCode)

        //식품(농수산물) Agricultural food
        if(goodsTypeCode === 'A'){
            return(
                <ul className={classNames(Style.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
                    <li>·포장단위별 용량(중량), 수량, 크기</li><li>상품정보참조</li>
                    <li>·생산자/수입자</li><li>{`${props.seller.farmName} / ${props.seller.name}`}</li>
                    <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
                    <li>·농축수산물 표시사항</li><li>상품정보참조</li>
                    <li>·제품구성</li><li>상품정보참조</li>
                    <li>·보관방법/취급방법</li><li>상품정보참조</li>
                    <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
                    <li>·비고</li><li>상품정보참조</li>
                    <li>·AS 정보</li><li>상품정보참조</li>
                </ul>
            )
        }
        //가공식품 Processed food
        else if(goodsTypeCode === 'P'){
            return(
                <ul className={classNames(Style.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
                    <li>·식품유형</li><li>상품정보참조</li>
                    <li>·생산자/수입자</li><li>{`${props.seller.name} / ${props.seller.farmName}`}</li>
                    <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
                    <li>·원재료명 및 함량</li><li>상품정보참조</li>
                    <li>·영양성분</li><li>상품정보참조</li>
                    <li>·표시광고 사전심의필</li><li>상품정보참조</li>
                    <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
                    <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
                    <li>·수입여부(유/무)</li><li>상품정보참조</li>
                    <li>·비고</li><li>상품정보참조</li>
                    <li>·AS 정보</li><li>상품정보참조</li>
                </ul>
            )
        }
        //건강기능식품 Health functional food
        else if(goodsTypeCode === 'H'){
            return(
                <ul className={classNames(Style.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
                    <li>·식품유형</li><li>상품정보참조</li>
                    <li>·생산자/수입자</li><li>{`${props.seller.name} / ${props.seller.farmName}`}</li>
                    <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
                    <li>·원재료명 및 함량</li><li>상품정보참조</li>
                    <li>·영양정보</li><li>상품정보참조</li>
                    <li>·기능정보</li><li>상품정보참조</li>
                    <li>·주의사항</li><li>상품정보참조</li>
                    <li>·표시광고 사전심의필</li><li>상품정보참조</li>
                    <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
                    <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
                    <li>·수입여부(유/무)</li><li>상품정보참조</li>
                    <li>·의약품여부(유/무/해당없음)</li><li>상품정보참조</li>
                    <li>·비고</li><li>상품정보참조</li>
                    <li>·AS 정보</li><li>상품정보참조</li>
                </ul>
            )
        }

        return null
    }

    //구매후기 db조회 & 렌더링
    async function searchFoodsReviewData(){
        const page = foodsReviewDataPage
        const { data: {foodsReviews, totalCount} } = await getFoodsReviewByFoodsNo(props.foods.foodsNo, false, page, 5)
        console.log({foodsReviews, totalCount})


        setFoodsReviewData(foodsReviews)
        setFoodsReviewDataPage(page+1)
        setFoodsReviewDataTotalCount(totalCount)

        //리뷰 평균
        totalCount > 0 && setFoodsReviewDataAvgScore(ComUtil.roundDown(ComUtil.sum(foodsReviews, 'score') / totalCount, 1))
    }

    //구매후기-다른상품후기 db조회 & 렌더링
    async function searchFoodsReviewOtherData(){
        const page = foodsReviewOtherDataPage
        const { data: {foodsReviews, totalCount} } = await getOtherFoodsReviewByItemNo(props.foods.foodsNo, false, page, 5)

        setFoodsReviewOtherData(foodsReviewData.concat(foodsReviews))
        setFoodsReviewOtherDataPage(page+1)
        setFoodsReviewOtherDataTotalCount(totalCount)
    }

    //상품문의 db조회 & 렌더링
    async function searchFoodsQnAData(isMore = false){
        let page = foodsQnADataPage

        //추가로드시 페이지 증가하고 아닐때는 page를 0으로 초기화해서 재검색
        if(isMore) page++
        else page = 1


        const {data: {foodsQnas, totalCount}} = await getFoodsQnAByKeys({
            foodsNo: props.foods.foodsNo,
            isPaging: true,
            limit: page,
            page: 5
        })

        console.log({page, foodsQnas, totalCount})

        if(isMore){
            console.log('foodsQnAData.concat(foodsQnas) : ', foodsQnAData.concat(foodsQnas))
            setFoodsQnAData(foodsQnAData.concat(foodsQnas))

        }
        else{
            console.log('foodsQnas : ', foodsQnas)
            setFoodsQnAData(foodsQnas)

        }
        setFoodsQnADataPage(page)
        setFoodsQnADataTotalCount(totalCount)
    }

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    async function searchFoodsContent(){

        if (props.foods.goodsContentFileName) {
            const {data: foodsContent} = await getFoodsContent(props.foods.goodsContentFileName)
            setFoodsContent(foodsContent);
        }
    }

    //더보기 클릭
    async function onMoreClick({type}){
        switch (type){
            case 'FARMDIARY':           //생산일지

                break
            case 'GOODSREVIEW':         //상품후기
                searchFoodsReviewData()
                break
            case 'GOODSREVIEW_OTHER':   //다른상품후기
                searchFoodsReviewOtherData()
                break
            case 'GOODSQNA':            //상품문의
                searchFoodsQnAData(true)
                break
        }
    }


    let {
        foodsNo,            //순번
        // sellerNo,         //생산자번호
        goodsNm,            //상품명
        goodsImages,        //상품이미지
        searchTag,          //태그
        // itemNo,             //품목번호
        itemName,             //품목명
        breedNm,            //품종
        productionArea,     //생산지
        // cultivationNo,      //재배방법번호
        cultivationNm,      //재배방법명
        saleEnd,            //판매마감일

        expectShippingStart,//예상발송시작일
        expectShippingEnd,  //예상발송마감일
        pesticideYn,        //농약유무
        packUnit,           //포장단위
        packAmount,         //포장 양
        packCnt,            //판매개수
        //shipPrice,          //출하 후 판매가
        //reservationPrice,   //예약 시 판매가
        consumerPrice,      //소비자 가격
        currentPrice,       //현재 가격
        discountRate,       //현재 할인율
        priceSteps,         //3단계 할인단계 [{stepNo, until, price, discountRate}]
        selectedPriceStep,  //할인단계
        //cultivationDiary  //재배일지
        // contractHash,       //블록체인 저장된 해시값

        remainedCnt,         //남은판매개수
        directFoods,         //즉시판매상품 여부

        standardUnit,	    //기준단가단위
        standardUnitPrice,	//기준단가가격
        directDelivery,	    //직배송 여부
        taekbaeDelivery,	//택배송 여부
        deliveryText,	    //배송안내문구
        waesangDeal,	    //외상결제 여부
        cardDeal,	        //카드결제 여부
        foodsQty,           //제공수량(ea) 제품 하나당 몇개인지

    } = props.foods

    const { name, farmName } = props.seller
    const images = goodsImages.map((image)=>{
        return {
            original: serverImageUrl + image.imageUrl,
            thumbnail: serverThumbnailUrl + image.imageUrl,
        }
    })

    return(


        <Fragment>
            <ImageGallery
                showNav={true}
                autoPlay={false}
                showIndex={true}
                showBullets={true}
                showPlayButton={true}
                showFullscreenButton={false}
                showThumbnails={false}
                items={images}
            />

            {/* 상품제목 & 가격 */}
            <div className='d-flex p-3'>
                <div className='flex-grow-1'>
                    <div>{goodsNm}</div>
                    <span className='f2 font-weight-bolder'>
                        {ComUtil.addCommas(currentPrice)}원
                    </span>
                    <strike className='ml-2'>{ComUtil.addCommas(consumerPrice)}</strike>
                    <span className='f2 ml-2 text-danger font-weight-bold'> {Math.round(discountRate)}% </span>
                </div>
                {/*공유기능 코멘트 <div className=''>*/}
                {/*<FontAwesomeIcon icon={faShareAltSquare} size={'2x'} color={'#17A2B8'}/>*/}
                {/*</div>*/}
            </div>
            <hr className='m-0'/>

            <div className='m-3 f6'>
                {
                    directDelivery && (
                        <div className='mb-1'>
                            <Badge>직배송</Badge><span className='text-secondary'> 업체에서 직접 배송이 가능한 상품입니다</span>
                        </div>
                    )
                }
                {
                    waesangDeal && (
                        <div>
                            <Badge color={'warning'}>외상거래</Badge><span className='text-secondary'> 외상이 가능한 상품입니다</span>
                        </div>
                    )
                }
            </div>


            <hr className='m-0'/>

            {/* 상품정보 */}
            <ul className={classNames(Style.goodsInfo, 'p-3 m-0 f6 text-secondary')}>
                <li>·판매자</li>
                {/*<li className={'text-primary cursor-pointer'} onClick={()=>{Webview.openPopup(`/b2b/sellerDetail?sellerNo=${props.foods.sellerNo}`, true)}}><u>{farmName}</u></li>*/}
                <li>{farmName}</li>
                <li>·생산지</li>
                <li>{productionArea}</li>
                <li>·중량/용량</li>
                <li>{packAmount}{packUnit}</li>

                <li>·제공수량</li>
                <li>{foodsQty}ea</li>

                <li>·기준단가</li>
                <li>{standardUnit}당 {ComUtil.addCommas(standardUnitPrice)}원</li>
                <li>·배송구분</li>
                {
                    directDelivery ? <li>직배</li> : <li>택배</li>
                }

            </ul>
            <hr className='m-0'/>
            <div className='p-3 f6 text-secondary bg-light'>
                <span className='font-weight-bold'>[배송안내]</span>
                <div style={{whiteSpace:'pre-line'}}>
                    {deliveryText}
                </div>
            </div>
            <hr className='m-0'/>

            <div className='p-3'>
                <IconStarGroup score={foodsReviewDataAvgScore} size={'lg'} />
                <span className='ml-2'>/</span>
                <span className='ml-2'>
                    {foodsReviewDataAvgScore}
                </span>
                <span className='ml-4 f6'>
                    {` ${ComUtil.addCommas(packCnt - remainedCnt)}개 구매 | 잔여 ${ComUtil.addCommas(remainedCnt)}개`}
                </span>
            </div>
            {/*태그영역 코멘트 <div className='p-3 bg-light f6 text-primary mb-3'>*/}
            {/*#{searchTag}*/}
            {/*</div>*/}
            <div className='d-flex'>
                <TabSection tabId={1} text={'상품정보'} isActive={tabId === 1} onClick={onTabSectionClick.bind(this, 1)} />
                <TabSection tabId={2} text={'상세정보'} isActive={tabId === 2} onClick={onTabSectionClick.bind(this, 2)} />
                <TabSection tabId={4} text={`구매후기(${ComUtil.addCommas(foodsReviewDataTotalCount)})`} isActive={tabId === 4} onClick={onTabSectionClick.bind(this, 4)} />
                <TabSection tabId={5} text={`상품문의(${ComUtil.addCommas(foodsQnADataTotalCount)})`} isActive={tabId === 5} onClick={onTabSectionClick.bind(this, 5)} />
            </div>
            {
                //상품설명
                (tabId === 1) && (
                    <div className='p-1'>
                        {
                            <ToastUIEditorViewer
                                height="400px"
                                initialValue={foodsContent}
                            />
                            // props.foods.contentImages.map(image => <img className={Style.contentImage} key={image.imageUrl} src={serverImageUrl+image.imageUrl}/>)
                        }
                    </div>
                )
            }
            {
                //상세정보
                (tabId === 2) && <BuyingInfo />
            }
            {
                //구매후기
                (tabId === 4 && foodsReviewData) && <FoodsReviewContent foodsReviews={foodsReviewData} totalCount={foodsReviewDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW'})} isVisibleStar={true} isVisibleTitle={false} />
            }
            {
                //구매후기-다른상품후기
                (tabId === 4 && foodsReviewOtherData) &&
                <Fragment>
                    <Hr/>
                    <div className='pt-3 pl-3 pb-3 text-left font-weight-bold f6'>다른상품후기</div>
                    <hr  className='m-0'/>

                    <FoodsReviewContent foodsReviews={foodsReviewOtherData} totalCount={foodsReviewOtherDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW_OTHER'})} isVisibleStar={false} isVisibleTitle={true}/>
                </Fragment>
            }

            {
                //상품문의
                (tabId === 5 && foodsQnAData) && <FoodsQnAContent foods={props.foods} foodsQnAs={foodsQnAData} totalCount={foodsQnADataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSQNA'})} onFoodsQnASaved={searchFoodsQnAData} />
            }
            <br/>
            <br/>
            <br/>
            <div className={'p-2 d-flex bg-light position-fixed w-100'} style={{left: 0, bottom: 0}}>
                {
                    remainedCnt > 0 ? (
                        finishedSaleFoods ? (
                            <Button size={'lg'} className={'rounded-0'}  color='secondary' block disabled>판매종료</Button>

                        ) : (

                            <Button size={'lg'} className='font-weight-bold rounded-0' color='primary' block onClick={onCartClick}><FontAwesomeIcon icon={faCartPlus}/> 구매하기</Button>

                        )
                    ) : (
                        <Button size={'lg'} className={'rounded-0'} color='secondary' block disabled>품절</Button>
                    )
                }
            </div>

            <ModalWithNav onClose={onCartPopupClose} title={'장바구니 담기'} show={cartModal} noPadding>
                <B2bAddCart {...props.foods}/>
            </ModalWithNav>

            <ModalWithNav onClose={onOrderPopupClose} title={'즉시구매'} show={orderModal} noPadding>
                <AddDeal {...props.foods} onClick={moveDirectBuy}/>
            </ModalWithNav>
            <ToastContainer/>
        </Fragment>
    )

}
export default FoodsDetail