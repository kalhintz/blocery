import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from '../../../util/ComUtil'

import styled from 'styled-components'
import { Div, Span, Img, Flex, Right, Hr, Fixed } from '~/styledComponents/shared/Layouts'
import { HrThin } from '~/styledComponents/mixedIn'

const Price = styled(Div)`
    flex-grow: 1;
    text-align: right;
`;

//결제내역 컨텐츠
const CartSummary = (props) => {

    const { totGoodsPrice, totDirectDeliveryFee, totReservationDeliveryFee } = props


    return (
        <Fragment>
            <Div bg={'white'} p={16} fontWeight={'normal'}>
                <Flex p={1} fontSize={12}>
                    <Div textAlign={'left'} fg={'dark'}>총 상품가격</Div>
                    <Price>{ComUtil.addCommas(totGoodsPrice)} 원</Price>
                </Flex>
                <Flex p={1} fontSize={12}>
                    <Div textAlign={'left'} fg={'dark'}>총 배송비</Div>
                    <Price>+ {ComUtil.addCommas(totDirectDeliveryFee + totReservationDeliveryFee)} 원</Price>
                </Flex>
                <HrThin mt={15} mb={16} />
                <Flex p={1} bold fontSize={16}>
                    <Div textAlign={'left'}>총 결제금액</Div>
                    <Price>{ComUtil.addCommas(totGoodsPrice + totDirectDeliveryFee + totReservationDeliveryFee)} 원</Price>
                </Flex>
            </Div>

        </Fragment>
    )
}

CartSummary.propTypes = {
    sumGoodsPrice: PropTypes.number.isRequired,
    sumDeliveryFee: PropTypes.number.isRequired,
}
CartSummary.defaultProps = {
    sumGoodsPrice: 0,
    sumDeliveryFee: 0
}
export default CartSummary