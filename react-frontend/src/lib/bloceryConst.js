//배송비 정책 코드
export const TERMS_OF_DELIVERYFEE = {
    NO_FREE: 'NO_FREE',                     //무료배송 없음
    FREE: 'FREE',                           //무료배송
    GTE_FREE: 'GTE_FREE',                   //몇개이상 무료배송
    EACH_GROUP_COUNT: 'EACH_GROUP_COUNT',   //몇개당 배송비 부과
    GTE_PRICE_FREE: 'GTE_PRICE_FREE'        //몇원이상 무료배송
}

export const ProducerPayOutStatusEnum = {
    NotYet: 'NotYet',
    PendingBurnBls: 'PendingBurnBls',
    PendingTransfer: 'PendingTransfer',
    Complete: 'Complete'
}
