/** componentWillMount()에서 호출해야함
 this.tokenGethSC = new TokenGethSC();
 this.tokenGethSC.initContract('/BloceryTokenSC.json');
 **/


import axios from 'axios'
import { Server } from "~/components/Properties";

/**
 * BLCT 전송관련
 */


export const getManagerBlctBalance = () =>
     axios(Server.getRestAPIHost() + '/ont/getBalanceOfManagerBlct',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        );


// Logic Contract에서 Manager의 Blct 전송 (simple 관리자 용)
export const scOntTransferManagerBlct = (account, amount) =>
    axios(Server.getRestAPIHost() + '/ont/transferManagerBlct',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                receiverAccount: account,
                amount: amount
            }
        }
    )

//현재 BLCT 조회 ( -잠긴 금액 해서 가용 BLCT 리턴)
export const scOntGetBalanceOfBlct = (owner) =>
    axios(Server.getRestAPIHost() + '/ont/getBalanceOfBlct',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                account: owner
            }
        }
    );

//전체 BLCT, 가용 BLCT, 잠긴 BLCT 리턴
export const scOntGetBalanceOfBlctMypage = (owner) =>
    axios(Server.getRestAPIHost() + '/ont/getBalanceOfBlctMypage',
        {
            method: "get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                account: owner
            }
        }
    );

//현재 BLCT 조회 (생산자용)
export const scOntGetBalanceOfBlctProducer = (owner) =>
    axios(Server.getRestAPIHost() + '/ont/getBalanceOfBlctProducer',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                account: owner
            }
        }
    );

//현재 BLCT 조회 (Admin용)
export const scOntGetBalanceOfBlctAdmin = (owner) =>
    axios(Server.getRestAPIHost() + '/ont/getBalanceOfBlctAdmin',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                account: owner
            }
        }
    );

export const getBalanceOfBlctAllAdmin = (consumerNo) =>
    axios(Server.getRestAPIHost() + '/ont/getBalanceOfBlctAllAdmin',
        {
            method: "get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                consumerNo: consumerNo
            }
        }
    );

export const scOntUserSendBlctToManager = (account, amount) =>
    axios(Server.getRestAPIHost() + '/ont/sendBlctToManager',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                userAccount: account,
                amount: amount
            }
        }
    )

export const scOntManagerSendBlctToManager = (email, amount) =>
    axios(Server.getRestAPIHost() + '/ont/sendManagerToManager',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                email: email,
                amount: amount
            }
        }
    )

export const scOntTransferManagerBlctWithEvent = (eventTitle, eventSubTitle, consumerNo, amount, sendKakao, justHistory) =>
    axios(Server.getRestAPIHost() + '/ont/transferMangerTokenToMany',
        {
            method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                eventTitle: eventTitle,
                eventSubTitle: eventSubTitle,
                consumerNo: consumerNo,
                amount: amount,
                sendKakao: sendKakao,
                justHistory: justHistory
            }
        }
    );

// 여러 account에 manager의 토큰 전송하기 (코박 이벤트 지급용)
export const scOntTransferManagerBlctToManyAccounts = (accountList, amount) =>
    axios(Server.getRestAPIHost() + '/ont/scOntTransferManagerBlctToManyAccounts',
        {
            method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                accountList: accountList,
                amount: amount
            }
        }
    );

// 임시
export const scOntTransferUserBlctFromMany = (emailList, amount) =>
    axios(Server.getRestAPIHost() + '/ont/transferUserTokenFromMany',
        {
            method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                eventTitle: '',
                eventSubTitle: '',
                emailList: emailList,
                amount: amount
            }
        }
    );


/**
 * Logic관련
 */

export const scOntGetManagerOngBalance = () =>
    axios(Server.getRestAPIHost() +'/ont/checkManagerOngBalanceAndSendEmail',
        {
            method: "get",
            withCredentials: true,
            credentials: 'same-origin',
        }
    );

// 생산자 보증금 납부
export const scOntPayProducerDeposit = (goodsNo, amount) =>
    axios(Server.getRestAPIHost() + '/ont/payProducerDeposit',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                goodsNo: goodsNo,
                depositBlct: amount
            }
        }
    );


// 매니저에게 적립왼 총 위약금 조회
export const scOntGetManagerTotalDeposit = () =>
    axios(Server.getRestAPIHost() + '/ont/getManagerTotalDeposit',
        {   method: "get",
            withCredentials: true,
            credentials: 'same-origin'
        }
    );


// 소비자의 blct로 주문하기
export const scOntOrderGoodsBlct = (orderSeqNo, blctAmount, price, ordersParam) =>
    axios(Server.getRestAPIHost() + '/ont/orderGoodsBlct',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                orderSeqNo: orderSeqNo,
                blctAmount: blctAmount,
                price: price,
                orders: ordersParam
            }
        }
    );

