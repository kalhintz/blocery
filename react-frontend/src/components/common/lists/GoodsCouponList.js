import React, {useEffect, useState} from 'react';
import {getGoodsCouponMasters} from '~/lib/shopApi'
import GoodsCouponCard from '../cards/GoodsCouponCard'
import {Div, Flex} from '~/styledComponents/shared'
import useFetch from "~/hooks/useFetch";

const GoodsCouponList = ({goodsNo}) => {

    const {data: coupons, loading } = useFetch(getGoodsCouponMasters, goodsNo)

    if (loading) return null

    return(
        <Flex flexDirection={'column'} alignItems={'center'} py={20}>
            {
                coupons.map((coupon, index) =>
                    <Div mb={10} key={`coupon${index}`}>
                        <GoodsCouponCard
                            title={coupon.couponTitle}
                            couponBly={coupon.couponBlyAmount}
                            minOrderBly={coupon.minOrderBlyAmount}
                        />
                    </Div>
                )
            }
            {
                (coupons.length > 0) &&
                <Div mt={10} fontSize={12} fg={'secondary'}>상품 구입 후 구매확정시 지급되며 단일상품 결제시 사용가능합니다.</Div>
            }
        </Flex>
    )
}

export default GoodsCouponList;
