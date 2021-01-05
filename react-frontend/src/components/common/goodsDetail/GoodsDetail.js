import React, { Fragment, useState, useEffect } from 'react'
import moment from 'moment-timezone'
import Css from './GoodsDetail.module.scss'
import {FaSpinner} from "react-icons/fa";
import ComUtil from '~/util/ComUtil'
import classNames from 'classnames'
import { Div, Span, Spin } from '~/styledComponents/shared/Layouts'
import LeafMotion from '~/images/icons/leaf_motion.gif'
import GoodsCouponList from '~/components/common/lists/GoodsCouponList'
import {getGoodsCouponMasters} from "~/lib/shopApi";
import useFetch from '~/hooks/useFetch'
import { Webview } from '~/lib/webviewApi'

import { HrGoodsPriceCard, ModalWithNav, AddOrder, IconStarGroup, ToastUIEditorViewer } from '~/components/common'
import { Server } from '~/components/Properties'

import { getLoginUserType } from '~/lib/loginApi'
import { getFarmDiaryBykeys, getGoodsReviewByGoodsNo, getGoodsQnAByKeys, getOtherGoodsReviewByItemNo, getGoodsBannerList } from '~/lib/shopApi'
import { getGoodsContent } from '~/lib/goodsApi'

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css"
import { toast } from 'react-toastify'                              //토스트
import FarmDiaryContent from './FarmDiaryContent'
import GoodsReviewContent from './GoodsReviewContent'
import GoodsQnAContent from './GoodsQnAContent'
import { setMissionClear} from "~/lib/eventApi"

import BlySise from '~/components/common/blySise'

import {Icon} from '~/components/common/icons'

import { getDeliveryFeeTag } from '~/util/bzLogic'
import { exchangeWon2BLCTHome, exchangeWon2BLCTPoint } from "~/lib/exchangeApi"

import ProgressDate from './progressDate'

import { color } from "~/styledComponents/Properties";
import { AiOutlineInfoCircle } from 'react-icons/ai'

import BuyFooter from './buyFooter'
import {Collapse, Modal, ModalHeader, ModalBody} from 'reactstrap'
import AnimationLayouts from '~/styledComponents/shared/AnimationLayouts'

const Hr = () => <hr className='m-0 bg-secondary border-0' style={{height: 10}}/>

