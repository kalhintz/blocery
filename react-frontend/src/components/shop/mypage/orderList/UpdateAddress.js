import React, { Fragment, Component } from 'react'
import { Container, Label, Row, Col, Input, InputGroup, FormGroup, Button,Modal } from 'reactstrap'
import { updateReceiverInfo } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
import DaumPostcode from 'react-daum-postcode';
export default class UpdateAddress extends Component {
    constructor(props) {
        super(props);

        this.state = {
            order: {
                orderSeq: this.props.orderSeq,
                receiverName: this.props.receiverName,
                receiverPhone: this.props.receiverPhone,
                receiverZipNo: this.props.receiverZipNo,
                receiverAddr: this.props.receiverAddr,
                receiverAddrDetail: this.props.receiverAddrDetail,
                deliveryMsg: this.props.deliveryMsg
            },

            modal: false
        }
    }

    // phone regex 체크
    checkPhoneRegex = (e) => {
        const order = Object.assign({}, this.state.order);
        order[e.target.name] = ComUtil.phoneRegexChange(e.target.value);
        this.setState({order})
    }

    // element 값 체인지될 때
    handleChange = (e) => {
        const order = Object.assign({}, this.state.order);
        order[e.target.name] = e.target.value;

        this.setState({order})
    }

    // 우편번호검색 팝업
    addressModalPopup = () => {
        this.setState({
            modal: true
        });
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    jusoModalOnChange = (data) => {

        let zipNo = data.zonecode;
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
            fullAddress = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
            fullAddress = data.jibunAddress;
        }

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        let v_address = fullAddress;

        const order = Object.assign({}, this.state.order);
        order.receiverZipNo = zipNo;
        order.receiverAddr = v_address;

        this.setState({
            order
        });

        this.modalToggle();
    }

    // 저장버튼 클릭
    saveAddress = async () => {
        const order = Object.assign({}, this.state.order);
        await updateReceiverInfo(order);

        this.props.onClose({
            ...order,
        })

    }

    render() {
        const order = this.state.order;

        if(!this.state.order)
            return null;

        return(
            <Fragment>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>받는 사람</Label>
                                <InputGroup>
                                    <Input name="receiverName" placeholder="받는 사람" value={order.receiverName || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>연락처(전화번호)</Label>
                                <InputGroup>
                                    <Input name="receiverPhone" placeholder="연락처" value={order.receiverPhone || ''}
                                       onChange={this.handleChange} maxLength={13}
                                       onBlur={this.checkPhoneRegex}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>주소</Label>
                                <InputGroup>
                                    <Input disabled name="receiverAddr" placeholder="[주소검색]을 클릭해 주세요" value={order.receiverAddr || ''} onChange={this.handleChange} />
                                    <Button outline color="secondary" onClick={this.addressModalPopup}>주소검색</Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Input name="receiverAddrDetail" placeholder="상세주소" value={order.receiverAddrDetail || ''}  onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>배송 메세지</Label>
                                <InputGroup>
                                    <Input name="deliveryMsg" value={order.deliveryMsg || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.saveAddress} disabled={order.receiverName && order.receiverPhone && order.receiverAddr && order.receiverAddrDetail ? false : true}>확인</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
                <div>
                    {/* 주소검색 모달 */}
                    <Modal isOpen={this.state.modal} toggle={this.modalToggle}>
                        <div style={{padding:0, height:'450px'}}>
                            <DaumPostcode
                                style={{height:'450px'}}
                                onComplete={this.jusoModalOnChange}
                            />
                        </div>
                    </Modal>
                </div>


            </Fragment>
        )
    }
}

