import axios from 'axios'
import { Server } from "../components/Properties";

// export const getFarmDiary = () => {
//     return [
//         {src:'http://localhost:8080/thumbnails/1a8mxPOk1gej.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'},
//         {src:'http://localhost:8080/thumbnails/BYh38iFpyNpN.jpeg', itemCd: '01', itemName: '배추', title: '무럭무럭~'},
//         {src:'http://localhost:8080/thumbnails/iYPH172GOXHb.jpeg', itemCd: '01', itemName: '무', title: '새싹이 돋았습니다'},
//         {src:'http://localhost:8080/thumbnails/Ke5jcD72uqmn.jpg', itemCd: '01', itemName: '무', title: '꽃이 피었어요'},
//         {src:'http://localhost:8080/thumbnails/KOZSl1c3D6VU.jpeg', itemCd: '01', itemName: '무', title: '날씨가 좋아서 잘 자라고있어요'},
//         {src:'http://localhost:8080/thumbnails/pc6TsQjg6ei1.jpg', itemCd: '01', itemName: '시금치', title: '무농약 인증'},
//         {src:'http://localhost:8080/thumbnails/rxE35Z7pRC2l.jpg', itemCd: '01', itemName: '사과', title: '보이시나요?'},
//         {src:'http://localhost:8080/thumbnails/tjYTBL7W6JhG.jpg', itemCd: '01', itemName: '배추', title: '현재까지 당도가 상당히 높아요'},
//         {src:'http://localhost:8080/thumbnails/ts9cgzVLshSK.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'},
//         {src:'http://localhost:8080/thumbnails/uLZJlqaEOoWK.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'}
//     ]
// }

// 생산자 등록
export const addProducer = (data) => axios(Server.getRestAPIHost() + '/producer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 로그인한 생산자  조회
export const getProducer = () => axios(Server.getRestAPIHost() + '/producer', { method: "get", withCredentials: true, credentials: 'same-origin' })
//
export const getProducerValword = (valword) => axios(Server.getRestAPIHost() + '/checkProducerValword', { method: "get", params: {valword: valword}, withCredentials: true, credentials: 'same-origin' })
// 생산자 조회
export const getProducerByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/producerNo', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })
// 생산자 이메일 조회
export const getProducerEmail = (email) => axios(Server.getRestAPIHost() + '/producer/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })

//재배일지 조회
export const getFarmDiary = () => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "get", withCredentials: true, credentials: 'same-origin' })

//재배일지 등록
export const addFarmDiary = (farmDiary) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "post", data: farmDiary, withCredentials: true, credentials: 'same-origin' })

//재배일지 수정
export const updFarmDiary = (farmDiary) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "put", data: farmDiary, withCredentials: true, credentials: 'same-origin' })

