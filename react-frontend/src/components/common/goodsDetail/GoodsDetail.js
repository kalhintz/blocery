import React, { Fragment, Component, useState, useEffect } from 'react'
import moment from 'moment-timezone'

//import './GoodsDetail.scss'
import Style from './GoodsDetail.module.scss'
import { Button, Badge, Container } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus, faClock, faBolt, faSpinner } from '@fortawesome/free-solid-svg-icons'
import ComUtil from '~/util/ComUtil'
import { Const } from '../../Properties'

import classNames from 'classnames'

//Open source 로 대체. 기존 컴포넌트는 사용중지
// import GoodsImage from './GoodsImage'

// import TabSection from './TabSection'
import { Webview } from '~/lib/webviewApi'

import { FarmDiaryCard, HrGoodsPriceCard, TimeText, ModalAlert, ModalWithNav, AddCart, AddOrder, IconStarGroup, ToastUIEditorViewer } from '~/components/common'
import { Server } from '~/components/Properties'

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import { getFarmDiaryBykeys, getGoodsReviewByGoodsNo, getGoodsQnAByKeys, getOtherGoodsReviewByItemNo } from '~/lib/shopApi'
import { getGoodsContent} from '~/lib/goodsApi'

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css"
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import TabSection from './TabSection'
import FarmDiaryContent from './FarmDiaryContent'
import GoodsReviewContent from './GoodsReviewContent'
import GoodsQnAContent from './GoodsQnAContent'
import { setMissionClear} from "~/lib/eventApi"

const Hr = () => <hr className='m-0 bg-secondary border-0' style={{height: 10}}/>

