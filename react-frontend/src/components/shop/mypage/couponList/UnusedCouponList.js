import React from 'react'
import { Div, Hr } from '~/styledComponents/shared'
import { FaTicketAlt } from 'react-icons/fa'

import CouponCard from '~/components/common/cards/CouponCard'

const UnusedCouponList = ({data: usableCoupons}) => {

    if (!usableCoupons) return null

    return (
        <Div p={20}>
            {
                usableCoupons.length > 0 ? (
                    <Div>
                        {
                            usableCoupons.map((item, index) => <CouponCard key={'coupon'+index} coupon={item} isExpired={false} />)
                        }
                    </Div>
                ) : (
                    <Div textAlign={'center'}>
                        <FaTicketAlt className={'ml-auto text-secondary'} size={50}/>
                        <Div mb={30}>사용 가능한 쿠폰이 없습니다.</Div>
                        <Hr/>
                    </Div>
                )
            }

            <Div mt={30}>
                <Div mb={10}><b>* 쿠폰 유의사항</b></Div>
                <Div fontSize={12} lineHeight={22}>
                    {/*- 모든 쿠폰은 마켓블리 회원만 사용가능합니다.<br/>*/}
                    {/*- 쿠폰에 따라 최소 결제 금액이나 최대 할인금액 제한이 있을 수 있습니다.<br/>*/}
                    - BLY 시세에 따라 쿠폰의 원화 가치가 달라질 수 있습니다.<br/>
                    - 쿠폰은 단일 상품 결제시 사용 가능합니다.<br/>
                    {/*- 상품 1회 결제시 쿠폰 1장만 사용 가능합니다.<br/>*/}
                    - 쿠폰을 사용해도 구매에 따른 보상금(리워드)이 지급됩니다.<br/>
                    - 쿠폰에 따라 적용되는 상품(즉시상품, 예약상품 등)이 다를 수 있습니다.<br/>
                    - 이벤트, 기획전, 타임세일 등 일부 상품에 쿠폰 사용 제한이 있을 수 있습니다.<br/>
                    - 사용기간이 지난 쿠폰은 자동 소멸됩니다.<br/>
                    - 적립형 쿠폰은 BLY쿠폰으로, 상품정보 화면에 표기된 원화의 근사치로 지급됩니다.<br/>
                    - 결제 취소 시 사용하신 쿠폰은 복원되지 않습니다.<br/>
                    (단, 생산자 주문 취소에 한해서만 동일한 BLY쿠폰이 재발급됩니다.)<br/>
                </Div>
            </Div>
        </Div>

    )

}
export default UnusedCouponList