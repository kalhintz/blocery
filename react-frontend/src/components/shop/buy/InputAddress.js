import React, { Fragment, Component } from 'react'
import { Container, Label, Row, Col, Input, InputGroup, FormGroup, Button,Modal } from 'reactstrap'
import { updateDeliverInfo } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'

import DaumPostcode from 'react-daum-postcode';

export default class InputAddress extends Component {
    constructor(props) {
        super(props);

        this.state = {

            consumer: {
                consumerNo: this.props.consumerNo,
                //receiverName: this.props.receiverName,
                //phone: this.props.receiverPhone,          //receiverName과 phone은 consumer 콜렉션에 기본배송지정보로 저장 안함
                zipNo: this.props.receiverZipNo,
                addr: this.props.receiverAddr,
                addrDetail: this.props.receiverAddrDetail
            },

            receiverName: this.props.receiverName,
            phone: this.props.receiverPhone,
            isCheckedDefault: false,
            modal:false //주소검색 모달
        }
    }

    // phone regex 체크
    checkPhoneRegex = (e) => {
        this.setState({
            [e.target.name]: ComUtil.phoneRegexChange(e.target.value)
        })
    }

    // element 값 체인지될 때
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    consumer_handleChange = (e) => {
        const consumer = Object.assign({}, this.state.consumer)
        consumer[e.target.name] = e.target.value
        this.setState({
            consumer
        })
    }


    //우편번호검색 팝업 //////////////////////////////////////////
    addressModalPopup = () => {
        this.setState({
            modal:true //주소검색창 오픈.
        });
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    // 주소 검색 결과 값 리턴 콜백
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


        const consumer = Object.assign({}, this.state.consumer);
        consumer.zipNo = zipNo;
        consumer.addr = v_address;

        this.setState({
            consumer
        });

        this.modalToggle();
    }
    /////////////////////////팝업END///////////////////////////


    // 기본배송지 저장 체크 유무
    // true면 order, consumer 테이블의 addr, phone 필드값 수정. false면 order 테이블의 addr에만 저장
    onCheckDefaultDeliver = (e) => {
        this.setState({
            isCheckedDefault: e.target.checked
        })
    }

    // 저장버튼 클릭
    saveAddress = async () => {
        const consumer = Object.assign({}, this.state.consumer)

        const name = this.state.receiverName
        const phone = this.state.phone
        // consumer.addr = deliverInfo.addr + '  ' + deliverInfo.addr2; //기본주소와 상세주소는 space두칸으로 분리.

        if (this.state.isCheckedDefault) {  // true-consumer 테이블에 저장, false-consumer에 저장은 안 하고 input value만 buy화면으로 넘김
            await updateDeliverInfo(consumer);
        }

        // this.setState({
        //     name: deliverInfo.name,
        //     phone: deliverInfo.phone,
        //     addr: deliverInfo.addr,
        //     //addr2: deliverInfo.addr2,
        //     zipNo: deliverInfo.zipNo
        // })

        // alert('저장이 완료되었습니다')
        // Webview.closePopup(deliverInfo)
        this.props.onClose({
            ...consumer,
            name,
            phone
        })

    }

    render() {
        const consumer = this.state.consumer;

        if(!this.state.consumer)
            return null;

        return(
            <Fragment>
                {/*<ShopXButtonNav close>배송지 입력</ShopXButtonNav>*/}
                <Container>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>받는 사람</Label>
                                <InputGroup>
                                    <Input name="receiverName" placeholder="받는 사람" value={this.state.receiverName || ''} onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>연락처(전화번호)</Label>
                                <InputGroup>
                                    <Input name="phone" placeholder="연락처" value={this.state.phone || ''}
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
                                    <Input disabled name="addr" placeholder="[주소검색]을 클릭해 주세요" value={consumer.addr || ''} onChange={this.consumer_handleChange} />
                                    <Button outline color="secondary" onClick={this.addressModalPopup}>주소검색</Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Input name="addrDetail" placeholder="상세주소" value={consumer.addrDetail || ''}  onChange={this.consumer_handleChange} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <FormGroup check>
                                <Label check>
                                    <Input type="checkbox" onChange={this.onCheckDefaultDeliver} />기본배송지로 저장
                                </Label>
                            </FormGroup>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.saveAddress} disabled={(this.state.receiverName && this.state.phone && consumer.addr && consumer.addrDetail) ? false : true}>확인</Button>
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