//재배일지 삭제
export const delFarmDiary = (diaryNo) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "delete", params:{diaryNo: diaryNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자번호로 주문목록 조회
export const getOrderByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자번호로 주문목록 조회
export const getOrderWithoutCancelByProducerNo = (itemName, payMethod, orderStatus, startDate, endDate) =>
    axios(Server.getRestAPIHost() + '/producer/orderWithoutCancelByProducerNo', {
        method: "get",
        params: {itemName: itemName, payMethod: payMethod, orderStatus: orderStatus, startDate: startDate, endDate: endDate},
        withCredentials: true,
        credentials: 'same-origin'
    })

// 생산자번호로 취소된 주문목록 조회
export const getCancelOrderByProducerNo = (year, itemName, payMethod) => axios(Server.getRestAPIHost() + '/producer/cancelOrderByProducerNo', {
    method: "get",
    params: {year: year, itemName: itemName, payMethod: payMethod},
    withCredentials: true, credentials: 'same-origin'
})

// 생산자의 구매확정된 모든 주문목록
export const getAllConfirmedOrder = () => axios(Server.getRestAPIHost() + '/producer/allConfirmedOrder', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자의 구매확정된 주문목록 조회(월별, 정산리스트용)
export const getConfirmedOrderByProducerNo = (year, month) => axios(Server.getRestAPIHost() + '/producer/confirmedOrderByProducerNo', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자의 정산완료된 주문목록 조회(월별, 정산리스트용)
export const getPayoutCompletedOrderByProducerNo = (year, month) => axios(Server.getRestAPIHost() + '/producer/payoutCompletedOrderByProducerNo', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

//주문 운송장 정보 업데이트
export const updateOrderTrackingInfo = (order) => axios(Server.getRestAPIHost() + '/producer/order/trackingInfo', { method: "patch", data: order, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 변경
export const updValword = (data) => axios(Server.getRestAPIHost() + '/producer/valword', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 푸시 알림 수신 변경
export const updateProducerPush = (data) => axios(Server.getRestAPIHost() + '/producer/updateProducerPush', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자에게 등록된 단골고객수 조회
export const countRegularConsumer = (producerNo) => axios(Server.getRestAPIHost() + '/producer/countRegular', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

//누적구매건수
export const countTotalOrder = (producerNo) => axios(Server.getRestAPIHost() + '/producer/countOrder', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 주문건수 (오늘,어제,주간,월간)
export const getOperStatOrderCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 취소건수 (오늘,어제,주간,월간)
export const getOperStatOrderCancelCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderCancelCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 매출
export const getOperStatOrderSalesAmtByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderSalesByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품문의건수 (오늘,어제,주간,월간)
export const getOperStatGoodsQnaCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatGoodsQnaCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품후기건수 (오늘,어제,주간,월간)
export const getOperStatGoodsReviewCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatGoodsReviewCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 단골회원 (오늘,어제,주간,월간)
export const getOperStatRegularShopCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatRegularShopCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 결제완료 (최근1개월기준)
export const getOrderStatOrderPaidCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatOrderPaidByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송중 (최근1개월기준)
export const getOrderStatShippingCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatShippingByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송완료 (최근1개월기준)
export const getOrderStatDeliveryCompCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatDeliveryCompByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 구매확정 (최근1개월기준)
export const getOrderStatOrderConfirmOkCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatOrderConfirmOkByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문 매출 추이 (1월~12월)
export const getTransitionWithOrderSaleByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/transitionWithOrderSaleByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의리스트
export const getGoodsQnaListByProducerNo = (status) => axios(Server.getRestAPIHost() + '/producer/goodsQnaListByProducerNo', { method: "get", params:{status: status},withCredentials: true, credentials: 'same-origin' })
// 생산자 소비자상품문의 미응답,응답 카운트
export const getGoodsQnaStatusCountByProducerNo = (status) => axios(Server.getRestAPIHost() + '/producer/goodsQnaStatusCountByProducerNo', { method: "get", params:{status: status},withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 조회
export const getGoodsQnaByGoodsQnaNo = (goodsQnaNo) => axios(Server.getRestAPIHost() + '/producer/goodsQnaByGoodsQnaNo', { method: "get", params:{goodsQnaNo: goodsQnaNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 답변 처리
export const setGoodsQnaAnswerByGoodsQnaNo = (goodsQna) => axios(Server.getRestAPIHost() + '/producer/goodsQnaAnswerByGoodsQnaNo', { method: "put", data: goodsQna, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 조회
export const getProducerShopByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/producerShopByProducerNo', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 변경 처리
export const setProducerShopModify = (producerShop) => axios(Server.getRestAPIHost() + '/producer/producerShopModify', { method: "put", data: producerShop, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품후기리스트
export const getGoodsReviewListByProducerNo = (searchStars) => axios(Server.getRestAPIHost() + '/producer/goodsReviewListByProducerNo', { method: "post", params:{searchStars: searchStars}, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품후기 신규 카운트 [14일이전까지]
export const getGoodsReviewNewCountByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/goodsReviewNewCountByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자단골리스트(regularShop list)
export const getRegularShopListByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/regularShopByProducerNo', { method: "post", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 통계 - 기간별 판매현황
export const getStaticsGiganSalesListByProducerNo = (data) => axios(Server.getRestAPIHost() + '/producer/giganSalesSttByProducerNo', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 정산관리 - 정산현황(금월)  ==>> 사용 안함(20.8.13)
export const getAllProducerCalculateList = (year, month) => axios(Server.getRestAPIHost() + '/producer/allProducerCalculateList', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문확인
export const setOrderConfirm = (data) => axios(Server.getRestAPIHost() + '/producer/orderConfirm', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문내역 송장번호 일괄 저장 기능 (엑셀업로드 기능)
export const setOrdersTrackingNumber = (data) => axios(Server.getRestAPIHost() + '/producer/setOrdersTrackingNumber', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 입점문의
export const regProducer = (data) => axios(Server.getRestAPIHost() + '/producer/queProducer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소
export const producerCancelOrder = (data) => axios(Server.getRestAPIHost() + '/producer/cancelOrder', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소 요청
export const reqProducerOrderCancel = (data) => axios(Server.getRestAPIHost() + '/producer/reqProducerOrderCancel', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 부분환불
export const partialRefundOrder = (data) => axios(Server.getRestAPIHost() + '/producer/partialRefundOrder', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 주문내역 조회
export const getPaymentProducer = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/producer/paymentProducer', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 은행정보 조회
export const getBankInfoList = () => axios(Server.getRestAPIHost() + '/producer/bankInfoList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 주문정보 조회
export const getOrderDetailByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/producer/order', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

//소비자 번호로 소비자정보 조회
export const getConsumerByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/producer/consumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/producer/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })
