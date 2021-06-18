import axios from 'axios'
import { Server } from "../components/Properties";

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllConsumers = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/allConsumers', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 소비자 검색 (탈퇴자제외)
export const getConsumerList = () => axios(Server.getRestAPIHost() + '/getConsumerList', { method: "get", withCredentials: true, credentials: 'same-origin' })

//친구추천 카운트 조회
export const getInviteFriendCount = (consumerNo) => axios(Server.getRestAPIHost() + '/inviteFriendCount', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 탈퇴한 소비자
export const getStoppedConsumers = () => axios(Server.getRestAPIHost() + '/stoppedConsumers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 추천인/친구 조회
export const getRecommendFriends = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/recommendFriends', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 어뷰저리스트
export const getConsumerAbusers = () => axios(Server.getRestAPIHost() + '/admin/abusers', { method: "get", withCredentials: true, credentials: 'same-origin' })

//회원 수(탈퇴안한 수)
export const getConsumerCount = () => axios(Server.getRestAPIHost() + '/consumerCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//회원 수(탈퇴한 수)
export const getConsumerStopedCount = () => axios(Server.getRestAPIHost() + '/consumerStopedCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//회원 수(휴면한 수)
export const getConsumerDormancyCount = () => axios(Server.getRestAPIHost() + '/consumerDormancyCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//준회원 수(giftReceiver 수)
export const getSemiConsumerCount = () => axios(Server.getRestAPIHost() + '/semiConsumerCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 생산자 모든 회원 상품 문의
export const producerGoodsQnaList = ({startDate,endDate,status}) => axios(Server.getRestAPIHost() + '/admin/producerGoodsQnaList', { method: "get", params:{startDate:startDate,endDate:endDate,status:status},withCredentials: true, credentials: 'same-origin' })
export const producerGoodsQnaStatusAllCount = (status) => axios(Server.getRestAPIHost() + '/producerGoodsQnaStatusAllCount', { method: "get", params:{status:status},withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllProducers = () => axios(Server.getRestAPIHost() + '/allProducers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllProducerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allProducerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 포텐타임 지원금 blct 월별 금액 조회
export const getSupportPriceBlct = (year, month) => axios(Server.getRestAPIHost() + '/admin/getSupportPriceBlct', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 check 자료 조회
export const getProducerPaymentCheck = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/producerPaymentCheck', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 정산시 체크 메모리스트 조회
export const getPaymentCheckMemoList = (producerNoDotMonth) => axios(Server.getRestAPIHost() + '/admin/getPaymentCheckMemoList', { method: "get", params: {producerNoDotMonth: producerNoDotMonth}, withCredentials: true, credentials: 'same-origin' })

// 정산 메모 삭제
export const delPaymentMemo = (memoData) => axios(Server.getRestAPIHost() + '/admin/delPaymentMemo', { method: "delete", data: memoData, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 주문내역 조회
export const getPaymentProducer = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/paymentProducer', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setProducerPayoutStatus = (year, month) =>
    axios(Server.getRestAPIHost() + '/admin/orderDetail/producerPayoutStatus', {
        method: "patch",
        params: {year: year, month: month},
        withCredentials: true, credentials: 'same-origin'
    })

export const transferTempProducerBlctToEzfarm = (year, month) => axios(Server.getRestAPIHost() + '/admin/transferTempProducerBlctToEzfarm',
    {method: "post", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin'})

// 모든 주문번호 가져오기
export const getAllOrderDetailList = ({startDate,endDate,orderStatus}) => axios(Server.getRestAPIHost() + '/allOrderDetailList', { method: "get", params: {startDate:startDate,endDate:endDate,orderStatus:orderStatus}, withCredentials: true, credentials: 'same-origin' })

// 주문 카드 오류 내 가져오기
export const getAllOrderTempDetailList = ({year,month}) => axios(Server.getRestAPIHost() + '/allOrderTempDetailList', { method: "get", params: {year:year,month:month}, withCredentials: true, credentials: 'same-origin' })

export const getAllOrderStats = ({startDate, endDate, isConsumerOk, searchType, isYearMonth}) => axios(Server.getRestAPIHost() + '/allOrderStats', { method: "get", params: {startDate:startDate, endDate:endDate, isConsumerOk: isConsumerOk, searchType:searchType, isYearMonth:isYearMonth}, withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsSaleList = () => axios(Server.getRestAPIHost() + '/allGoodsSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAdminGoodsNoBuyReward = () => axios(Server.getRestAPIHost() + '/getAdminGoodsNoBuyReward', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsNotEvent = () => axios(Server.getRestAPIHost() + '/allGoodsNotEvent', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllGoods = () => axios(Server.getRestAPIHost() + '/allGoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 품절상품 조회
export const getSoldOutGoods = () => axios(Server.getRestAPIHost() + '/soldOutGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매 일시중지 상품 조회
export const getPausedGoods = () => axios(Server.getRestAPIHost() + '/pausedGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매종료상품 조회
export const getSaleEndGoods = (deleted = false) => axios(Server.getRestAPIHost() + '/saleEndGoodsList', {method: "get", params: {deleted: deleted}, withCredentials: true, credentials: 'same-origin'})

// consumerNo로 account 가져오기
export const getNewAllocateSwapBlyAccount = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/getNewAllocateSwapBlyAccount', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// email로 account 가져오기
export const getConsumerAccountByEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 reset (abc1234!)
export const resetPassword = (userType, email) => axios(Server.getRestAPIHost() + '/valword', { method: "put", params: {userType:userType, email: email}, withCredentials: true, credentials: 'same-origin' })


//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 번호)
export const getTransportCompanyByNo = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyNo', { method: "get", params: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 코드)
export const getTransportCompanyByCode = (transportCompanyCode) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyCode', { method: "get", params: {transportCompanyCode: transportCompanyCode}, withCredentials: true, credentials: 'same-origin' })

//택배사 등록 & 수정
export const addTransportCompany = (transportCompany) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "post", data: transportCompany, withCredentials: true, credentials: 'same-origin' })

//택배사 삭제
export const delTransportCompany = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "delete", params:{transportCompanyNo: transportCompanyNo}, data: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사코드 중복여부 체크
export const getIsDuplicatedTransportCode = (transportCompanyCode, transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/validate', { method: "get", params: {transportCompanyCode: transportCompanyCode, transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(전체)
export const getItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(품목 번호)
export const getItemByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/item/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//품목 등록 & 수정
export const addItem = (item) => axios(Server.getRestAPIHost() + '/admin/item', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//품목 활성 or 비활성
export const updateItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/itemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드로 품명 조회
export const getItemKindByCode = (code) => axios(Server.getRestAPIHost() + '/admin/itemKind', { method: "get", params: {code: code}, withCredentials: true, credentials: 'same-origin' })

// 상품 현재 가격 설정
export const setCurrentPriceOfAllValidGoods = () => axios(Server.getRestAPIHost() + '/admin/goods/batchCurrentPrice', { method: "patch", withCredentials: true, credentials: 'same-origin' })

// 미배송 배치 처리
export const setNotDeliveryOrder = () => axios(Server.getRestAPIHost() + '/admin/batchNotDelivery', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 생산자에게 발송 임박 상품 알림 처리
export const sendWarnShippingStart = () => axios(Server.getRestAPIHost() + '/admin/batchWarnShippingStart', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 미배송발생시 미배송 알림 테스트 (배치테스트)
export const sendNotiDelayShipping = () => axios(Server.getRestAPIHost() + '/admin/batchNotiDelayShipping', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 공지사항 등록
export const regNotice = (notice) => axios(Server.getRestAPIHost() + '/admin/regNotice', { method: "post", data: notice, withCredentials: true, credentials: 'same-origin'})

// 공지사항 조회
export const getNoticeList = (userType) => axios(Server.getRestAPIHost() + '/getNoticeList', { method: "get", params:{userType: userType}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 한건 조회
export const getNoticeByNoticeNo = (noticeNo) => axios(Server.getRestAPIHost() + '/getNotice', { method: "get", params:{noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 삭제
export const delNoticeApi = (noticeNo) => axios(Server.getRestAPIHost() + '/admin/delNotice', { method: "delete", params:{noticeNo: noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 등록
export const regPushNoti = (pushNoti) => axios(Server.getRestAPIHost() + '/admin/regPushNoti', { method: "post", data: pushNoti, withCredentials: true, credentials: 'same-origin'})

// 푸시알림 조회
export const getPushNotiList = ({year}) => axios(Server.getRestAPIHost() + '/getPushNotiList', { method: "get", params:{year: year}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 한건 조회
export const getPushNotiByPushNotiNo = (pushNotiNo) => axios(Server.getRestAPIHost() + '/getPushNoti', { method: "get", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 삭제
export const delPushNoti = (pushNotiNo) => axios(Server.getRestAPIHost() + '/admin/delPushNoti', { method: "delete", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })


// 이벤트 지급 목록
export const getB2cEventPaymentList = () => axios(Server.getRestAPIHost() + '/admin/getB2cEventPaymentList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 자동구매확정 배치 처리(B2C)
export const setOrderDetailConfirm = () => axios(Server.getRestAPIHost() + '/admin/batchOrderConfirm', { method: "post", withCredentials: true, credentials: 'same-origin' })


// 생산자의 BLCT구매 정산방법 변경
export const changeProducerPayoutBlct = (producerNo, newPayoutBlct) => axios(Server.getRestAPIHost() + '/changeProducerPayoutBlct', { method: "post", params:{producerNo: producerNo, newPayoutBlct: newPayoutBlct}, withCredentials: true, credentials: 'same-origin' })


// 생산자 수수료 등록 및 수정
export const regProducerFeeRate = (data) => axios(Server.getRestAPIHost() + '/admin/regProducerFeeRate', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' });

// 생산자 수수료 목록
export const getProducerFeeRate = () => axios(Server.getRestAPIHost() + '/admin/getProducerFeeRateList', { method: "get", withCredentials: true, credentials: 'same-origin' });


// 생산자별 개인 수수료 수정
export const saveFeeRateToProducer = (producerNo, producerRateId, rate) => axios(Server.getRestAPIHost() + '/admin/saveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 개인 수수료 수정 예약.
export const reserveFeeRateToProducer = (producerNo, producerRateId, rate, date) => axios(Server.getRestAPIHost() + '/admin/reserveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate, date: date}, withCredentials: true, credentials: 'same-origin' })
// 생산자별 개인 수수료 수정 즉시 변.
export const directFeeRateToProducer = (producerNo, producerRateId, rate) => axios(Server.getRestAPIHost() + '/admin/directFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate}, withCredentials: true, credentials: 'same-origin' })

export const setPayoutAmountBatch = () => axios(Server.getRestAPIHost() + '/admin/setPayoutAmountBatch', { method: "get", withCredentials: true, credentials: 'same-origin' });

///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////

//B2B판매중 상팜
export const getAllFoodsSaleList = () => axios(Server.getRestAPIHost() + '/allFoodsSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })


//B2B 품목 조회(전체)
export const getB2bItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 조회(품목 번호)
export const getB2bItemByNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/b2bItem/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 등록 & 수정
export const addB2bItem = (item) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewB2bItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })


//품목 활성 or 비활성
export const updateB2bItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setSellerPayoutStatus = (dealSeqList, payoutStatus, totalPayout) =>
    axios(Server.getRestAPIHost() + '/admin/dealDetail/sellerPayoutStatus', {
        method: "patch",
        data: dealSeqList,
        params: {payoutStatus: payoutStatus, totalPayout: totalPayout},
        withCredentials: true, credentials: 'same-origin'
    })

// 업체별 정산 체크정보 저장
export const savePaymentCheck = (data) => axios(Server.getRestAPIHost() + '/admin/savePaymentCheck', {method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllSellerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allSellerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 모든 주문번호 가져오기
export const getAllDealDetailList = () => axios(Server.getRestAPIHost() + '/allDealDetailList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllFoods = () => axios(Server.getRestAPIHost() + '/allFoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllBuyers = () => axios(Server.getRestAPIHost() + '/allBuyers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllSellers = () => axios(Server.getRestAPIHost() + '/allSellers', { method: "get", withCredentials: true, credentials: 'same-origin' })

//// b2c 홈 화면 구성
export const getHomeSetting = () => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "get", withCredentials: true, credentials: 'same-origin' })// 홈세팅 조회

// 기획전 상품 번호 저장
export const setHomeSetting = (settingNoList) => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "post", data: settingNoList, withCredentials: true, credentials: 'same-origin' })// 기획 상품 조회
export const getExGoodsNoList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/exGoodsNo', { method: "get", withCredentials: true, credentials: 'same-origin' })
// best deal 상품 조회
export const getSpecialDealGoodsList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/specialDealGoods', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 오늘의 생산자 상품 조회
export const getTodayProducerList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/todayProducer', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 배너 조회
export const getBannerList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/banner', { method: "get", withCredentials: true, credentials: 'same-origin' })

//타입에 따른 이벤트 번호조회(type : blyTime, potenTime)
export const getEventNoByType = (type) => axios(Server.getRestAPIHost() + '/admin/b2cHome/eventNo/type', { method: "get", params: {type}, withCredentials: true, credentials: 'same-origin' })

//// 이벤트 정보
// 이벤트 정보 목록
export const getEventInfoList = () => axios(Server.getRestAPIHost() + '/admin/eventInfoList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 이벤트 정보 조회
export const getEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "get", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })
// 이벤트 저장
export const setEventInfoSave = (event) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "post", data: event, withCredentials: true, credentials: 'same-origin' })
// 이벤트 삭제
export const delEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "delete", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })

//// b2c 기획전 관리
// 기획전 조회
export const getMdPickList = () => axios(Server.getRestAPIHost() + '/admin/b2cMdPickList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 기획전 정보 조회
export const getMdPick = (mdPickId) => axios(Server.getRestAPIHost() + '/admin/b2cMdPick', { method: "get", params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 삭제
export const delMdPick = (mdPickId) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickDel', { method: "delete", params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 홈화면에숨김
export const hideMdPick = (mdPickId, hideFromHome) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickHide', { method: "post", params:{mdPickId: mdPickId, hideFromHome:hideFromHome}, withCredentials: true, credentials: 'same-origin' })
// 기획전 저장
export const setMdPickSave = (mdPick) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickSave', { method: "post", data: mdPick, withCredentials: true, credentials: 'same-origin' })

////b2c 블리타임
// 블리타임 조회 (All)
export const getBlyTimeAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 블리타임 삭제
export const delBlyTime = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 블리타임 등록
export const setBlyTimeRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// 블리타임 수정
export const setBlyTimeUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 포텐타임
// 포텐타임 조회 (All)
export const getTimeSaleAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 상품 조회 (단건) - 블리타임과수퍼리워드하고 동일하게 controller 호출함.
export const getTimeSaleAdmin = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdmin', { method: "get", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 삭제
export const delTimeSale = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 등록
export const setTimeSaleRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 수정
export const setTimeSaleUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 수퍼타임
// 수퍼리워드 조회 (All)
export const getSuperRewardAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 삭제
export const delSuperReward = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 등록
export const setSuperRewardRegist = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardRegist', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 수정
export const setSuperRewardUpdate = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardUpdate', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })

//// admin 계정 관리
// admin 계정 등록
export const addAdmin = (adminData) => axios(Server.getRestAPIHost() + '/admin/addAdmin', { method: "post", data:adminData, withCredentials: true, credentials: 'same-origin' })
// admin List 조회
export const getAdminList = () => axios(Server.getRestAPIHost() + '/admin/getAdminList' , { method:"get", withCredentials: true, credentials: 'same-origin' })
export const getAdmin = (email) => axios(Server.getRestAPIHost() + '/admin/getAdmin' , { method:"get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 소비자 탈퇴 처리
export const setConsumerStop = (data) => axios(Server.getRestAPIHost() + '/admin/setConsumerStop', { method:"put", data: data, withCredentials: true, credentials: 'same-origin' })

// DonAirdrops DON 에어드랍
export const getDonAirdrops = () => axios(Server.getRestAPIHost() + '/getDonAirdrops', { method: "get",  withCredentials: true, credentials: 'same-origin' })
export const getSwapManagerDonBalance = () => axios(Server.getRestAPIHost() + '/admin/managerDonBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const donTransferAdminOk = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/clickDonTransferAdminOk', { method: "post", params:{consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })
export const ircDonTransferAdminOk = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/clickIrcDonTransferAdminOk', { method: "post", params:{consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })

// DON Manager Balance, Igas
export const getBalanceOfManagerDon = () => axios(Server.getRestAPIHost() + '/admin/getBalanceOfManagerDon', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getManagerIGas = () => axios(Server.getRestAPIHost() + '/admin/getManagerIGas', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAllBlctToWonCachedLog = () => axios(Server.getRestAPIHost() + '/admin/blctToWonCachedLog', { method: "get", withCredentials: true, credentials: 'same-origin' })

// blct 통계페이지 조회용
export const getBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getBlctStats', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })
export const getMonthlyBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getMonthlyBlctStats', { method: "get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 tempProducerBlctManage 조회용
export const getAllTempProducerBlctMonth = (year, month) => axios(Server.getRestAPIHost() + '/admin/getAllTempProducerBlctMonth', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 구매확정 안된 orderSeq 수동 구매확정 (조건체크는 backend에서 함)
export const setOrderDetailConfirmBatchOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/admin/setOrderDetailConfirmBatchOrderSeq', {method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// blct 정산시 서포터즈 지급 BLCT 합계
export const getAllSupportersBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllSupportersBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 블리타임 리워드 BLCT 합계
export const getAllBlyTimeRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllBlyTimeRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 이벤트적립금 BLCT 합계
export const getAllEventRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllEventRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 쿠폰지급 BLCT 합계
export const getAllCouponBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllCouponBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// 입점관리 정보 조회
export const getProducerRegRequests = () => axios(Server.getRestAPIHost() + '/getProducerRegRequests', { method: "get", withCredentials: true, credentials: 'same-origin' })

//소비자 본인인증 내역 한건
export const getConsumerVerifyAuth = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerVerifyAuth', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 내역 조회
export const getConsumerKycList = ({kycAuth, consumerNo, year}) => axios(Server.getRestAPIHost() + '/admin/consumerKycList', { method: "get", params: {kycAuth: kycAuth, consumerNo: consumerNo, year:year}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 내역 한건
export const getConsumerKyc = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerKyc', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 처리
export const setConsumerKycAuth = ({consumerNo, kycAuth, kycReason}) => axios(Server.getRestAPIHost() + '/admin/consumerKycAuth', { method: "post", params: {consumerNo: consumerNo, kycAuth: kycAuth, kycReason: kycReason}, withCredentials: true, credentials: 'same-origin' })

// 모든 소비자 토큰총합 조회
export const getAllConsumerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllConsumerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 생산자 토큰총합 조회
export const getAllProducerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 예약상품 중 blct결제한 리스트
export const getReservedOrderByBlctPaid = () => axios(Server.getRestAPIHost() + '/admin/getReservedOrderByBlctPaid', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 배너 등록
export const setGoodsBannerSave = (goodsBannerList) => axios(Server.getRestAPIHost() + '/admin/goodsBannerSave', { method: "post", data: goodsBannerList, withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 리스트 조회
export const getGoodsBannerList = () => axios(Server.getRestAPIHost() + '/admin/goodsBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 정보 조회
export const getGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBanner', { method: "get", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })
//
export const delGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBannerDel', { method: "delete", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })

// 상품번호로 포텐타임쿠폰 지급상품인지 여부 조회
export const getPotenCouponMaster = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/potenCouponMaster', { method: "get", params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 목록
export const getCouponMasterList = () => axios(Server.getRestAPIHost() + '/admin/couponMasterList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 정보 (단건)
export const getCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "get", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 등록 및 수정
export const saveCouponMaster = (data) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 등록 및 수정(쿠폰명수정)
export const updateCouponMasterTitle = (data) => axios(Server.getRestAPIHost() + '/admin/couponMasterTltle', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 구매보상 발급대상 상품목록 수정
export const updateRewardCouponGoods = (data) => axios(Server.getRestAPIHost() + '/admin/rewardCouponGoods', { method: "post", data: data, withCredentials:true, credentials: 'same-origin'})
// 쿠폰 발급 내역 삭제
export const deleteCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 종료(삭제플래그처리)
export const endedCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMasterEnded', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 스페셜 쿠폰 발급
export const addSpecialCouponConsumer = (masterNo,consumerNo) => axios(Server.getRestAPIHost() + '/admin/specialCoupon', {method: "post", params:{masterNo:masterNo,consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 쿠폰발급내역
export const getConsumerCouponList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/admin/getConsumerCouponList', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 홈 공지 배너 등록
export const setHomeBannerSave = (homeBanner) => axios(Server.getRestAPIHost() + '/admin/homeBannerSave', { method: "post", data: homeBanner, withCredentials: true, credentials: 'same-origin'})
// 홈 공지 배너 리스트 조회
export const getHomeBannerList = () => axios(Server.getRestAPIHost() + '/admin/homeBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 홈 공지 배너 정보 조회
export const getHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBanner', { method: "get", params:{homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const delHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBannerDel', { method: "delete", params:{homeBannerId: homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const getAllTempProducer = (year, month) => axios(Server.getRestAPIHost() + "/admin/getAllTempProducer", { method: "get", params:{year: year, month:month}, withCredentials: true, credentials: 'same-origin' })

//고팍스 가입 이벤트 목록
export const getGoPaxJoinEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxJoinEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })

//고팍스 카드 이벤트 목록
export const getGoPaxCardEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxCardEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })

// 친구초대 관련 이벤트 리스트
export const getInviteFriendCountList = () => axios(Server.getRestAPIHost() + "/admin/getInviteFriendCountList", { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getInviteFriendList = () => axios(Server.getRestAPIHost() + "/admin/getInviteFriendList", { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getInviteFriendGoodsList = () => axios(Server.getRestAPIHost() + "/admin/getInviteFriendGoodsList", { method: "get", withCredentials: true, credentials: 'same-origin' })
export const runInviteFriendCountBatch = () => axios(Server.getRestAPIHost() + "/admin/runInviteFriendCountBatch", { method: "post", withCredentials: true, credentials: 'same-origin' })


export const getAbusers = () => axios(Server.getRestAPIHost() + '/admin/abusers', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

export const getAbuserByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/abuser', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

export const addAbuser = (abuser) => axios(Server.getRestAPIHost() + '/admin/abuser', { method: "post", data: abuser, withCredentials: true, credentials: 'same-origin' })

// 판매자 blct 정산 리스트
export const getAllProducerWithdrawBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerWithdrawBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

//소비자 토큰 히스토리 전체 내역
export const getConsumerTokenHistory = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerTokenHistory', { method: "post", data: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
export const requestAdminOkStatus = ({swapBlctToBlyNo, adminOkStatus, userMessage, adminMemo}) => axios(Server.getRestAPIHost() + '/admin/requestAdminOkStatus', { method: "post", data: {swapBlctToBlyNo, adminOkStatus, userMessage, adminMemo}, withCredentials: true, credentials: 'same-origin'})

// 소비자의 출금신청 배치처리로 등록
export const requestAdminOkStatusBatch = (swapBlctToBlyNo) => axios(Server.getRestAPIHost() + '/admin/requestAdminOkStatusBatch', { method: "post", data: {}, params: {swapBlctToBlyNo}, withCredentials: true, credentials: 'same-origin'})


// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
export const updateSwapBlctToBlyMemo = ({swapBlctToBlyNo, userMessage, adminMemo}) => axios(Server.getRestAPIHost() + '/admin/swapBlctToBlyMemo', { method: "post", data: {swapBlctToBlyNo, userMessage, adminMemo}, withCredentials: true, credentials: 'same-origin'})

//소비자 번호로 소비자정보 조회
export const getConsumerByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 카카오 폰번호 소비자찾기
export const getKakaoPhoneConsumer = (phone) => axios(Server.getRestAPIHost() + '/admin/kakaoPhoneConsumer', { method: "get",  params: {phone: phone}, withCredentials: true, credentials: 'same-origin' })

//소비자 주문내역 조회
export const getOrderDetailByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/orderDetail/consumerNo', { method: "get",  params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//상품 삭제(판매중단인 상품만 플래그 변경)
export const updateGoodsDeleteFlag = ({goodsNo, deleted}) => axios(Server.getRestAPIHost() + '/admin/goods/delete', { method: "post", params: {goodsNo, deleted}, withCredentials: true, credentials: 'same-origin' })
// 소비자 출금계좌 확인
export const checkExtOwnAccount = (consumerNo, extAccount) => axios(Server.getRestAPIHost() + '/admin/checkExtOwnAccount', {method: "post", params:{consumerNo:consumerNo,extAccount: extAccount}, withCredentials: true, credentials: 'same-origin' })
// 생산자 주문취소요청건 승인
export const confirmProducerCancel = (orderSeq) => axios(Server.getRestAPIHost() + '/admin/confirmProducerCancel', { method: "post", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소신청 조회
export const getAllProducerCancelList = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerCancelList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 소비자 정보 업데이트
export const updateConsumer = (consumer) => axios(Server.getRestAPIHost() + '/admin/updateConsumer', { method: "put", data: consumer, withCredentials: true, credentials: 'same-origin' })

export default {
// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
    getAllConsumers,

// 소비자 검색 (탈퇴자제외)
    getConsumerList,

//친구추천 카운트 조회
    getInviteFriendCount,

// 탈퇴한 소비자
    getStoppedConsumers,

// 추천인/친구 조회
    getRecommendFriends,

// 어뷰저리스트
    getConsumerAbusers,

//회원 수(탈퇴안한 수)
    getConsumerCount,

//회원 수(탈퇴한 수)
    getConsumerStopedCount,

//회원 수(휴면한 수)
    getConsumerDormancyCount,

//준회원 수(giftReceiver 수)
    getSemiConsumerCount,

// 모든 생산자 모든 회원 상품 문의
    producerGoodsQnaList,
    producerGoodsQnaStatusAllCount,

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
    getAllProducers,

// 생산자별 매출 정산 자료 조회
    getAllProducerPayoutList,

// 포텐타임 지원금 blct 월별 금액 조회
    getSupportPriceBlct,

// 생산자별 정산 check 자료 조회
    getProducerPaymentCheck,

// 정산시 체크 메모리스트 조회
    getPaymentCheckMemoList,

// 정산 메모 삭제
    delPaymentMemo,

// 생산자별 정산 주문내역 조회
    getPaymentProducer,

// 생산자별 매출 정산 상태를 db 에 기록
    setProducerPayoutStatus,
    transferTempProducerBlctToEzfarm,

// 모든 주문번호 가져오기
    getAllOrderDetailList,

// 주문 카드 오류 내 가져오기
    getAllOrderTempDetailList,

    getAllOrderStats,

    getAllGoodsSaleList,

    getAdminGoodsNoBuyReward,

    getAllGoodsNotEvent,

// 모든 상품정보 가져오기
    getAllGoods,

// 품절상품 조회
    getSoldOutGoods,

// 판매 일시중지 상품 조회
    getPausedGoods,

// 판매종료상품 조회
    getSaleEndGoods,

// consumerNo로 account 가져오기
    getNewAllocateSwapBlyAccount,

// email로 account 가져오기
    getConsumerAccountByEmail,

// 비밀번호 reset (abc1234!)
    resetPassword,


//택배사 조회(전체)
    getTransportCompany,

//택배사 조회(택배사 번호)
    getTransportCompanyByNo,

//택배사 조회(택배사 코드)
    getTransportCompanyByCode,

//택배사 등록 & 수정
    addTransportCompany,

//택배사 삭제
    delTransportCompany,

//택배사코드 중복여부 체크
    getIsDuplicatedTransportCode,

//품목 조회(전체)
    getItems,

//품목 조회(품목 번호)
    getItemByItemNo,

//품목 등록 & 수정
    addItem,

//품목 활성 or 비활성
    updateItemEnabled,

//itemKind(품종)코드 발췌.
    getNewItemKindCode,

//itemKind(품종)코드로 품명 조회
    getItemKindByCode,

// 상품 현재 가격 설정
    setCurrentPriceOfAllValidGoods,

// 미배송 배치 처리
    setNotDeliveryOrder,

// 생산자에게 발송 임박 상품 알림 처리
    sendWarnShippingStart,

// 미배송발생시 미배송 알림 테스트 (배치테스트)
    sendNotiDelayShipping,

// 공지사항 등록
    regNotice,

// 공지사항 조회
    getNoticeList,

// 공지사항 한건 조회
    getNoticeByNoticeNo,

// 공지사항 삭제
    delNoticeApi,

// 푸시알림 등록
    regPushNoti,

// 푸시알림 조회
    getPushNotiList,

// 푸시알림 한건 조회
    getPushNotiByPushNotiNo,

// 푸시알림 삭제
    delPushNoti,


// 이벤트 지급 목록
    getB2cEventPaymentList,

// 자동구매확정 배치 처리(B2C)
    setOrderDetailConfirm,


// 생산자의 BLCT구매 정산방법 변경
    changeProducerPayoutBlct,


// 생산자 수수료 등록 및 수정
    regProducerFeeRate,

// 생산자 수수료 목록
    getProducerFeeRate,

// 생산자별 개인 수수료 수정
    saveFeeRateToProducer,
// 생산자별 개인 수수료 수정 예약.
    reserveFeeRateToProducer,
// 생산자별 개인 수수료 수정 즉시 변.
    directFeeRateToProducer,

    setPayoutAmountBatch,
///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////

//B2B판매중 상팜
    getAllFoodsSaleList,

//B2B 품목 조회(전체)
    getB2bItems,
//B2B 품목 조회(품목 번호)
    getB2bItemByNo,
//B2B 품목 등록 & 수정
    addB2bItem,
//itemKind(품종)코드 발췌.
    getNewB2bItemKindCode,

//품목 활성 or 비활성
    updateB2bItemEnabled,
// 생산자별 매출 정산 상태를 db 에 기록
    setSellerPayoutStatus,

// 업체별 정산 체크정보 저장
    savePaymentCheck,
// 생산자별 매출 정산 자료 조회
    getAllSellerPayoutList,
// 모든 주문번호 가져오기
    getAllDealDetailList,
// 모든 상품정보 가져오기
    getAllFoods,
// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
    getAllBuyers,
// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
    getAllSellers,
//// b2c 홈 화면 구성
    getHomeSetting,
// 기획전 상품 번호 저장
    setHomeSetting,
    getExGoodsNoList,
// best deal 상품 조회
    getSpecialDealGoodsList,
// 오늘의 생산자 상품 조회
    getTodayProducerList,
// 배너 조회
    getBannerList,
//타입에 따른 이벤트 번호조회(type : blyTime, potenTime)
    getEventNoByType,
//// 이벤트 정보
// 이벤트 정보 목록
    getEventInfoList,
// 이벤트 정보 조회
    getEventInfo,
// 이벤트 저장
    setEventInfoSave,
// 이벤트 삭제
    delEventInfo,

//// b2c 기획전 관리
// 기획전 조회
    getMdPickList,
// 기획전 정보 조회
    getMdPick,
// 기획전 삭제
    delMdPick,
// 기획전 홈화면에숨김
    hideMdPick,
// 기획전 저장
    setMdPickSave,

////b2c 블리타임
// 블리타임 조회 (All)
    getBlyTimeAdminList,
// 블리타임 삭제
    delBlyTime,
// 블리타임 등록
    setBlyTimeRegist,
// 블리타임 수정
    setBlyTimeUpdate,

////b2c 포텐타임
// 포텐타임 조회 (All)
    getTimeSaleAdminList,
// 포텐타임 상품 조회 (단건) - 블리타임과수퍼리워드하고 동일하게 controller 호출함.
    getTimeSaleAdmin,
// 포텐타임 삭제
    delTimeSale,
// 포텐타임 등록
    setTimeSaleRegist,
// 포텐타임 수정
    setTimeSaleUpdate,
////b2c 수퍼타임
// 수퍼리워드 조회 (All)
    getSuperRewardAdminList,
// 수퍼리워드 삭제
    delSuperReward,
// 수퍼리워드 등록
    setSuperRewardRegist,
// 수퍼리워드 수정
    setSuperRewardUpdate,

//// admin 계정 관리
// admin 계정 등록
    addAdmin,
// admin List 조회
    getAdminList,
    getAdmin,

// 소비자 탈퇴 처리
    setConsumerStop,

// DonAirdrops DON 에어드랍
    getDonAirdrops,
    getSwapManagerDonBalance,
    donTransferAdminOk,
    ircDonTransferAdminOk,

// DON Manager Balance, Igas
    getBalanceOfManagerDon,
    getManagerIGas,

    getAllBlctToWonCachedLog,

// blct 통계페이지 조회용
    getBlctStats,
    getMonthlyBlctStats,

// blct 정산시 tempProducerBlctManage 조회용
    getAllTempProducerBlctMonth,

// 구매확정 안된 orderSeq 수동 구매확정 (조건체크는 backend에서 함)
    setOrderDetailConfirmBatchOrderSeq,
// blct 정산시 서포터즈 지급 BLCT 합계
    getAllSupportersBlct,
// blct 정산시 블리타임 리워드 BLCT 합계
    getAllBlyTimeRewardBlct,
// blct 정산시 이벤트적립금 BLCT 합계
    getAllEventRewardBlct,
// blct 정산시 쿠폰지급 BLCT 합계
    getAllCouponBlct,
// 입점관리 정보 조회
    getProducerRegRequests,
//소비자 본인인증 내역 한건
    getConsumerVerifyAuth,
//소비자 KYC 인증 내역 조회
    getConsumerKycList,
//소비자 KYC 인증 내역 한건
    getConsumerKyc,
//소비자 KYC 인증 처리
    setConsumerKycAuth,
// 모든 소비자 토큰총합 조회
    getAllConsumerToken,
// 모든 생산자 토큰총합 조회
    getAllProducerToken,
// 예약상품 중 blct결제한 리스트
    getReservedOrderByBlctPaid,
// 상품상세 공지 배너 등록
    setGoodsBannerSave,
// 상품상세 공지 리스트 조회
    getGoodsBannerList,
// 상품상세 공지 정보 조회
    getGoodsBanner,
//
    delGoodsBanner,

// 상품번호로 포텐타임쿠폰 지급상품인지 여부 조회
    getPotenCouponMaster,
// 쿠폰 발급 내역 목록
    getCouponMasterList,
// 쿠폰 발급 내역 정보 (단건)
    getCouponMaster,
// 쿠폰 발급 내역 등록 및 수정
    saveCouponMaster,
// 쿠폰 발급 내역 등록 및 수정(쿠폰명수정)
    updateCouponMasterTitle,
// 구매보상 발급대상 상품목록 수정
    updateRewardCouponGoods,
// 쿠폰 발급 내역 삭제
    deleteCouponMaster,
// 쿠폰 발급 내역 종료(삭제플래그처리)
    endedCouponMaster,
// 스페셜 쿠폰 발급
    addSpecialCouponConsumer,

// 소비자 쿠폰발급내역
    getConsumerCouponList,
// 홈 공지 배너 등록
    setHomeBannerSave,
// 홈 공지 배너 리스트 조회
    getHomeBannerList,
// 홈 공지 배너 정보 조회
    getHomeBanner,

    delHomeBanner,

    getAllTempProducer,

//고팍스 가입 이벤트 목록
    getGoPaxJoinEvent,

//고팍스 카드 이벤트 목록
    getGoPaxCardEvent,
// 친구초대 관련 이벤트 리스트
    getInviteFriendCountList,
    getInviteFriendList,
    getInviteFriendGoodsList,
    runInviteFriendCountBatch,


    getAbusers,
    getAbuserByConsumerNo,
    addAbuser,
// 판매자 blct 정산 리스트
    getAllProducerWithdrawBlct,
//소비자 토큰 히스토리 전체 내역
    getConsumerTokenHistory,
// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
    requestAdminOkStatus,
// 소비자의 출금신청 배치처리로 등록
    requestAdminOkStatusBatch,

// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
    updateSwapBlctToBlyMemo,
//소비자 번호로 소비자정보 조회
    getConsumerByConsumerNo,
// 카카오 폰번호 소비자찾기
    getKakaoPhoneConsumer,
//소비자 주문내역 조회
    getOrderDetailByConsumerNo,
//상품 삭제(판매중단인 상품만 플래그 변경)
    updateGoodsDeleteFlag,
// 소비자 출금계좌 확인
    checkExtOwnAccount,
// 생산자 주문취소요청건 승인
    confirmProducerCancel,

// 생산자 주문취소신청 조회
    getAllProducerCancelList,

// 소비자 정보 업데이트
    updateConsumer
}