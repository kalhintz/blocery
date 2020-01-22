import ComUtil from '../util/ComUtil'
import axios from 'axios'
import { Server } from "../components/Properties";

/* 향후 환전관련 추가예정 */

export const BLCT_TO_WON = () => axios(Server.getRestAPIHost() + '/ont/blctToWon', { method: "get", withCredentials: true, credentials: 'same-origin' }); //won

export const CREDIT_COMMISSION = 0.035;   // 신용카드 수수료 3.5% (3.102% + 부가세 10%)
export const ORDER_DEPOSIT = 0.1;           // 주문시 미배송보증금인데 현재는 개수비례로 하고있어서 사용 안함
export const ORDER_BLOCERY_ONLY_FEE = 0.01;      // blocery fee
export const ORDER_CONSUMER_REWARD = 0.0048;  // 소비자 구매보상 0.48%
export const ORDER_PRODUCER_REWARD = 0.0002;  // 생산자 판매보상 0.02%

export const GOODS_TOTAL_DEPOSIT_RATE = 0.1;  // 생산자 물품등록시 전체 보증금 비율

export const CANCEL_FEE_13TO5 = 3; //배송시작일 14~10일전 취소수수료 단위%
export const CANCEL_FEE_4TO3 = 5;  //배송시작일 9~6일전
export const CANCEL_FEE_2TO1 = 7;  //배송시작일 5~2일전
export const CANCEL_FEE_MAX = 10;   //배송시작일 1일전~배송시작일 이후 MAX 취소수수료 단위%


////B2B_ADDED//////////////////
export const B2B_DEAL_BLOCERY_ONLY_FEE = 0.00;      // blocery fee

/**
 * param 원
 * returns BLCT
 */
export const exchangeWon2BLCT = async (won) =>  {
    let {data:blctToWon} = await BLCT_TO_WON();
    return ComUtil.roundDown(won/blctToWon, 2);          //BLCT 소수점 2자리까지로 잘라서 버리기
}

export const exchangeWon2BLCTComma = async (won) =>  {
    const wonToBlct = await exchangeWon2BLCT(won)
    return ComUtil.addCommas(wonToBlct);     //toLocaleString
}

export const exchangeBLCT2Won = async (blct) =>  {
    let {data:blctToWon} = await BLCT_TO_WON();
    return ComUtil.roundDown(blct * blctToWon, 0); //BLCT 원화로 변환 (원단위 미만 버림)
}