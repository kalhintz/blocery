
import Error from './Error'
import * as Producer from '../components/producer'
import * as Seller from './b2bSeller'
import * as Admin from '../components/admin'
import * as Shop from '../components/shop'
import * as Common from '../components/common'
import * as B2bShop from '../components/b2bShop'
import { Home as IconHome, Menu as IconMenu, Face as IconFace, Search as IconSearch } from '@material-ui/icons'

import { faChartArea, faBoxOpen, faStore, faShoppingCart, faDollarSign, faSignal, faGlobe } from "@fortawesome/free-solid-svg-icons";





export const Server = {

    /* 중요: AWS포시에는 꼭 production */
    _serverMode: function() {
        return 'stage';      //stage Server: 서버테스트용 - 회사 서버.-마스터에는 이버전으로 관리
        // return 'production'; //production Server:  - AWS 서버 배포시 꼭 이버전. + 백엔드 gradle 버전넘버 중간꺼 올리기, 예) 0.2.xx
    },
    getRestAPIHost: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/restapi' : this._getServer() + '/restapi';
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getRestAPIFileServer: function() {
        return this._getServer() + '/restapi';
    },
    getRestAPIFileServerHost: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl() + '/restapi' : this._getServer() + '/restapi';
    },
    getServerURL: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl() : this._getServer();
    },
    getImgTagServerURL: function() {
        if(window.location.hostname === 'localhost'){
            let v_local_url = '//'+'localhost:8080';
            return v_local_url
        }else{
            if (this._serverMode() === 'stage') {
                let v_stage_url = '//'+'210.92.91.225:8080';
                return v_stage_url;
            }
            else { //production
                return '//blocery.com';
            }
        }
    },
    getImageURL: function() {
        //return  window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/images/' : this._getServer() + '/images/';
        return  this._getServer() + '/images/';      //개발시에도 225 이미지 보기
    },
    getThumbnailURL: function() {
        //return  window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/thumbnails/' : this._getServer() + '/thumbnails/';
        return  this._getServer() + '/thumbnails/'; //개발시에도 225 이미지 보기
    },
    getFrontURL:function() {
        return window.location.hostname === 'localhost' ? this._getLocalFrontUrl() : this._getServer();
    },
    getImpKey:function(){
        if (this._serverMode() === 'stage')
            return "imp34151859";   //test
        else
            return "imp22993918";   //production
    },
    getImpPgId:function(){
        return "uplus"; //LGU+
    },
    _getLocalFrontUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'localhost';
        let v_stage_port = '3000';
        let v_return_url = v_stage_url+':'+v_stage_port;
        return v_return_url;
    },
    _getLocalServerUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'localhost';
        let v_stage_port = '8080';
        let v_return_url = v_stage_url+':'+v_stage_port;
        if(protocol==='http:'){
            v_stage_port = '8080';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        if(protocol==='https:'){
            v_stage_port = '8443';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        return v_return_url;
    },
    _getStageServerUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'210.92.91.225';
        let v_stage_port = '8080';
        let v_return_url = v_stage_url+':'+v_stage_port;
        if(protocol==='http:'){
            v_stage_port = '8080';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        if(protocol==='https:'){
            v_stage_port = '8443';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        return v_return_url;
    },
    _getServer: function() {
        let protocol = window.location.protocol; // => http:,https:
        if (this._serverMode() === 'stage') {
            return this._getStageServerUrl();
        }
        else { //production
            return protocol+'//blocery.com'; //AWS 서버 IP = http://13.209.43.206
        }
    },
    //관리자 메인페이지
    getAdminShopMainUrl: function(){
        const {type, parentId, id} = AdminSubMenuList.find(menu => menu.type === 'shop' && menu.isMainPage === true)
        return `/admin/${type}/${parentId}/${id}`
    },
    getAdminFintechMainUrl: function(){
        const {type, parentId, id} = AdminSubMenuList.find(menu => menu.type === 'fintech' && menu.isMainPage === true)
        return `/admin/${type}/${parentId}/${id}`
    },
    getShopMainUrl: function(){
        return '/home/1'
    },
    ERROR: 100
}

export const Const = {
    GAS_LIMIT: 50000,  // 사용자 토큰전송을 위해 approve시 대략 50,000 gas 필요함
    INITIAL_TOKEN : 1000,
    GIVE_ETH_GASTIMES : 5,
    VALWORD_CRYPTO_KEY : 'u8d7l5h3z0m'   //localStorage에 valword저장시 암호화용 키
}

export const B2bConst = {
    categories: ['한식', '일식', '중식', '양식', '분식', '패스트푸드', '주점', '뷔페', '커피/음료', '퓨전요리', '제빵', '음식배달', '기타']
}

export const User = {
    admin: '관리자',
    consumer: '소비자',
    producer: '생산자'
}

/*
(ProducerContainer.js 과 연동됩니다)

* route: 라우터 첫번째 값
* id: 라우터 :id 값
* name: 메뉴명
* page: 페이지 객체
* menuNav: 상단 메뉴바 보여줄지 여부
* closeNav: 최상단 X 버튼 타이틀 여부
* visibility: menuNav에 노출될지 여부
* */
// 생산자 메뉴
export const ProducerMenuList = [
    //{group: '0', route: 'producer', id: 'web', name: 'Web홈', page: Producer.WebHome, menuNav: false, visibility: true},

    {group: '1', route: 'producer', id: 'login', name: '생산자로그인', page: Producer.ProducerLogin, menuNav: false, visibility: true},
    {group: '1', route: 'producer', id: 'home', name: '홈', page: Producer.Home, menuNav: false, visibility: true},
    {group: '2', route: 'producer', id: 'goodsList', name: '상품관리', page: Producer.GoodsList, menuNav: true, visibility: true},
    {group: '2', route: 'producer', id: 'goodsQnaList', name: '상품문의', page: Producer.GoodsQnaList, menuNav: true, visibility: true},
    {group: '2', route: 'producer', id: 'farmDiaryList', name: '생산일지관리', page: Producer.FarmDiaryList, menuNav: true, visibility: true},
    {group: '2', route: 'producer', id: 'shop', name: '상점관리', page: Producer.Shop, menuNav: true, visibility: true},
    {group: '2', route: 'producer', id: 'goodsReviewList', name: '상품후기', page: Producer.GoodsReviewList, menuNav: true, visibility: true},
    {group: '2', route: 'producer', id: 'regularShopList', name: '단골관리', page: Producer.RegularShopList, menuNav: true, visibility: true},
    {group: '3', route: 'producer', id: 'orderList', name: '주문목록', page: Producer.OrderList, menuNav: true, visibility: true},
    {group: '3', route: 'producer', id: 'blctHistory', name: '적립금관리', page: Producer.BlctHistory, menuNav: true, visibility: true},
    {group: '3', route: 'producer', id: 'giganSalesSttList', name: '기간별판매현황', page: Producer.GiganSalesSttList, menuNav: true, visibility: true},
    {group: '3', route: 'producer', id: 'calculateTab', name: '정산관리', page: Producer.CalculateTab, menuNav: true, visibility: true},
    {group: '4', route: 'producer', id: 'mypage', name: '마이페이지', page: Producer.Mypage, menuNav: false, visibility: true},
    {group: '4', route: 'producer', id: 'notificationList', name: '알림', page: Shop.NotificationList, menuNave: false, visibility: true},
    {group: '4', route: 'producer', id: 'noticeList', name: '공지사항', page: Common.B2bNoticeList, menuNave: false, visibility: true},
    {group: '4', route: 'producer', id: 'customerCenter', name: '고객센터', page: Producer.CustomerCenter, menuNave: false, visibility: true},
    {group: '4', route: 'producer', id: 'setting', name: '설정', page: Producer.Setting, menuNave: false, visibility: true}
]

// export const ProducerWebMenuList = [
//     // {group: '1', route: 'producer/web', id: 'login', name: '생산자로그인', page: Producer.ProducerLogin},
//     {group: '1', route: 'producer/web', id: 'home', name: '홈', page: Producer.Home},
//     {group: '2', route: 'producer/web', id: 'goodsList', name: '상품관리', page: Producer.GoodsList},
//     {group: '2', route: 'producer/web', id: 'goodsQnaList', name: '상품문의', page: Producer.GoodsQnaList},
//     {group: '2', route: 'producer/web', id: 'farmDiaryList', name: '생산일지관리', page: Producer.FarmDiaryList},
//     {group: '2', route: 'producer/web', id: 'shop', name: '상점관리', page: Producer.Shop},
//     {group: '2', route: 'producer/web', id: 'goodsReviewList', name: '상품후기', page: Producer.GoodsReviewList},
//     {group: '2', route: 'producer/web', id: 'regularShopList', name: '단골관리', page: Producer.RegularShopList},
//     {group: '3', route: 'producer/web', id: 'orderList', name: '주문목록', page: Producer.OrderList},
//     {group: '3', route: 'producer/web', id: 'blctHistory', name: '적립금관리', page: Producer.BlctHistory},
//     {group: '3', route: 'producer/web', id: 'giganSalesSttList', name: '기간별판매현황', page: Producer.GiganSalesSttList},
//     {group: '3', route: 'producer/web', id: 'calculateTab', name: '정산관리', page: Producer.CalculateTab},
//     // {group: '4', route: 'producer/web', id: 'mypage', name: '마이페이지', page: Producer.Mypage},
//     // {group: '4', route: 'producer/web', id: 'notificationList', name: '알림', page: Shop.NotificationList},
//     // {group: '4', route: 'producer/web', id: 'noticeList', name: '공지사항', page: Common.B2bNoticeList},
//     // {group: '4', route: 'producer/web', id: 'customerCenter', name: '고객센터', page: Producer.CustomerCenter},
//     // {group: '4', route: 'producer/web', id: 'setting', name: '설정', page: Producer.Setting}
// ]

//식자재 업체 메뉴
export const SellerMenuList = [
    {group: '1', route: '/b2b/seller', id: 'login', name: '판매자로그인', page: Seller.SellerLogin, menuNav: false, visibility: true},
    {group: '1', route: '/b2b/seller', id: 'home', name: '홈', page: Seller.Home, menuNav: false, visibility: true},
    {group: '2', route: '/b2b/seller', id: 'foodsList', name: '상품관리', page: Seller.FoodsList, menuNav: true, visibility: true},
    {group: '2', route: '/b2b/seller', id: 'foodsQnaList', name: '상품문의', page: Seller.FoodsQnaList, menuNav: true, visibility: true},
    {group: '2', route: '/b2b/seller', id: 'foodsReviewList', name: '상품후기', page: Seller.FoodsReviewList, menuNav: true, visibility: true},
    {group: '2', route: '/b2b/seller', id: 'regularShopList', name: '즐겨찾기관리', page: Seller.RegularShopList, menuNav: true, visibility: true},
    {group: '2', route: '/b2b/seller', id: 'shop', name: '업체정보/상점관리', page: Seller.Shop, menuNav: true, visibility: true},
    {group: '3', route: '/b2b/seller', id: 'dealList', name: '주문목록', page: Seller.DealList, menuNav: true, visibility: true},
    {group: '3', route: '/b2b/seller', id: 'waesangList', name: '외상거래내역', page: Seller.WaesangList, menuNav: true, visibility: true},
    {group: '3', route: '/b2b/seller', id: 'giganSalesSttList', name: '기간별판매현황', page: Seller.GiganSalesSttList, menuNav: true, visibility: true},
    {group: '3', route: '/b2b/seller', id: 'calculateTab', name: '정산관리', page: Seller.CalculateTab, menuNav: true, visibility: true},
    {group: '4', route: '/b2b/seller', id: 'mypage', name: '마이페이지', page: Seller.Mypage, menuNav: false, visibility: true},
    {group: '4', route: '/b2b/seller', id: 'notificationList', name: '알림', page: B2bShop.NotificationList, menuNave: false, visibility: true},
    {group: '4', route: '/b2b/seller', id: 'noticeList', name: '공지사항', page: Common.B2bNoticeList, menuNave: false, visibility: true},
    {group: '4', route: '/b2b/seller', id: 'customerCenter', name: '고객센터', page: Seller.CustomerCenter, menuNave: false, visibility: true},
    {group: '4', route: '/b2b/seller', id: 'setting', name: '설정', page: Seller.Setting, menuNave: false, visibility: true}
]



// 쇼핑몰(소비자) 메뉴 - 미사용
export const ShopMenuList = [
    // {route: '/main/join', name: '회원가입', page: Producer.ProducerJoin, closeNav: true, visibility: false},
    // {route: '/join', name: '회원가입', page: Producer.ProducerJoin, closeNav: true, visibility: false},
    {route: '/producer/farmDiaryList', name: '재배일지목록', page: Producer.FarmDiaryList, menuNav: true, visibility: true},
    // {route: 'shop', id: 'checkCurrentValword', name: '소비자회원체크', page: Shop.Mypage, menuNav: true, visibility: true},
]

// 생산자 웹 메인메뉴
export const ProducerWebMenuList = [
    {route: 'producer', id: 'home', name: '홈', icon: faSignal},
    {route: 'producer', id: 'goods', name: '상품관리', icon: faBoxOpen},
    {route: 'producer', id: 'shop', name: '상점관리', icon: faStore},
    {route: 'producer', id: 'order', name: '주문관리', icon: faShoppingCart},
    {route: 'producer', id: 'calculate', name: '정산관리', icon: faDollarSign},
    {route: 'producer', id: 'statistic', name: '통계', icon: faChartArea},
    {route: 'producer', id: 'marketing', name: '마케팅', icon: faGlobe},
]

// 생산자 웹 서브메뉴
export const ProducerWebSubMenuList = [
    {parentId: 'home', id: 'home', name: '대시보드', page: Producer.WebHome, noPadding: true, explain: '전체 이력을 한눈에 추적합니다'},
    {parentId: 'home', id: 'noticeList', name: '공지사항', page: Producer.WebNoticeList, noPadding: false, explain: '중요 공지, 점검, 이벤트, 서비스 안내, 정보의 공유 등 다양한 정보를 공지사항을 통해 꼭 확인해 주시기 바랍니다'},
    {parentId: 'goods', id: 'goodsList', name: '상품목록', page: Producer.WebGoodsList, noPadding: false, explain: '상품리스트를 관리 합니다'},
    {parentId: 'goods', id: 'goodsReg', name: '상품등록', page: Producer.WebGoodsSelection, noPadding: false, explain: '상품등록을 합니다'},
    {parentId: 'goods', id: 'goodsReview', name: '상품후기', page: Producer.WebGoodsReviewList, noPadding: false, explain: '고객의 상품후기에 답변을 달아주세요'},
    {parentId: 'goods', id: 'goodsQnaList', name: '상품문의', page: Producer.WebGoodsQnaList, noPadding: false, explain: '고객의 상품문의에 답변을 달아주세요'},
    {parentId: 'goods', id: 'commonInfo', name: '(준비중)공통정보관리', page: Error, noPadding: false, explain: '상품등록 및 운영에 필요한 코드를 관리합니다'},
    {parentId: 'shop', id: 'shop', name: '상점정보', page: Producer.WebShop, noPadding: false, explain: '고객에게 노출되는 상점을 꾸며주세요'},
    {parentId: 'shop', id: 'farmDiaryList', name: '생산일지', page: Producer.WebFarmDiaryList, noPadding: false, explain: '상품의 생산일지에 노출될 생산일지를 상세히 기록해 주세요'},
    {parentId: 'shop', id: 'regularShopList', name: '단골관리', page: Producer.WebRegularShopList, noPadding: false, explain: '단골고객이 얼마나 있을까요?'},
    {parentId: 'shop', id: 'popupList', name: '(준비중)팝업관리', page: Error, noPadding: false, explain: '내용입력요'},
    {parentId: 'shop', id: 'shopNotice', name: '(준비중)상점공지사항', page: Error, noPadding: false, explain: '내용입력요'},
    {parentId: 'order', id: 'orderList', name: '주문통합리스트', page: Producer.WebOrderList, noPadding: false, explain: '고객들이 주문한 리스트를 조회해보세요'},
    {parentId: 'order', id: 'orderCancelList', name: '주문취소리스트', page: Producer.WebOrderCancelList, noPadding: false, explain: '취소된 주문 리스트를 조회해보세요'},
{parentId: 'calculate', id: 'blct', name: '토큰(BLCT)이력조회', page: Producer.WebBlctHistory, noPadding: false, explain: 'BLCT 이용 내역을 확인해보세요'},
    {parentId: 'calculate', id: 'calculateTab', name: '정산관리', page: Producer.WebCalculateTab, noPadding: false, explain: '내용입력요'},
    {parentId: 'statistic', id: 'giganSalesSttList', name: '기간별판매현황', page: Producer.GiganSalesSttList, noPadding: false, explain: '내용입력요'},
    {parentId: 'statistic', id: 'shopStt', name: '(준비중)상점통계', page: Error, noPadding: false, explain: '내용입력요'},
    {parentId: 'marketing', id: 'pushList', name: '(준비중)push관리', page: Error, noPadding: false, explain: '내용입력요'},
]

// 관리자 메인메뉴
export const AdminMenuList = [
    //shop
    {type: 'shop', route: 'admin', id: 'home', name: '홈'},
    {type: 'shop', route: 'admin', id: 'order', name: '주문 및 현황'},
    {type: 'shop', route: 'admin', id: 'consumer', name: '소비자'},
    {type: 'shop', route: 'admin', id: 'producer', name: '생산자'},
    {type: 'shop', route: 'admin', id: 'code', name: '기준정보'},
    {type: 'shop', route: 'admin', id: 'notice', name: '공지사항'},
    {type: 'shop', route: 'admin', id: 'event', name: '이벤트'},
    {type: 'shop', route: 'admin', id: 'token', name: '기본설정 및 토큰'},
    {type: 'shop', route: 'admin', id: 'payment', name: '정산'},

    //fintech
    {type: 'fintech', route: 'admin', id: 'deal', name: 'B2b주문'},
    {type: 'fintech', route: 'admin', id: 'buyer', name: '소비자(식당)'},
    {type: 'fintech', route: 'admin', id: 'seller', name: '판매자'},
    {type: 'fintech', route: 'admin', id: 'code', name: 'B2b기준정보'},  //공통으로 사용
    // {type: 'fintech', route: 'admin', id: 'notice', name: '공지사항'},
]
// 관리자 서브메뉴
export const AdminSubMenuList = [
    //shop
    {type: 'shop', parentId: 'home', id: 'homeSetting', name: '홈화면 구성', page: Admin.B2cHomeSetting, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'mdPickList', name: '기획전', page: Admin.B2cMdPickList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'blyTimeList', name: '블리타임', page: Admin.B2cBlyTimeList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'timeSaleList', name: '포텐타임', page: Admin.B2cTimeSaleList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'orderList', name: '주문확인', page: Admin.OrderList, isMainPage: true},  //isMainPage: true 일 경우 getAdminShopMainUrl() 에서 찾아서 반환
    {type: 'shop', parentId: 'order', id: 'orderStats', name: '실적현황', page: Admin.OrderStats, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'goodsList', name: '상품목록', page: Admin.GoodsList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'blctStats', name: 'BLCT 통계', page: Admin.BlctStats},
    {type: 'shop', parentId: 'order', id: 'blctToWon', name: 'BLY일별가격', page: Admin.BlctToWon},
    {type: 'shop', parentId: 'order', id: 'swapTokenInList', name: '토큰입금', page: Admin.TokenSwapInList},
    {type: 'shop', parentId: 'order', id: 'swapTokenOutList', name: '토큰출금', page: Admin.TokenSwapOutList},
    {type: 'shop', parentId: 'order', id: 'siseCorrectionList', name: '예약상품토큰보정', page: Admin.TokenSiseCorrectionList},

    {type: 'shop', parentId: 'consumer', id: 'consumerList', name: '소비자조회', page: Admin.ConsumerList},
    {type: 'shop', parentId: 'producer', id: 'producerList', name: '생산자조회', page: Admin.ProducerList},
    {type: 'shop', parentId: 'producer', id: 'producerRegRequest', name: '입점문의조회', page: Admin.ProducerRegRequest},
    {type: 'shop', parentId: 'producer', id: 'producerPayout', name: '월 매출 정산', page: Admin.ProducerPayout},
    {type: 'shop', parentId: 'code', id: 'classItemList', name: '품목관리', page: Admin.ItemList},
    {type: 'shop', parentId: 'code', id: 'transportCompanyList', name: '택배사관리', page: Admin.TransportCompanyList},
    {type: 'shop', parentId: 'code', id: 'producerFeeRateList', name: '생산자수수료관리', page: Admin.ProducerFeeRateList},
    // {type: 'shop', parentId: 'notice', id: 'noticeReg', name: '공지사항등록', page: Admin.NoticeReg},
    {type: 'shop', parentId: 'notice', id: 'noticeList', name: '공지사항목록', page: Admin.NoticeList},
    {type: 'shop', parentId: 'notice', id: 'goodsDetailBannerList', name: '상품공지(배너)', page: Admin.GoodsDetailBannerList},
    {type: 'shop', parentId: 'event', id: 'eventList', name: '이벤트지급목록', page: Admin.EventPaymentList},
    {type: 'shop', parentId: 'event', id: 'bountyEventHistory', name: 'BLCT지급 이벤트목록', page: Admin.BountyEventHistory},
    {type: 'shop', parentId: 'token', id: 'simpleAdmin', name: '기본설정', page: Admin.SimpleAdmin},
    {type: 'shop', parentId: 'token', id: 'setToken', name: '토큰설정', page: Admin.SetToken},
    // {type: 'shop', parentId: 'token', id: 'tokenSwap', name: 'Token Swap', page: Admin.TokenSwap},
    {type: 'shop', parentId: 'token', id: 'addAdmin', name: 'Admin 계정생성', page: Admin.AddAdmin},
    {type: 'shop', parentId: 'token', id: 'consumerKycList', name: '소비자KYC인증내역', page: Admin.ConsumerKycList},

    {type: 'shop', parentId: 'payment', id: 'all', name: '전체보기', page: Admin.PaymentAll},
    {type: 'shop', parentId: 'payment', id: 'producers', name: '업체별', page: Admin.PaymentProducer},

    //fintech
    {type: 'fintech', parentId: 'deal', id: 'dealList', name: 'B2b 주문정보', page: Admin.B2bDealList, isMainPage: true},
    {type: 'fintech', parentId: 'deal', id: 'foodsList', name: '판매중상품', page: Admin.FoodsList, isMainPage: false},
    {type: 'fintech', parentId: 'buyer', id: 'buyerList', name: '소비자 정보', page: Admin.B2bBuyerList },
    {type: 'fintech', parentId: 'seller', id: 'sellerList', name: '판매자 정보', page: Admin.B2bSellerList},
    {type: 'fintech', parentId: 'seller', id: 'sellerPayout', name: '식자재 월매출 정산', page: Admin.B2bSellerPayout},
    {type: 'fintech', parentId: 'code', id: 'classB2bItemList', name: '품목관리(b2b)', page: Admin.B2bItemList},

]


//web 접속 시 하단 탭바의 url
export const tabBarData = {
    shop: [
        { pathname: '/category', name: '카테고리'},
        // { pathname: '/timeSale', name: '타임세일', icon: IconHome },
        { pathname: '/mdPick', name: '기획전'},
        { pathname: '/home/1', name: '홈'},
        { pathname: '/mypage', name: '마이페이지'},
        { pathname: '/goodsHistory', name: '검색'},
    ],
    b2b: [
        { pathname: '/b2b/home/1', name: '홈', icon: IconHome },
        { pathname: '/b2b/category', name: '카테고리', icon: IconMenu},
        { pathname: '/b2b/findSeller', name: '업체찾기', icon: IconSearch},
        { pathname: '/b2b/mypage', name: '마이페이지', icon: IconFace}
    ],
    producer: [
        { pathname: '/producer/home', name: '홈', icon: IconHome },
        { pathname: '/producer/goodsList', name: '상품/상점', icon: IconMenu},
        { pathname: '/producer/orderList', name: '주문/정산', icon: IconMenu},
        { pathname: '/producer/mypage', name: '마이페이지', icon: IconFace}
    ],
    seller: [
        { pathname: '/b2b/seller/home', name: '홈', icon: IconHome },
        { pathname: '/b2b/seller/foodsList', name: '상품/상점', icon: IconMenu},
        { pathname: '/b2b/seller/dealList', name: '주문/정산', icon: IconMenu},
        { pathname: '/b2b/seller/mypage', name: '마이페이지', icon: IconFace}
    ]
}

// 상품고시정보 설정 상품별 내용
export const goodsTypeInfo = {
    A: [
        {title:'포장단위별 용량(중량),수량,크기'},
        {title:'생산자/수입자'},
        {title:'생원산지'},
        {title:'제조연월일(포장일/생산연도),유통기한품질유지기한'},
        {title:'농축수산물 표시사항'},
        {title:'제품구성'},
        {title:'보관방법/취급방법'},
        {title:'소비자상담관련 전화번호'},
        {title:'비고'},
        {title:'AS정보'}
    ],
    P: [
        {title:'식품유형'},
        {title:'생산자/수입자'},
        {title:'제조연월일(포장일/생산연도),유통기한품질유지기한'},
        {title:'포장단위별 용량(중량),수량,크기'},
        {title:'원재료명 및 함량'},
        {title:'영양성분'},
        {title:'표시광고 사전심의필'},
        {title:'소비자상담관련 전화번호'},
        {title:'유전자재조합식품여부(유/무)'},
        {title:'수입여부(유/무)'},
        {title:'비고'},
        {title:'AS정보'}
    ],
    H: [
        {title:'식품유형'},
        {title:'생산자/수입자'},
        {title:'제조연월일(포장일/생산연도),유통기한품질유지기한'},
        {title:'포장단위별 용량(중량),수량,크기'},
        {title:'원재료명 및 함량'},
        {title:'영양성분'},
        {title:'기능정보'},
        {title:'주의사항'},
        {title:'표시광고 사전심의필'},
        {title:'소비자상담관련 전화번호'},
        {title:'유전자재조합식품여부(유/무)'},
        {title:'수입여부(유/무)'},
        {title:'의약품여부(유/무/해당없음)'},
        {title:'비고'},
        {title:'AS정보'}
    ]
}

export const Doc = {
    isBigWidth: () => window.innerWidth >= 760
}
