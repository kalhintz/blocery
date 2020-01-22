import React, { Fragment, useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { getOrderStatOrderConfirmOkCntByProducerNo } from '~/lib/producerApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'
import { faSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const OrderConfirmOk = (props) => {
    const [loading, setLoading] = useState(false);
    const [OrderConfirmOkCnt, setOrderConfirmOkCnt] = useState(0);

    useEffect(() => {
        search()
    }, []);

    async function search() {

        setLoading(true);

        // 주문현황 결제완료 최근개월기준
        const { status, data } = await getOrderStatOrderConfirmOkCntByProducerNo();

        if(status === 200) {
            setOrderConfirmOkCnt(data);
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
                            <FontAwesomeIcon icon={faSignature} size="3x"  />
                        </Col>
                        <Col xs={8} className='p-3 text-center bg-info' style={{borderTopRightRadius: 5, borderBottomRightRadius: 5}}>
                            <div className='f6'>구매확정</div>
                            <div className='display-4 font-weight-bold'>{OrderConfirmOkCnt}</div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Fragment>
    )
}
export default OrderConfirmOk