// 무료쿠폰 주문 (blct 주문)
export const scOntOrderFreeCouponGoodsBlct = ({
                                        usedCouponNo,
                                        goodsNo,
                                        hopeDeliveryDate,
                                        deliveryFee,            //배송비
                                        additionalDeliveryFee,  //도서산간 지방 일 경우 들어오는 배송비

                                        gift,                   //선물여부
                                        senderName,             //보내는이
                                        giftMsg,                //선물메세지
                                        deliveryMsg,            //배송메세지
                                        receiverName,           //수령자
                                        receiverPhone,          //수령자연락처
                                        receiverZipNo,          //수령자우편번호
                                        receiverAddr,           //수령자주소
                                        receiverAddrDetail      //수령자주소상세
                                    }) =>
    axios(Server.getRestAPIHost() + '/ont/orderFreeCouponGoodsBlct',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                usedCouponNo,
                goodsNo,
                hopeDeliveryDate,
                deliveryFee,            //배송비
                additionalDeliveryFee,  //도서산간 지방 일 경우 들어오는 배송비

                gift,                   //선물여부
                senderName,             //보내는이
                giftMsg,                //선물메세지
                deliveryMsg,            //배송메세지
                receiverName,           //수령자
                receiverPhone,          //수령자연락처
                receiverZipNo,          //수령자우편번호
                receiverAddr,           //수령자주소
                receiverAddrDetail      //수령자주소상세
            }
        }
    );

// 주문취소
// export const scOntCancelOrderBlct = (orderSeq, goodsPriceBlct, cancelBlctFee, cancelFee, isNotDelivery) =>
//     axios(Server.getRestAPIHost() + '/ont/cancelOrderBlct',
//         {   method:"post",
//             withCredentials: true,
//             credentials: 'same-origin',
//             data: {
//                 orderSeqNo: orderSeq,
//                 cancelFee: cancelFee,
//                 isNotDelivery: isNotDelivery,
//                 goodsPriceBlct: goodsPriceBlct,
//                 cancelBlctFee: cancelBlctFee
//             }
//         }
//     );

export const scOntCancelOrderBlct = (data) =>
    axios(Server.getRestAPIHost() + '/ont/cancelOrderBlctWithDB',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: data
        }
    );

// 구매정산 (구매 보상이기에 카드결제와 BLCT 결제 동일하게 사용함)
export const scOntCalculateOrderBlct = (orderNo, orderPenalty, feeAndReward, orderPenaltyBlct, consumerRewardBlct, producerRewardBlct, orderDepositBlct) =>
    axios(Server.getRestAPIHost() + '/ont/calculateOrderBlct',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                orderSeqNo: orderNo,
                orderPenalty: orderPenalty,
                feeAndReward: feeAndReward,
                orderPenaltyBlct: orderPenaltyBlct,
                consumerRewardBlct: consumerRewardBlct,
                producerRewardBlct: producerRewardBlct,
                orderDepositBlct: orderDepositBlct
            }
        }
    );

// 리뷰보상
export const scOntRewardReviewBlct = (orderNo, reviewBlct) =>
    axios(Server.getRestAPIHost() + '/ont/rewardReviewBlct',
        {   method:"post",
            withCredentials: true,
            credentials: 'same-origin',
            data: {
                orderSeqNo: orderNo,
                reviewBlct: reviewBlct
            }
        }
    )

// 주문번호로 그 주문에 해당하는 소비자 토큰거래내역 조회
export const scOntGetConsumerBlctHistory = (orderSeq) =>
    axios(Server.getRestAPIHost() + '/ont/getConsumerBlctHistory',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                orderSeq: orderSeq
            }
        }
    );

// 주문번호로 해당하는 생산자 토큰거래내역 조회 (판매보상 및 미배송보증금)
export const scOntGetProducerOrderBlctHistory = (orderNo) =>
    axios(Server.getRestAPIHost() + '/ont/getProducerOrderBlctHistory',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                orderSeq: orderNo
            }
        }
    );

// 상품번호에 해당하는 생산자 토큰거래내역 조회 (미배송보증금)
export const scOntGetProducerGoodsBlctHistory = (goodsNo) =>
    axios(Server.getRestAPIHost() + '/ont/getProducerGoodsBlctHistory',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                goodsNo: goodsNo
            }
        }
    );

// 생산자별 BLS 총액
export const scOntGetProducerTotalBls = (producer) =>
    axios(Server.getRestAPIHost() + '/ont/getProducerTotalBls',
        {   method:"get",
            withCredentials: true,
            credentials: 'same-origin',
            params: {
                producerNo: producer
            }
        }
    );

// Blct 담보 Bls 발행금액의 총액 조회
export const scOntGetTotalBlsGuarantyBlct = () =>
    axios(Server.getRestAPIHost() + '/ont/getTotalBlsGuaranteedBlct',
        {   method: "get",
            withCredentials: true,
            credentials: 'same-origin'
        }
    );