const GoodsDetail = (props) => {

    const {data: coupons, loading: couponLoading } = useFetch(getGoodsCouponMasters, props.goods.goodsNo)

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

    //Bly 시세
    const [blySiseModal, setBlySiseModal] = useState(false);

    //상품상세, 블리리뷰: toastUI뷰어용 - backEnd를 통해 file에서 조회
    const [goodsContent, setGoodsContent]= useState('')
    const [blyReview, setBlyReview] = useState('')

    const [cartModal, setCartModal] = useState(false);

    const [orderModal, setOrderModal] = useState(false);

    const [finishedSaleGoods, setFinishedSaleGoods] = useState(false);
    const [finishCurrentPrice, setFinishCurrentPrice] = useState(0);

    //상품필수정보 등의 펼침상태
    const [etcStatus, setEtcStatus] = useState([false, false, false])

    //구매하기 펼치기 여부
    const [addStatus, setAddStatus] = useState(false)

    //구매수량
    const [orderQty, setOrderQty] = useState(1)

    //블리타임 여부
    // const [blyTimeYn, setBlyTimeYn] = useState(false)

    //슈퍼리워드 여부
    // const [superRewardYn, setSuperRewardYn] = useState(false)


    //상품공지배너
    const [goodsBannerList, setGoodsBannerList] = useState([]);



    //화면 로드시 생산일지, 구매후기, 다른상품구매후기, 상품문의, 공지배너 조회(이때 하는 이유는 사용자 리뷰를 미리 바인딩 해야 하기 때문)
    useEffect(() => {
        searchGoodsContent()
        searchFarmDiaryData()
        searchGoodsReviewData()
        searchGoodsReviewOtherData()
        searchGoodsQnAData()
        searchGoodsBannerList()


        // if (props.goods.blyTime) {
        //     isBlyTime();
        // }else if (props.goodsNo.superReward){
        //     isSuperReward();
        // }



        // 판매종료
        const isFinishGoods = isFinishedDate(ComUtil.utcToTimestamp(props.goods.saleEnd));
        // if(props.goods.saleStopped)
        // 판매중지

        if(isFinishGoods || props.goods.saleStopped) {
            setFinishedSaleGoods(true); // 판매마감 상품인지 판단
            setFinishCurrentPrice(0);
        }

        //마지막 본거 저장.
        ComUtil.saveLastSeenGoods(props.goods.goodsNo);
        let lastSeenGoodsList = ComUtil.getLastSeenGoodsList();
        console.log('lastSeenGoods', lastSeenGoodsList)

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

    //BLY 시세 모달 toggle
    const onBlySiseModalToggle = () => {
        setBlySiseModal(!blySiseModal);
    }
    //BLY 시세 모달
    const onBlySiseClick = async () => {
        setBlySiseModal(true);
    }

    //즉시구매 클릭
    const onBuyClick = async () => {
        if(await isOkay()){
            alert('success')
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
            if(res.multiGift) {
                Webview.openPopup(`/multiGiftBuy?goodsNo=${props.goods.goodsNo}&qty=${res.qty}`, true)
            } else {
                Webview.openPopup(`/directBuy?goodsNo=${props.goods.goodsNo}&qty=${res.qty}&gift=${res.gift}`, true) //구매로 이동 : true=noRefresh.(단순 팝업 닫아서 상세화면이 refresh될때 Home으로 가능현상 방지
            }
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
                console.log(tabId)
                //데이터가 없는 경우만 조회함
                farmDiaryData.length <= 0 && searchFarmDiaryData()
                break
            //구매후기
            case 4:
                console.log(tabId)
                //데이터가 없는 경우만 조회함
                goodsReviewData.length <= 0 && searchGoodsReviewData()
                break
            //상품문의
            case 5:
                console.log(tabId)
                goodsQnAData.length <= 0 && searchGoodsQnAData()
                break
        }
        setTabId(tabId)
    }

    //구매안내
    function BuyingInfo() {
        const { goodsTypeCode  } = props.goods

        //식품(농수산물) Agricultural food
        if(goodsTypeCode === 'A'){
            return(
                <div className={Css.reqInfo}>
                    <div>·포장단위별 용량(중량), 수량, 크기</div><div>상품정보참조</div>
                    <div>·생산자/수입자</div><div>{`${props.producer.farmName} / ${props.producer.name}`}</div>
                    <div>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</div><div>상품정보참조</div>
                    <div>·농축수산물 표시사항</div><div>상품정보참조</div>
                    <div>·제품구성</div><div>상품정보참조</div>
                    <div>·보관방법/취급방법</div><div>상품정보참조</div>
                    <div>·소비자상담관련 전화번호</div><div>상품정보참조</div>
                    <div>·비고</div><div>상품정보참조</div>
                    <div>·AS 정보</div><div>상품정보참조</div>
                </div>
            )
        }
        //가공식품 Processed food
        else if(goodsTypeCode === 'P'){
            return(
                <div className={Css.reqInfo}>
                    <div>·식품유형</div><div>상품정보참조</div>
                    <div>·생산자/수입자</div><div>{`${props.producer.name} / ${props.producer.farmName}`}</div>
                    <div>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</div><div>상품정보참조</div>
                    <div>·원재료명 및 함량</div><div>상품정보참조</div>
                    <div>·영양성분</div><div>상품정보참조</div>
                    <div>·표시광고 사전심의필</div><div>상품정보참조</div>
                    <div>·소비자상담관련 전화번호</div><div>상품정보참조</div>
                    <div>·유전자재조합식품여부(유/무)</div><div>상품정보참조</div>
                    <div>·수입여부(유/무)</div><div>상품정보참조</div>
                    <div>·비고</div><div>상품정보참조</div>
                    <div>·AS 정보</div><div>상품정보참조</div>
                </div>
            )
        }
        //건강기능식품 Health functional food
        else if(goodsTypeCode === 'H'){
            return(
                <div className={Css.reqInfo}>
                    <div>·식품유형</div><div>상품정보참조</div>
                    <div>·생산자/수입자</div><div>{`${props.producer.name} / ${props.producer.farmName}`}</div>
                    <div>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</div><div>상품정보참조</div>
                    <div>·원재료명 및 함량</div><div>상품정보참조</div>
                    <div>·영양정보</div><div>상품정보참조</div>
                    <div>·기능정보</div><div>상품정보참조</div>
                    <div>·주의사항</div><div>상품정보참조</div>
                    <div>·표시광고 사전심의필</div><div>상품정보참조</div>
                    <div>·소비자상담관련 전화번호</div><div>상품정보참조</div>
                    <div>·유전자재조합식품여부(유/무)</div><div>상품정보참조</div>
                    <div>·수입여부(유/무)</div><div>상품정보참조</div>
                    <div>·의약품여부(유/무/해당없음)</div><div>상품정보참조</div>
                    <div>·비고</div><div>상품정보참조</div>
                    <div>·AS 정보</div><div>상품정보참조</div>
                </div>
            )
        }


        // //식품(농수산물) Agricultural food
        // if(goodsTypeCode === 'A'){
        //     return(
        //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
        //             <li>·포장단위별 용량(중량), 수량, 크기</li><li>상품정보참조</li>
        //             <li>·생산자/수입자</li><li>{`${props.producer.farmName} / ${props.producer.name}`}</li>
        //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
        //             <li>·농축수산물 표시사항</li><li>상품정보참조</li>
        //             <li>·제품구성</li><li>상품정보참조</li>
        //             <li>·보관방법/취급방법</li><li>상품정보참조</li>
        //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
        //             <li>·비고</li><li>상품정보참조</li>
        //             <li>·AS 정보</li><li>상품정보참조</li>
        //         </ul>
        //     )
        // }
        // //가공식품 Processed food
        // else if(goodsTypeCode === 'P'){
        //     return(
        //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
        //             <li>·식품유형</li><li>상품정보참조</li>
        //             <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
        //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
        //             <li>·원재료명 및 함량</li><li>상품정보참조</li>
        //             <li>·영양성분</li><li>상품정보참조</li>
        //             <li>·표시광고 사전심의필</li><li>상품정보참조</li>
        //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
        //             <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
        //             <li>·수입여부(유/무)</li><li>상품정보참조</li>
        //             <li>·비고</li><li>상품정보참조</li>
        //             <li>·AS 정보</li><li>상품정보참조</li>
        //         </ul>
        //     )
        // }
        // //건강기능식품 Health functional food
        // else if(goodsTypeCode === 'H'){
        //     return(
        //         <ul className={classNames(Css.containerGoodsPurcaseInfo, 'p-3 m-0 f6 text-secondary')}>
        //             <li>·식품유형</li><li>상품정보참조</li>
        //             <li>·생산자/수입자</li><li>{`${props.producer.name} / ${props.producer.farmName}`}</li>
        //             <li>·제조연월일(포장일/생산연도),<br/> &nbsp; 유통기한/품질유지기한</li><li>상품정보참조</li>
        //             <li>·원재료명 및 함량</li><li>상품정보참조</li>
        //             <li>·영양정보</li><li>상품정보참조</li>
        //             <li>·기능정보</li><li>상품정보참조</li>
        //             <li>·주의사항</li><li>상품정보참조</li>
        //             <li>·표시광고 사전심의필</li><li>상품정보참조</li>
        //             <li>·소비자상담관련 전화번호</li><li>상품정보참조</li>
        //             <li>·유전자재조합식품여부(유/무)</li><li>상품정보참조</li>
        //             <li>·수입여부(유/무)</li><li>상품정보참조</li>
        //             <li>·의약품여부(유/무/해당없음)</li><li>상품정보참조</li>
        //             <li>·비고</li><li>상품정보참조</li>
        //             <li>·AS 정보</li><li>상품정보참조</li>
        //         </ul>
        //     )
        // }

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
        //-1을 특수용도로 사용.(다른상품후기 개수 존재)setGoodsReviewDataTotalCount(totalCount === -1 ? 0 : totalCount)
        setGoodsReviewDataTotalCount(totalCount)
        console.log('searchGoodsReviewData, totalCount:' + totalCount )

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
            if(goodsContent) {
                setGoodsContent(goodsContent);
            }
        }
        // 상품상세 조회할 때 블리리뷰도 같이 조회해와서 화면에 세팅해 둠
        if(props.goods.blyReview) {
            //     const {data: blyReview} = await getBlyReview(props.goods.blyReviewFileName)
            setBlyReview(props.goods.blyReview);
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
        // producerNo,      //생산자번호
        goodsNm,            //상품명
        goodsImages,        //상품이미지
        searchTag,          //태그
        // itemNo,          //품목번호
        itemName,           //품목명
        breedNm,            //품종
        productionArea,     //생산지
        // cultivationNo,   //재배방법번호
        cultivationNm,      //재배방법명
        saleEnd,            //판매마감일

        expectShippingStart,//예상발송시작일
        expectShippingEnd,  //예상발송마감일

        hopeDeliveryFlag,
        hopeDeliveryDate,

        pesticideYn,        //농약유무
        packUnit,           //포장단위
        packAmount,         //포장 양
        packCnt,            //판매개수
        //shipPrice,        //출하 후 판매가
        //reservationPrice, //예약 시 판매가
        consumerPrice,      //소비자 가격
        currentPrice,       //현재 가격
        discountRate,       //현재 할인율
        priceSteps,         //3단계 할인단계 [{stepNo, until, price, discountRate}]
        selectedPriceStep,  //할인단계
        //cultivationDiary  //재배일지
        // contractHash,    //블록체인 저장된 해시값

        remainedCnt,        //남은판매개수
        directGoods,        //즉시판매상품 여부
        blyTime,            // 블리타임 진행 여부
        blyTimeReward,       // 블리타임 보상 퍼센트
        inBlyTimePeriod,

        superReward,
        superRewardReward,
        inSuperRewardPeriod
    } = props.goods

    // console.log(props.goods)

    // async function isBlyTime() {
    //     let {data: blyTimeYn} = await isBlyTimeBadge();
    //
    //     setBlyTimeYn(blyTimeYn)
    // }

    // async function isSuperReward() {
    //     let {data: superRewardYn} = await isSuperRewardBadge();
    //
    //     setSuperRewardYn(superRewardYn)
    // }

    async function searchGoodsBannerList() {
        let {data: goodsBannerList} = await getGoodsBannerList();

        if (goodsBannerList) {
            setGoodsBannerList(goodsBannerList)
        }
    }

    const goodsBannerImages = (goodsBannerList.length > 0) && goodsBannerList.map((goodsBanner)=>{
        return goodsBanner.goodsBannerImages[0].imageUrl
    })

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


    function onEtcStatusClick(index){
        // const etcStatus = [false, false, false]
        const statusArr = Object.assign([], etcStatus)
        statusArr[index] = !statusArr[index]

        setEtcStatus(statusArr)
    }


    function onQtyChange(value){
        setOrderQty(value)
    }

    function addStatusToggle(){
        setAddStatus(!addStatus)
    }
    function onFarmNameClick(){
        props.history.push(`/farmersDetailActivity?producerNo=${props.goods.producerNo}`)
    }

    if(!props.goods) return null

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

            <div className={Css.wrap}>

                <div className={Css.meta}>

                    <div className={classNames(Css.badge, 'd-flex')}>
                        <Div bg={'background'}>
                            <Icon name={'blocery'} style={{width: 8, marginRight: 2}}/><b> {exchangeWon2BLCTPoint(currentPrice)}</b> BLY 적립
                        </Div>
                        {
                            blyTime && inBlyTimePeriod &&
                            <Div>
                                <Span>
                                    +
                                </Span>
                                <AnimationLayouts.HeartBeat
                                    play={true}
                                    fw={500}
                                    rounded={4}
                                    p={5}
                                    fontSize={11}
                                    bg={'danger'}
                                    fg={'white'}
                                    ml={5} mr={4}>블리타임</AnimationLayouts.HeartBeat>
                                카드결제 금액의 &nbsp;<b> {blyTimeReward}%</b> &nbsp; 추가 적립
                            </Div>
                        }
                        {
                            superReward && inSuperRewardPeriod &&
                            <Div>
                                <Span>
                                    +
                                </Span>
                                <AnimationLayouts.HeartBeat play={true} fw={500} rounded={4} p={5} fontSize={11} bg={'danger'} fg={'white'} ml={5} mr={4}>슈퍼리워드</AnimationLayouts.HeartBeat>
                                카드결제 금액의 &nbsp;<b> {superRewardReward}%</b> &nbsp; 추가 적립
                            </Div>
                        }
                    </div>
                    <div className={Css.goodsName}>{goodsNm}</div>
                    <div className={Css.price}>
                        <div className={Css.left}>
                            {
                                discountRate > 0 && (
                                    <div className={Css.discountBox}>
                                        <div className={Css.danger}><b>{Math.round(discountRate)}</b>%</div>
                                        <div className={Css.consumerPrice}><del>{ComUtil.addCommas(consumerPrice)}원</del></div>
                                    </div>
                                )
                            }
                            <div className={Css.currentPrice}>
                                {ComUtil.addCommas(currentPrice)}원
                            </div>
                        </div>
                        <div className={Css.right}>
                            <div>
                                {
                                    // discountRate > 0 && <div className={Css.danger}>{Math.round(discountRate)}%</div>
                                }
                                {/*<div className={Css.blct}> <div className={'mr-1 mb-1 cursor-pointer'} onClick={onBlySiseClick} ><AiOutlineInfoCircle color={color.adjust}/></div> <Icon name={'blocery'}/> <b>{ComUtil.addCommas(exchangeWon2BLCTHome(currentPrice))}</b> BLY</div>*/}
                                <div className={Css.blct}> <div className={'mr-1 mb-1 cursor-pointer'} onClick={onBlySiseClick} ><AiOutlineInfoCircle color={color.adjust}/></div> <Icon name={'blocery'}/> <b><exchangeWon2BLCTHome.Tag won={currentPrice}/></b> BLY</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*<div className={Css.shareBox}>*/}
                {/*<div>*/}
                {/*<span><Icon name='shareOn'/></span><span>공유</span>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<span><Icon name='heartOn'/></span><span>찜</span>*/}
                {/*</div>*/}
                {/*</div>*/}


                {
                    !directGoods && <ProgressDate {...props.goods}/>
                }

                <hr className={Css.lineLight}/>
                <div className={Css.shippingInfoBox}>
                    {
                        directGoods && (
                            <div>
                                <div>
                                    본 상품은 <span className={Css.green}><b>즉시상품</b></span>으로 구매 시 바로 발송되는 상품입니다.
                                </div>
                                <hr className={Css.lineLight}/>
                                <div><span>배송비 </span><span className={Css.black}>{getDeliveryFeeTag(props.goods)}</span>   </div>
                                <div className={Css.dark}>
                                    {
                                        hopeDeliveryFlag ? <><Span fg={'green'} bold>희망 수령일 선택 가능 상품</Span>입니다. (구매 시 선택 가능)</> : '지금 구매하면 2~3일 이내로 받아보실 수 있습니다.'
                                    }
                                </div>
                            </div>
                        )
                    }

                    {
                        !directGoods && (
                            <div>
                                <div>
                                    본 상품은 <span className={Css.green}><b>예약상품</b></span>으로 보다 할인된 가격에 구매 가능합니다.
                                </div>
                                <hr className={Css.lineLight}/>
                                <div><span>배송비 </span><span className={Css.black}><b>{getDeliveryFeeTag(props.goods)}</b></span>   </div>
                                <div className={Css.dark}>
                                    <span className={Css.black}>{ComUtil.utcToString(expectShippingStart, 'MM[/]DD')}~{ComUtil.utcToString(expectShippingEnd, 'MM[/]DD')}
                                        {
                                            hopeDeliveryFlag ? <Span ml={2}>사이에 발송되며, <Span fg={'green'} bold>희망 수령일을 직접 선택</Span>할 수 있습니다.</Span> : <Span ml={2}>사이에 발송되며, 발송 후 2~3일 이내에 받아보실 수 있습니다.</Span>
                                        }
                                    </span>
                                </div>
                            </div>
                        )
                    }

                    <hr className={Css.lineLight} style={{margin: '0 16px'}}/>

                    {
                        (packCnt - remainedCnt) >= 50 && (
                            <>
                                <div>
                                    <span>수량 </span><span className={Css.black}><b>구매건수 {ComUtil.addCommas(packCnt - remainedCnt)} / 잔여 {ComUtil.addCommas(remainedCnt <= 0 ? 0 : remainedCnt)}</b></span>
                                </div>
                                <hr className={Css.lineLight} style={{margin: '0 16px'}}/>
                            </>
                        )
                    }

                    <ul className={classNames(Css.goodsInfo, 'p-3 m-0 f6 text-secondary')}>
                        <li>·농장/생산자</li>
                        {/*<li className={'text-info cursor-pointer'} onClick={()=>{Webview.openPopup(`/farmersDetailActivity?producerNo=${props.goods.producerNo}`, true)}}>{farmName}</li>*/}
                        <li className={'text-info cursor-pointer'} onClick={onFarmNameClick}><u>{farmName}</u></li>
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


                </div>

                <hr className={Css.lineWeight}/>

                <div className={classNames(Css.listItem, Css.border, Css.hover)} onClick={onTabSectionClick.bind(this, 3)}>
                    <div className={Css.left}>
                        <span className={Css.icon}><IconStarGroup score={goodsReviewDataAvgScore} size={'lg'} /></span>
                        <span className={Css.green}><b>{goodsReviewDataAvgScore}</b></span> <span className={Css.dark}>({ComUtil.addCommas((goodsReviewDataTotalCount === -1)?0:goodsReviewDataTotalCount)}건)</span>
                    </div>
                    <div className={Css.right}><Icon name={'arrowRightGray'}/></div>
                </div>
                <div className={classNames(Css.listItem, Css.hover)} onClick={onFarmNameClick}>
                    <div className={Css.left}>
                        <span className={Css.icon}><Icon name={'storeGray'}/></span>
                        <span className={Css.black}><b>{farmName}</b></span>
                    </div>
                    <div className={Css.right}><Icon name={'arrowRightGray'}/></div>
                </div>
                <hr className={Css.lineWeight}/>

                {/* 상세정보, 생산일지, 구매후기, 상품문의 탭 */}
                {
                    props.goods.blyReviewConfirm ?
                        <div className={Css.tab}>
                            <div className={classNames(Css.item, Css.hover, tabId === 1 && Css.selected)} onClick={onTabSectionClick.bind(this, 1)}>
                                <div className={Css.text}>
                                    상세정보
                                </div>
                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 5 && Css.selected)} onClick={onTabSectionClick.bind(this, 5)}>
                                <div className='d-flex'>
                                    <div className={Css.text}>블리리뷰</div>
                                    <div className='d-flex align-items-center'>
                                        <img src={LeafMotion} style={{width: 28, height: 14, marginRight: 2}}/>
                                    </div>
                                </div>
                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 2 && Css.selected)} onClick={onTabSectionClick.bind(this, 2)}>
                                <div className={Css.text}>생산일지({ComUtil.addCommas(farmDiaryDataTotalCount)})</div>
                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 3 && Css.selected)} onClick={onTabSectionClick.bind(this, 3)}>

                                <div className={Css.text}>{(goodsReviewDataTotalCount === -1)? '구매후기':`구매후기(${ComUtil.addCommas(goodsReviewDataTotalCount)})`}</div>

                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 4 && Css.selected)} onClick={onTabSectionClick.bind(this, 4)}>
                                <div className={Css.text}>상품문의({ComUtil.addCommas(goodsQnADataTotalCount)})</div>
                            </div>
                        </div>
                        :
                        <div className={Css.tab}>
                            <div className={classNames(Css.item, Css.hover, tabId === 1 && Css.selected)} onClick={onTabSectionClick.bind(this, 1)}>
                                <div className={Css.text}>
                                    상세정보
                                </div>
                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 2 && Css.selected)} onClick={onTabSectionClick.bind(this, 2)}>
                                <div className={Css.text}>생산일지({ComUtil.addCommas(farmDiaryDataTotalCount)})</div>
                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 3 && Css.selected)} onClick={onTabSectionClick.bind(this, 3)}>

                                <div className={Css.text}>{(goodsReviewDataTotalCount === -1)? '구매후기':`구매후기(${ComUtil.addCommas(goodsReviewDataTotalCount)})`}</div>

                            </div>
                            <div className={classNames(Css.item, Css.hover, tabId === 4 && Css.selected)} onClick={onTabSectionClick.bind(this, 4)}>
                                <div className={Css.text}>상품문의({ComUtil.addCommas(goodsQnADataTotalCount)})</div>
                            </div>
                        </div>
                }

                {
                    //상품정보
                    (tabId === 1) && (
                        <div>

                            {
                                goodsBannerList.length > 0 && goodsBannerList.map((banner)=> <img style={{width:'100%',height:'500'}} src={serverImageUrl + banner.goodsBannerImages[0].imageUrl} alt="공지배너"/>)
                            }
                            <GoodsCouponList goodsNo={goodsNo} />
                            {
                                !goodsContent ? (
                                        <div className='mt-5 text-center' style={{minHeight: 100}}>
                                            <Spin duration={2.5}>
                                                <FaSpinner />
                                            </Spin>
                                        </div>
                                    )
                                    :
                                    <div>
                                        <ToastUIEditorViewer
                                            height="400px"
                                            initialValue={goodsContent}
                                        />
                                    </div>
                            }
                        </div>
                    )
                }

                {
                    //블리리뷰
                    (tabId === 5) && (
                        !blyReview ? (
                            <div className='mt-5 text-center' style={{minHeight: 100}}>
                                <Spin duration={2.5}>
                                    <FaSpinner />
                                </Spin>
                            </div>
                        ) : (
                            <div className={"ql-container ql-snow ql-no-border"}>
                                <div className={'ql-editor ql-no-border ql-no-resize'}
                                     dangerouslySetInnerHTML={{
                                         __html: blyReview
                                     }}></div>
                            </div>

                        )
                    )
                }

                {
                    //생산일지
                    (tabId === 2 && farmDiaryData) && <FarmDiaryContent history={props.history} farmDiaries={farmDiaryData} totalCount={farmDiaryDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'FARMDIARY'})} />
                }

                {
                    //구매후기
                    (tabId === 3 && goodsReviewData) && <GoodsReviewContent goodsReviews={goodsReviewData} totalCount={goodsReviewDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW'})} isVisibleStar={true} isVisibleTitle={false} />
                }
                {
                    //구매후기-다른상품후기
                    (tabId === 3 && goodsReviewOtherData) &&
                    <Fragment>
                        <Hr/>
                        <div className='pt-3 pl-3 pb-3 text-left font-weight-bold f6'>다른상품후기</div>
                        <hr  className='m-0'/>

                        <GoodsReviewContent goodsReviews={goodsReviewOtherData} totalCount={goodsReviewOtherDataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSREVIEW_OTHER'})} isVisibleStar={false} isVisibleTitle={true}/>
                    </Fragment>
                }

                {
                    //상품문의
                    (tabId === 4 && goodsQnAData) && <GoodsQnAContent goods={props.goods} goodsQnAs={goodsQnAData} totalCount={goodsQnADataTotalCount} onMoreClick={onMoreClick.bind(this, {type: 'GOODSQNA'})} onGoodsQnASaved={searchGoodsQnAData} />
                }


                {
                    (tabId === 1) && (
                        <>
                            <hr className={Css.lineWeight}/>

                            <div className={Css.detailCard}>
                                <div className={Css.header} onClick={onEtcStatusClick.bind(this, 0)}>
                                    <div>상품 필수 정보</div>
                                    <div><Icon name={etcStatus[0] ? 'arrowUpGray':'arrowDownGray' }/></div>
                                </div>
                                <Collapse isOpen={etcStatus[0]}>
                                    <div className={Css.body}>
                                        <BuyingInfo />
                                    </div>
                                </Collapse>
                            </div>

                            <hr className={Css.lineLight}/>

                            <div className={Css.detailCard}>
                                <div className={classNames(Css.header, Css.hover)} onClick={onEtcStatusClick.bind(this, 1)}>
                                    <div>배송안내</div>
                                    <div><Icon name={etcStatus[1] ? 'arrowUpGray':'arrowDownGray' }/></div>
                                </div>
                                <Collapse isOpen={etcStatus[1]}>
                                    <div className={Css.body}>
                                        1. 배송비는 얼마인가요?  <br/>
                                        신선한 상품 공급을 위해 주문 완료시 해당 상품을 공급하는 공급업체에서 직발송됩니다.<br/>
                                        따라서 공급업체 지역, 묶음 배송 가능여부 등에 따라 상품별로 배송비가 차등 적용되며, 주문시 상품상세 설명에 안내된 배송비를 포함한 주문금액이 결제됩니다.<br/>
                                        ※ 도서 산간지역은 추가 배송비 발생됨<br/>
                                        <br/>
                                        2. 제품은 언제 발송되나요?          <br/>
                                        ① 일반상품의 경우 주문 당일 또는 주문일로부터 1~2일 이내에 발송되며, 발송일로부터 1~5일 이내에 수령이 가능합니다.<br/>
                                        ② 예약상품의 경우 생산자(판매자)가 설정한 예상 발송일 사이에 발송되며, 발송일로부터 1~5일 이내에 수령이 가능합니다.<br/>
                                        ※ 공휴일은 포함되지 않으며, 도서 산간 지역의 경우 지연될 수 있습니다.<br/>
                                        ※ 설/추석/휴가 기간 등 장기 배송지연 발생시 공지사항 별도 안내<br/>
                                        <br/>
                                        3. 교환 및 반품에 따른 배송비는?<br/>
                                        - 고객 변심에 의한 교환/반품의 경우 왕복배송비 고객 부담<br/>
                                        - 제품 이상(하자)로 인한 경우 왕복배송비 판매자 부담<br/>
                                        ※ 반드시 교환이나 반품 전 운영센터에 접수해 주세요<br/>
                                    </div>
                                </Collapse>
                            </div>

                            <hr className={Css.lineLight}/>

                            <div className={Css.detailCard}>
                                <div className={Css.header} onClick={onEtcStatusClick.bind(this, 2)}>
                                    <div>교환 및 반품안내</div>
                                    <div><Icon name={etcStatus[2] ? 'arrowUpGray':'arrowDownGray' }/></div>
                                </div>
                                <Collapse isOpen={etcStatus[2]}>
                                    <div className={Css.body}>
                                        1. 제품 교환 및 반품이 가능한 경우는? <br/>
                                        상품 수령후 7일 이내 다음의 사유에 의한 교환, 반품 및 환불을 보장합니다.<br/>
                                        - 상품 수령후 7일 이내에 상품 및 포장상태가 재판매가 가능한 경우    <br/>
                                        - 주문한 상품과 수령한 상품이 다르거나, 사이트에 제공된 상품정보와 다른 경우 (단순한 화면상의 차이 제외) <br/>
                                        - 상품 자체의 이상 및 결함이 있을 경우     <br/>
                                        - 배송된 상품이 파손, 손상, 오염되었을 경우(수령 당일 접수 요망)  <br/>
                                        ※ 신선식품(생품/냉장) 상품은,                          <br/>
                                        - 발송 완료후 재판매가 어려워 상품의 이상(하자)로 인한 교환/반품만 가능 <br/>
                                        - 상품의 이상(하자)로 인한 교환/반품은 상품 수령후 24시간 이내 접수 요망 <br/>
                                        <br/>
                                        2. 제품 교환 및 반품이 불가한 경우는?   <br/>
                                        - 이용자에게 책임있는 사유로 상품이 멸실 또는 훼손된 경우    <br/>
                                        - 포장을 개봉하였거나 포장이 훼손되어 상품가치가 상실한 경우    <br/>
                                        - 이용자의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우  <br/>
                                    </div>
                                </Collapse>
                            </div>
                        </>
                    )
                }



                <BuyFooter
                    goods={props.goods}
                    onClick={moveDirectBuy}
                />

            </div>

            {
                blySiseModal &&
                <Modal isOpen={true} toggle={onBlySiseModalToggle} centered>
                    <ModalHeader toggle={onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                    <ModalBody>
                        <BlySise open={blySiseModal} />
                    </ModalBody>
                    {/*<ModalFooter>*/}
                    {/*</ModalFooter>*/}
                </Modal>
            }

            <ModalWithNav onClose={onOrderPopupClose} title={'즉시구매'} show={orderModal} noPadding>
                <AddOrder {...props.goods} onClick={moveDirectBuy}/>
            </ModalWithNav>
        </Fragment>
    )

}
export default GoodsDetail