import React, { Fragment, useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { getDealStatShippingCntBySellerNo } from '~/lib/b2bSellerApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const DealShipping = (props) => {
    const [loading, setLoading] = useState(false);
    const [shippingCnt, setShippingCnt] = useState(0);

    useEffect(() => {
        search()
    }, []);

    async function search() {

        setLoading(true);

        // 주문현황 - 결제완료 (최근1개월기준)
        const { status, data } = await getDealStatShippingCntBySellerNo();

        if(status === 200) {
            setShippingCnt(data);
        }

        setLoading(false);
    }

    return (
        <Fragment>
            {
                loading && <BlocerySpinner/>
            }
            <div className='mr-1 mb-1 text-white'>
                <Container>
                    <Row>
                        <Col xs={4} className='p-3 text-center d-flex justify-content-center align-items-center bg-secondary' style={{borderTopLeftRadius: 5, borderBottomLeftRadius: 5}}>
                            <FontAwesomeIcon icon={faTruck} size="3x"  />
                        </Col>
                        <Col xs={8} className='p-3 text-center bg-primary' style={{borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
                            <div className='f6'>배송중</div>
                            <div className='display-4 font-weight-bold'>{shippingCnt}</div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Fragment>
    )
}
export default DealShipping