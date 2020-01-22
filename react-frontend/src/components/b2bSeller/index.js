import Home from './home'
import DirectFoodsReg from './directFoodsReg'
import FoodsList from './foodsList'
import {Shop, ShopModify} from './shop'
import { FoodsQnaList } from './foodsQna'
import { FoodsReviewList } from './foodsReview'
import { RegularShopList } from './regularShop'
import Deal from './deal'
import DealList from './dealList'
import WaesangList from './waesang'
import { GiganSalesSttList } from './statistics'

import SellerLogin from './login'
import Mypage from './mypage'
import { BlctHistory } from './blctHistory'
import { CalculateStatus, CalculateHistory, CalculateTab } from './calculate'
import { CustomerCenter } from './mypage/customerCenter'
import { Setting } from './mypage/setting'

export {
    SellerLogin,    //판매자 로그인
    Home,
    DirectFoodsReg, //판매자 상품 등록(즉시판매)
    FoodsList,      //판매자 상품 목록
    FoodsQnaList,   //판매자 상품문의목록
    Shop,           //상점 정보 View
    ShopModify,     //상점 정보 변경
    FoodsReviewList,    //판매자 상품후기목록
    RegularShopList,    //판매자 소비자단골목록
    Deal,               //판매자 주문 정보
    DealList,           //판매자 주문 목록
    WaesangList,        //판매자 외상거래내역
    GiganSalesSttList,  //판매자 기간별 판매현황
    Mypage,          //판매자 Mypage
    BlctHistory,
    // CalculateHistory,
    // CalculateStatus,
    CalculateTab,
    CustomerCenter,
    Setting

}
