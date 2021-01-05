import Error from './Error'
import * as Producer from '../components/producer'
import * as Admin from '../components/admin'
// import { faChartArea, faBoxOpen, faStore, faShoppingCart, faDollarSign, faSignal, faGlobe } from "@fortawesome/free-solid-svg-icons";
import {FaChartArea, FaBoxOpen, FaStore, FaShoppingCart, FaDollarSign, FaSignal, FaGlobe} from 'react-icons/fa'

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
    getRestAPIFileServerHost: function() {
        //return window.location.hostname === 'localhost' ? this._getLocalServerUrl() + '/restapi' : this._getServer() + '/restapi';
        return this._getServer() + '/restapi';
    },
    //local개발시에도 225서버로 file upload path 되도록 추가.
    getImgTagServerURL: function() {
        //return window.location.hostname === 'localhost' ? this._getLocalServerUrl():this._getServer();
        return this._getServer();
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getImageURL: function() {
        //return  window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/images/' : this._getServer() + '/images/';
        return  this._getServer() + '/images/';      //개발시에도 225 이미지 보기
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getThumbnailURL: function() {
        //return  window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/thumbnails/' : this._getServer() + '/thumbnails/';
        return  this._getServer() + '/thumbnails/'; //개발시에도 225 이미지 보기
    },
    getServerURL: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl() : this._getServer();
    },
    getFrontURL:function() {
        return window.location.hostname === 'localhost' ? this._getLocalFrontUrl() : this._getServer();
    },
    getKakaoAppKey:function (){
        if (this._serverMode() === 'stage')
            return "87c79a2872503bb948c11a5239a68e51";   //test
        else
            return "e1362624032fd8badb8733b8894607d6";   //production
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
            if (window.location.hostname === 'marketbly.com') {
                return protocol+'//marketbly.com'; //202012 추가- 멀티도메인
            }
            return protocol+'//blocery.com'; //AWS 서버 IP = http://13.209.43.206
        }
    },
    //관리자 메인페이지
    getAdminShopMainUrl: function(){
        const {type, parentId, id} = AdminSubMenuList.find(menu => menu.type === 'shop' && menu.isMainPage === true)
        return `/admin/${type}/${parentId}/${id}`
    },
    getShopMainUrl: function(){
        return '/'
    },
    ERROR: 100
}

export const Const = {
    GAS_LIMIT: 50000,  // 사용자 토큰전송을 위해 approve시 대략 50,000 gas 필요함
    INITIAL_TOKEN : 1000,
    GIVE_ETH_GASTIMES : 5,
    VALWORD_CRYPTO_KEY : 'u8d7l5h3z0m'   //localStorage에 valword저장시 암호화용 키
}

export const User = {
    admin: '관리자',
    consumer: '소비자',
    producer: '생산자'
}

// 생산자 웹 메인메뉴
export const ProducerWebMenuList = [
    {route: 'producer', id: 'home', name: '홈', icon: FaSignal},
    {route: 'producer', id: 'goods', name: '상품관리', icon: FaBoxOpen},
    {route: 'producer', id: 'shop', name: '상점관리', icon: FaStore},
    {route: 'producer', id: 'order', name: '주문관리', icon: FaShoppingCart},
    {route: 'producer', id: 'calculate', name: '정산관리', icon: FaDollarSign},
    {route: 'producer', id: 'statistic', name: '통계', icon: FaChartArea},
    {route: 'producer', id: 'marketing', name: '마케팅', icon: FaGlobe},
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
    {parentId: 'calculate', id: 'blct', name: '토큰(BLY)이력조회', page: Producer.WebBlctHistory, noPadding: false, explain: 'BLCT 이용 내역을 확인해보세요'},
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
]
// 관리자 서브메뉴
export const AdminSubMenuList = [
    //shop
    {type: 'shop', parentId: 'home', id: 'homeSetting', name: '홈화면 구성', page: Admin.B2cHomeSetting, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'eventInfoList', name: '이벤트정보', page: Admin.EventInfoList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'mdPickList', name: '기획전', page: Admin.B2cMdPickList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'blyTimeList', name: '블리타임', page: Admin.B2cBlyTimeList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'timeSaleList', name: '포텐타임', page: Admin.B2cTimeSaleList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'superRewardList', name: '슈퍼리워드', page: Admin.B2cSuperRewardList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'orderList', name: '주문확인', page: Admin.OrderList, isMainPage: true},  //isMainPage: true 일 경우 getAdminShopMainUrl() 에서 찾아서 반환
    {type: 'shop', parentId: 'order', id: 'orderStats', name: '실적현황', page: Admin.OrderStats, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'goodsList', name: '상품목록', page: Admin.GoodsList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'blctStats', name: 'BLY통계', page: Admin.BlctStats},
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
    // {type: 'shop', parentId: 'notice', id: 'homeBannerList', name: '홈공지(배너)', page: Admin.HomeBannerList},
    {type: 'shop', parentId: 'notice', id: 'goodsDetailBannerList', name: '상품공지(배너)', page: Admin.GoodsDetailBannerList},
    {type: 'shop', parentId: 'notice', id: 'pushNotiList', name: '푸쉬알림목록', page: Admin.PushNotiList},
    // {type: 'shop', parentId: 'event', id: 'eventList', name: '이벤트지급목록', page: Admin.EventPaymentList},
    {type: 'shop', parentId: 'event', id: 'goPaxJoinEvent', name: '고팍스가입이벤트', page: Admin.GoPaxJoinEventList},
    {type: 'shop', parentId: 'event', id: 'goPaxCardEvent', name: '고팍스카드이벤트', page: Admin.GoPaxCardEventList},
    {type: 'shop', parentId: 'event', id: 'consumerCoupon', name: '쿠폰지급내역', page: Admin.ConsumerCouponList},
    {type: 'shop', parentId: 'event', id: 'couponMaster', name: '쿠폰발급내역', page: Admin.CouponMasterList},
    {type: 'shop', parentId: 'event', id: 'bountyEventHistory', name: 'BLCT지급 이벤트목록', page: Admin.BountyEventHistory},

    {type: 'shop', parentId: 'token', id: 'simpleAdmin', name: '기본설정', page: Admin.SimpleAdmin},
    {type: 'shop', parentId: 'token', id: 'setToken', name: '토큰설정', page: Admin.SetToken},
    // {type: 'shop', parentId: 'token', id: 'tokenSwap', name: 'Token Swap', page: Admin.TokenSwap},
    {type: 'shop', parentId: 'token', id: 'addAdmin', name: 'Admin 계정생성', page: Admin.AddAdmin},
    {type: 'shop', parentId: 'token', id: 'consumerKycList', name: '소비자KYC인증내역', page: Admin.ConsumerKycList},

    {type: 'shop', parentId: 'payment', id: 'all', name: '전체보기', page: Admin.PaymentAll},
    {type: 'shop', parentId: 'payment', id: 'producers', name: '업체별', page: Admin.PaymentProducer},
    {type: 'shop', parentId: 'payment', id: 'tempProducer', name: '현금대납현황', page: Admin.TempProducerList},
]


//web 접속 시 하단 탭바의 url
export const tabBarData = {
    shop: [
        { pathname: '/category', name: '카테고리'},
        // { pathname: '/timeSale', name: '타임세일', icon: IconHome },
        { pathname: '/mdPick', name: '기획전'},
        { pathname: '/', name: '홈'},
        { pathname: '/mypage', name: '마이페이지'},
        { pathname: '/goodsHistory', name: '검색'},
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