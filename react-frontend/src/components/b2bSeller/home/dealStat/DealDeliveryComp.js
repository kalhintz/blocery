import React, { Fragment, useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { getDealStatDeliveryCompCntBySellerNo } from '~/lib/b2bSellerApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DealDeliveryComp = (props) => {
    const [loading, setLoading] = useState(false);
    const [deliveryCompCnt, setDeliveryCompCnt] = useState(0);

    useEffect(() => {
        search()
    }, []);

    async function search() {

        setLoading(true);

        // 주문현황 결제완료 최근개월기준
        const { status, data } = await getDealStatDeliveryCompCntBySellerNo();

        if(status === 200) {
            setDeliveryCompCnt(data);
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
                            <FontAwesomeIcon icon={faBox} size="3x"  />
                        </Col>
                        <Col xs={8} className='p-3 text-center bg-primary' style={{borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
                            <div className='f6'>배송완료</div>
                            <div className='display-4 font-weight-bold'>{deliveryCompCnt}</div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Fragment>
    )
}
export default DealDeliveryComp