import React, {useState, useEffect, useRef} from 'react'
import { getUsableCouponList } from "~/lib/shopApi"
import Select from "react-select";
import ComUtil from "~/util/ComUtil";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import {Div, Span} from "~/styledComponents/shared/Layouts";
import styled from 'styled-components'
import {calcBlyToWon} from "~/lib/exchangeApi";

const StyledSelect = styled(Select)`        
    & > div {
        min-height: 60px;
    }
`
const Coupon = ({onChange, goodsBlyAmount, totalBlyAmount}) => {
    const [usableCoupons, setUsableCoupons] = useState()
    const [selectedCoupon, setSelectedCoupon] = useState()

    useEffect(() => {
        getUsableCoupon()
    }, [])

    // 사용가능한 쿠폰 리스트 조회
    const getUsableCoupon = async () => {
        const {data} = await getUsableCouponList();

        if (data) {
            const couponList = data.map(item => ({
                value: item.couponNo,
                label: <Div>
                    <Div >
                        <Span bold>
                            {
                                `${item.couponTitle} ${item.couponBlyAmount}BLY`
                            }
                        </Span>
                    </Div>
                    <Div fontSize={12}>
                        주문금액 {item.minOrderBlyAmount}BLY 이상 사용가능
                    </Div>
                </Div>,
                blyAmount: item.couponBlyAmount,
                minOrderBlyAmount: item.minOrderBlyAmount,
                isDisabled: item.minOrderBlyAmount > totalBlyAmount || item.couponBlyAmount > totalBlyAmount
            }));
            couponList.unshift({value:0, label:"사용안함", blyAmount:0})

            setUsableCoupons(couponList);
        }

    }

    const onChangeCoupon = (data) => {
        const coupon = Object.assign({}, selectedCoupon);

        coupon.couponNo = data.value;
        coupon.label = data.label;
        coupon.blyAmount = data.blyAmount;  //쿠폰 BLY
        coupon.minOrderBlyAmount = data.minOrderBlyAmount;

        onChange(coupon)

        setSelectedCoupon(coupon)
    }

    if (!usableCoupons) return null

    if (usableCoupons.length === 1) return <Div textAlign={'center'}>사용가능한 쿠폰이 없습니다.</Div>

    return (
        <StyledSelect
            name={'selectCoupon'}
            defaultValue={{ label: "사용안함", value: 0 }}
            options={usableCoupons}
            value={usableCoupons.find(item => item.value === usableCoupons.couponNo)}
            onChange={onChangeCoupon}
        />
    );
};

export default Coupon;
