import React, { useState } from 'react';
import { Col, Input, Container, Row, Label } from 'reactstrap';

const BuyerKinds = (props) => {

    const [buyerKinds, setBuyerKinds] = useState( (null !== props.selectedInfo) && (typeof props.selectedInfo !== "undefined") ? props.selectedInfo : [] );

    const onCheckBoxChange = (i, e) => {
        const elChecked = e.target.checked;
        if(elChecked) {
            let checkedCount = buyerKinds.length;
            if (checkedCount >= props.limitSelected) {
                alert('최대 선택개수를 초과하였습니다.');
                e.target.checked = false;
                return;
            }
        }

        const index = buyerKinds.indexOf(props.data[i]);
        let tempBuyerKinds = Object.assign([], buyerKinds);
        if(index < 0) {
            tempBuyerKinds.push(props.data[i]);
        } else {
            tempBuyerKinds.splice(index, 1)
        }

        setBuyerKinds(tempBuyerKinds)

        props.onClickCheck(tempBuyerKinds);
    }

    return (
        <Container>
            <Row>
                {
                    props.data.map((kind, index) => {
                        return (
                            <Col xs={6} md={3} key={index}>
                                <span className={'m-2'}>
                                    <Input id={'kinds'+index} type="checkbox" name={kind} onChange={onCheckBoxChange.bind(this, index)} checked={buyerKinds.indexOf(kind) > -1} />
                                    <Label for={'kinds'+index}>{kind}{' '}</Label>
                                </span>
                            </Col>

                        )
                    })
                }
            </Row>
        </Container>
    )
}

export default BuyerKinds