import { WebLogin } from './web'
import { WebHome } from './web/home'
import WebShop from './web/shop'
import { WebGoodsList, WebGoodsReg, WebDirectGoodsReg, WebGoodsSelection } from './web/goods'
import WebFarmDiaryList from './web/farmDiaryList'
import FarmDiaryReg from './web/farmDiaryReg'
import WebRegularShopList from './web/regularShop'
import { WebOrderList, WebOrderCancelList } from './web/orderList'
import Order from './web/order'
import { WebCalculateTab, WebBlctHistory } from './web/calculate'
import { WebGoodsQnaList } from './web/goodsQna'
import WebGoodsReviewList from './web/goodsReview'
import { WebNoticeList } from './web/home/noticeList'
import { GiganSalesSttList } from './web/statistics'

export {
    WebLogin,
    WebHome,
    WebNoticeList,
    WebGoodsList,
    WebGoodsSelection,
    WebGoodsReg,
    WebDirectGoodsReg,
    WebShop,
    WebFarmDiaryList,
    FarmDiaryReg,   //생산자 재배일지 등록 수정
    WebRegularShopList,
    WebOrderList,
    Order,          //생산자 주문 정보
    WebOrderCancelList,
    WebGoodsQnaList,
    WebGoodsReviewList,
    WebCalculateTab,
    WebBlctHistory,
    GiganSalesSttList,  //생산자 기간별 판매현황
}
