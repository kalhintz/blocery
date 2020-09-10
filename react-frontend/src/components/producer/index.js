import Home from './home'
import GoodsReg from './goodsReg'
import DirectGoodsReg from './directGoodsReg'
import FarmDiaryReg from './farmDiaryReg'
import FarmDiaryList from './farmDiaryList'
import GoodsList from './goodsList'
import {Shop, ShopModify} from './shop'
import { GoodsQnaList } from './goodsQna'
import { GoodsReviewList } from './goodsReview'
import { RegularShopList } from './regularShop'
import Order from './order'
import OrderList from './orderList'
import { GiganSalesSttList } from './statistics'

import ProducerLogin from './login'
import Mypage from './mypage'
import { BlctHistory } from './blctHistory'
import { CalculateStatus, CalculateHistory, CalculateTab } from './calculate'
import { CustomerCenter } from './mypage/customerCenter'
import { Setting } from './mypage/setting'
import { WebLogin } from './web'
import { WebHome } from './web/home'
import { WebShop } from './web/shop'
import { WebGoodsList, WebGoodsReg, WebDirectGoodsReg, WebGoodsSelection } from './web/goods'
import { WebFarmDiaryList } from './web/farmDiaryList'
import { WebRegularShopList } from './web/regularShop'
import { WebOrderList, WebOrderCancelList } from './web/orderList'
import { WebCalculateTab, WebBlctHistory } from './web/calculate'
import { WebGoodsQnaList } from './web/goodsQna'
import { WebGoodsReviewList } from './web/goodsReview'
import { WebNoticeList } from './web/home/noticeList'

export {
    ProducerLogin,       // 생산자 로그인
    Home,
    GoodsReg,       //생산자 상품 등록(예약판매)
    DirectGoodsReg, //생산자 상품 등록(즉시판매)
    GoodsList,      //생산자 상품 목록
    GoodsQnaList,   //생산자 상품문의목록
    FarmDiaryReg,   //생산자 재배일지 등록 수정
    FarmDiaryList,  //생산자 재배일지 목록
    Shop,           //상점 정보 View
    ShopModify,     //상점 정보 변경
    GoodsReviewList,    //생산자 상품후기목록
    RegularShopList,    //생산자 소비자단골목록
    Order,          //생산자 주문 정보
    OrderList,      //생산자 주문 목록
    GiganSalesSttList,  //생산자 기간별 판매현황
    Mypage,          //생산자 Mypage
    BlctHistory,
    // CalculateHistory,
    // CalculateStatus,
    CalculateTab,
    CustomerCenter,
    Setting,
    WebHome,
    WebGoodsList,
    WebGoodsSelection,
    WebGoodsReg,
    WebDirectGoodsReg,
    WebLogin,
    WebShop,
    WebFarmDiaryList,
    WebRegularShopList,
    WebOrderList,
    WebOrderCancelList,
    WebCalculateTab,
    WebBlctHistory,
    WebGoodsQnaList,
    WebGoodsReviewList,
    WebNoticeList
}