const GoodsDetail = (props) => {

    //hooks
    const [tabId, setTabId] = useState(1)

    //생산일지
    const [farmDiaryData, setFarmDiaryData] = useState([])
    const [farmDiaryDataPage, setFarmDiaryDataPage] = useState(1)
    const [farmDiaryDataTotalCount, setFarmDiaryDataTotalCount] = useState(0)

    //구매후기
    const [goodsReviewData, setGoodsReviewData] = useState([])
    const [goodsReviewDataPage,setGoodsReviewDataPage] = useState(1)
    const [goodsReviewDataTotalCount, setGoodsReviewDataTotalCount] = useState(0)
    const [goodsReviewDataAvgScore, setGoodsReviewDataAvgScore] = useState(0)

    //구매후기-다른상품후기
    const [goodsReviewOtherData, setGoodsReviewOtherData] = useState([])
    const [goodsReviewOtherDataPage,setGoodsReviewOtherDataPage] = useState(1)
    const [goodsReviewOtherDataTotalCount, setGoodsReviewOtherDataTotalCount] = useState(0)

    //상품문의
    const [goodsQnAData, setGoodsQnAData] = useState([])
    const [goodsQnADataPage, setGoodsQnADataPage] = useState(1)
    const [goodsQnADataTotalCount, setGoodsQnADataTotalCount] = useState(0)

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    const [goodsContent, setGoodsContent]= useState('')

    const [cartModal, setCartModal] = useState(false);

    const [orderModal, setOrderModal] = useState(false);

    const [finishedSaleGoods, setFinishedSaleGoods] = useState(false);
    const [finishCurrentPrice, setFinishCurrentPrice] = useState(0);

    //화면 로드시 생산일지, 구매후기, 다른상품구매후기 조회(이때 하는 이유는 사용자 리뷰를 미리 바인딩 해야 하기 때문)
    useEffect(() => {
        searchGoodsContent()
        searchFarmDiaryData()
        searchGoodsReviewData()
        searchGoodsReviewOtherData()
        searchGoodsQnAData()

        // 판매종료
        const isFinishGoods = isFinishedDate(ComUtil.utcToTimestamp(props.goods.saleEnd));
        // if(props.goods.saleStopped)
        // 판매중지

        if(isFinishGoods || props.goods.saleStopped) {
            setFinishedSaleGoods(true); // 판매마감 상품인지 판단
            setFinishCurrentPrice(0);
        }

        //missionEvent 4번.
        if(!props.goods.directGoods)
            setMissionClear(4).then( (response) => console.log('GoodsDetail:missionEvent4:' + response.data )); //상품상세 확인.

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
            Webview.openPopup(`/directBuy?goodsNo=${props.goods.goodsNo}&qty=${res.qty}`, true) //구매로 이동 : true=noRefresh.(단순 팝업 닫아서 상세화면이 refresh될때 Home으로 가능현상 방지
        }
    }

    //구매가능여부 (로그인 및 소비자 인지 체크)
    async function isOkay() {
        if (!(await isUserTypeOf('consumer'))) {
            alert('소비자 로그인 후 이용 가능 합니다')
            Webview.openPopup('/login',  true); //로그인으로 이동팝업
            return false
        }
        return true
    }

    //userType 체크
    const isUserTypeOf = async (userType) => {
        //로그인 check
        const {data:loginUserType} = await getLoginUserType();
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
            //     return tabContent.goodsExplanation = tabContent.goodsExplanation || GoodsExplanation()
            //구매안내
            // case 2:
            //     return tabContent.buyingInfo = tabContent.buyingInfo || BuyingInfo()
            //생산일지
            case 3:
                //데이터가 없는 경우만 조회함
                farmDiaryData.length <= 0 && searchFarmDiaryData()
                break
            //구매후기
            case 4:
                //데이터가 없는 경우만 조회함
                goodsReviewData.length <= 0 && searchGoodsReviewData()
                break
            //상품문의
            case 5:
                goodsQnAData.length <= 0 && searchGoodsQnAData()
                break
        }
        setTabId(tabId)
    }

    //구매안내
    function BuyingInfo() {
        const { goodsTypeCode  } = props.goods
        console.log(goodsTypeCode)

        //식품(농수산물) Agricultural food
        if(goodsTypeCode === 'A'){
            return(
                <ul className={classNames(Style.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
                    <li>·포장단위별 용량(중량), 수량, 크기</li><li>상품정보참조</li>
                    <li>·생산자/수입자</li><li>{`${props.producer.farmName} / ${props.producer.name}`}</li>
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
                    <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
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
                    <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
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

    //생산일지 db조회 & 렌더링
    async function searchFarmDiaryData(){
        const page = farmDiaryDataPage
        const { data: {farmDiaries, totalCount} } = await getFarmDiaryBykeys({producerNo: props.goods.producerNo, itemNo: props.goods.itemNo}, true, page, 5)

        setFarmDiaryData(farmDiaryData.concat(farmDiaries))
        setFarmDiaryDataPage(page+1)
        setFarmDiaryDataTotalCount(totalCount)
    }

    //구매후기 db조회 & 렌더링
    async function searchGoodsReviewData(){
        const page = goodsReviewDataPage
        const { data: {goodsReviews, totalCount} } = await getGoodsReviewByGoodsNo(props.goods.goodsNo, false, page, 5)

        setGoodsReviewData(goodsReviews)
        setGoodsReviewDataPage(page+1)
        setGoodsReviewDataTotalCount(totalCount)

        //리뷰 평균
        totalCount > 0 && setGoodsReviewDataAvgScore(ComUtil.roundDown(ComUtil.sum(goodsReviews, 'score') / totalCount, 1))
    }

    //구매후기-다른상품후기 db조회 & 렌더링
    async function searchGoodsReviewOtherData(){
        const page = goodsReviewOtherDataPage
        const { data: {goodsReviews, totalCount} } = await getOtherGoodsReviewByItemNo(props.goods.goodsNo, false, page, 5)

        setGoodsReviewOtherData(goodsReviewData.concat(goodsReviews))
        setGoodsReviewOtherDataPage(page+1)
        setGoodsReviewOtherDataTotalCount(totalCount)
    }

    //상품문의 db조회 & 렌더링
    async function searchGoodsQnAData(isMore = false){
        let page = goodsQnADataPage

        //추가로드시 페이지 증가하고 아닐때는 page를 0으로 초기화해서 재검색
        if(isMore) page++
        else page = 1


        const {data: {goodsQnas, totalCount}} = await getGoodsQnAByKeys({
            goodsNo: props.goods.goodsNo,
            isPaging: true,
            limit: page,
            page: 5
        })

        console.log({page, goodsQnas, totalCount})

        if(isMore){
            console.log('goodsQnAData.concat(goodsQnas) : ', goodsQnAData.concat(goodsQnas))
            setGoodsQnAData(goodsQnAData.concat(goodsQnas))

        }
        else{
            console.log('goodsQnas : ', goodsQnas)
            setGoodsQnAData(goodsQnas)

        }
        setGoodsQnADataPage(page)
        setGoodsQnADataTotalCount(totalCount)
    }

    //상품상세: toastUI뷰어용 - backEnd를 통해 file에서 조회
    async function searchGoodsContent(){

        if (props.goods.goodsContentFileName) {
            const {data: goodsContent} = await getGoodsContent(props.goods.goodsContentFileName)
            setGoodsContent(goodsContent);
        }
    }

    //더보기 클릭
    async function onMoreClick({type}){
        switch (type){
            case 'FARMDIARY':           //생산일지
                searchFarmDiaryData()
                break
            case 'GOODSREVIEW':         //상품후기
                searchGoodsReviewData()
                break
            case 'GOODSREVIEW_OTHER':   //다른상품후기
                searchGoodsReviewOtherData()
                break
            case 'GOODSQNA':            //상품문의
                searchGoodsQnAData(true)
                break
        }
    }


    let {
        goodsNo,            //순번
        // producerNo,         //생산자번호
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
        directGoods         //즉시판매상품 여부
    } = props.goods

    const { name, farmName } = props.producer
    const images = goodsImages.map((image)=>{
        return {
            original: serverImageUrl + image.imageUrl,
            thumbnail: serverThumbnailUrl + image.imageUrl,
        }
    })

    function GoodsPriceCard() {
        const content = [];

        if(finishedSaleGoods) {
            currentPrice = finishCurrentPrice;
            content.push(<HrGoodsPriceCard key={'goodsPriceCard'+props.goods.goodsNo} {...props.goods} currentPrice/>);

        } else {
            content.push(<HrGoodsPriceCard key={'goodsPriceCard'+props.goods.goodsNo} {...props.goods}/>);
        }

        return content;
    }

    return(


        <Fragment>
            <ImageGallery
                showNav={false}
                autoPlay={false}
                showIndex={false}
                showBullets={true}
                showPlayButton={false}
                showFullscreenButton={false}
                showThumbnails={false}
                disableArrowKeys={false}
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
            {
                directGoods ? (
                    <div className={'p-2 f6 text-secondary d-flex align-items-center'}>
                        <FontAwesomeIcon className={'text-warning mr-1'} icon={faBolt}/> 구매시 즉시 발송되는 상품 입니다.
                    </div>
                ) : (
                    <Fragment>
                        <div className='pt-2 pr-3 pb-0 pl-3 f6 text-dark'>
                            <div className='f5'>
                                { finishedSaleGoods ?
                                    (
                                        <div>  판매종료 </div>
                                    ) : (
                                        <div> 판매마감까지 <TimeText date={saleEnd ? saleEnd : null}/> 남음 </div>
                                    )
                                }
                            </div>

                            <div className='d-flex'>
                                <div>
                                    <FontAwesomeIcon className={'text-info mr-1'} icon={faClock}/>
                                </div>
                                <div className='text-secondary'>
                                    <div>
                                        구매를 하면 (예상)발송일에 받아볼 수 있는 상품입니다.
                                    </div>
                                    <div>
                                        미리 예약 구매를 하시면 보다 할인된 가격으로 상품 구매가 가능합니다.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-center m-2'>
                            {
                                <GoodsPriceCard />
                            }
                        </div>
                    </Fragment>
                )
            }

            <hr className='m-0'/>

            {/* 상품정보 */}
            <ul className={classNames(Style.goodsInfo, 'p-3 m-0 f6 text-secondary')}>
                <li>·농장/생산자</li>
                {/*<li className={'text-info cursor-pointer'} onClick={()=>{Webview.openPopup(`/farmersDetailActivity?producerNo=${props.goods.producerNo}`, true)}}>{farmName}</li>*/}
                <li className={'text-info cursor-pointer'} onClick={()=>{props.history.push(`/farmersDetailActivity?producerNo=${props.goods.producerNo}`)}}><u>{farmName}</u></li>
                <li>·생산지</li>
                <li>{productionArea}</li>
                <li>·판매단위</li>
                <li>{packUnit}</li>
                <li>·중량/용량</li>
                <li>{packAmount}{packUnit}</li>
                <li>·재배방법</li>
                <li>{cultivationNm}</li>
                <li>·농약유무</li>
                <li>{pesticideYn}</li>
                {
                    !directGoods && (
                        <Fragment>
                            <li>·예상 발송일</li>
                            <li>{ComUtil.utcToString(expectShippingStart)} - <br/>{ComUtil.utcToString(expectShippingEnd)}</li>
                        </Fragment>
                    )
                }
                <li>·배송구분</li>
                <li>택배</li>
            </ul>
            <hr className='m-0'/>

            <div className='p-3'>
                <IconStarGroup score={goodsReviewDataAvgScore} size={'lg'} />
                <span className='ml-2'>/</span>
                <span className='ml-2'>
                    {goodsReviewDataAvgScore}
                </span>
                <span className='ml-4 f6'>
                    {` ${ComUtil.addCommas(packCnt - remainedCnt)}개 구매 | 잔여 ${ComUtil.addCommas(remainedCnt)}개`}
                </span>
            </div>
            {/*태그영역 코멘트 <div className='p-3 bg-light f6 text-info mb-3'>*/}
            {/*#{searchTag}*/}
            {/*</div>*/}
            <div className='d-flex'>
                <TabSection tabId={1} text={'상품정보'} isActive={tabId === 1} onClick={onTabSectionClick.bind(this, 1)} />
                <TabSection tabId={2} text={'상세정보'} isActive={tabId === 2} onClick={onTabSectionClick.bind(this, 2)} />
                <TabSection tabId={3} text={`생산일지(${ComUtil.addCommas(farmDiaryDataTotalCount)})`} isActive={tabId === 3} onClick={onTabSectionClick.bind(this, 3)} />
                <TabSection tabId={4} text={`상품후기(${ComUtil.addCommas(goodsReviewDataTotalCount)})`} isActive={tabId === 4} onClick={onTabSectionClick.bind(this, 4)} />
                <TabSection tabId={5} text={`상품문의(${ComUtil.addCommas(goodsQnADataTotalCount)})`} isActive={tabId === 5} onClick={onTabSectionClick.bind(this, 5)} />
            </div>
            {
                //상품정보
                (tabId === 1) && (
                        !goodsContent ? (
                            <div className='mt-5 text-center' style={{minHeight: 100}}>
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        ) : (
                            <div className='p-1'>
                                {
                                    <ToastUIEditorViewer
                                        height="400px"
                                        initialValue={goodsContent}
                                    />
                                    // props.goods.contentImages.map(image => <img className={Style.contentImage} key={image.imageUrl} src={serverImageUrl+image.imageUrl}/>)
                                }
                            </div>
                        )



                )
            }
            {
                //상세정보
                (tabId === 2) && <BuyingInfo />
            }

            {
                //생산일지
                (tabId === 3 && farmDiaryData) && <FarmDiaryContent farmDiaries={farmDiaryData} totalCount={farmDiaryDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'FARMDIARY'})} />
            }

            {
                //구매후기
                (tabId === 4 && goodsReviewData) && <GoodsReviewContent goodsReviews={goodsReviewData} totalCount={goodsReviewDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW'})} isVisibleStar={true} isVisibleTitle={false} />
            }
            {
                //구매후기-다른상품후기
                (tabId === 4 && goodsReviewOtherData) &&
                <Fragment>
                    <Hr/>
                    <div className='pt-3 pl-3 pb-3 text-left font-weight-bold f6'>다른상품후기</div>
                    <hr  className='m-0'/>

                    <GoodsReviewContent goodsReviews={goodsReviewOtherData} totalCount={goodsReviewOtherDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW_OTHER'})} isVisibleStar={false} isVisibleTitle={true}/>
                </Fragment>
            }

            {
                //상품문의
                (tabId === 5 && goodsQnAData) && <GoodsQnAContent goods={props.goods} goodsQnAs={goodsQnAData} totalCount={goodsQnADataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSQNA'})} onGoodsQnASaved={searchGoodsQnAData} />
            }
            <br/>
            <br/>
            <br/>
            <div className={'p-2 d-flex bg-light position-fixed w-100'} style={{left: 0, bottom: 0}}>
                {
                    remainedCnt > 0 ? (
                        finishedSaleGoods ? (

                            <Button className={'rounded-0'} color='secondary' block disabled>판매종료</Button>

                        ) : (
                            <Fragment>
                                <Button size={'lg'}
                                        className={'border border-info rounded-0'} color='white' outline style={{minWidth: 80, maxWidth: 150}}
                                        onClick={onCartClick}>
                                    <FontAwesomeIcon icon={faCartPlus} color={'#1697ae'} size={'lg'}/>
                                </Button>
                                <Button size={'lg'}
                                        className='font-weight-bold rounded-0' color='info' block onClick={onBuyClick}><FontAwesomeIcon icon={directGoods ? faBolt : faClock}/> 구매하기</Button>
                            </Fragment>
                        )
                    ) : (

                        <Button size={'lg'} className={'rounded-0'} color='secondary' block disabled>품절</Button>
                    )
                }
            </div>
            <ModalWithNav onClose={onCartPopupClose} title={'장바구니 담기'} show={cartModal} noPadding>
                <AddCart {...props.goods}/>
            </ModalWithNav>
            <ModalWithNav onClose={onOrderPopupClose} title={'즉시구매'} show={orderModal} noPadding>
                <AddOrder {...props.goods} onClick={moveDirectBuy}/>
            </ModalWithNav>
            <ToastContainer/>
        </Fragment>
    )

}
export default GoodsDetail