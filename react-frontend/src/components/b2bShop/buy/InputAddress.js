import React, { Fragment, Component } from 'react'
import { Container, Label, Row, Col, Input, InputGroup, FormGroup, Button,Modal, ModalHeader, ModalBody, ModalFooter, Table, Form, Badge } from 'reactstrap'
import { updateDeliverInfo } from '../../../lib/b2bShopApi'
import { Webview } from '../../../lib/webviewApi'
import Style from './Style.module.scss'
import { B2bShopXButtonNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import axios from 'axios'



const style = {
    cell: {
        padding: 0,
        margin: 0
    }
}

export default class InputAddress extends Component {
    constructor(props) {
        super(props);

        console.log('props : ', this.props);

        this.state = {

            buyer: {
                buyerNo: this.props.buyerNo,
                //receiverName: this.props.receiverName,
                //phone: this.props.receiverPhone,          //receiverName과 phone은 buyer 콜렉션에 기본배송지정보로 저장 안함
                zipNo: this.props.receiverZipNo,
                addr: this.props.receiverAddr,
                addrDetail: this.props.receiverAddrDetail
            },

            receiverName: this.props.receiverName,
            phone: this.props.receiverPhone,
            isCheckedDefault: false,
            modal:false,  //주소검색 모달
            inputAddress: false,
            totalCount: '', //검색건수text
            results:[] //[{zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}, {zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}]
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

    buyer_handleChange = (e) => {
        const buyer = Object.assign({}, this.state.buyer)
        buyer[e.target.name] = e.target.value
        this.setState({
            buyer
        })
    }


    //우편번호검색 팝업 //////////////////////////////////////////
    addressModalPopup = () => {
        this.setState({
            modal:true //주소검색창 오픈.
        });
    }

    searchAPIcall = async () => {
        //공공주소 open API
        let query = this.state.buyer.inputAddress;
        let bodyFormData = new FormData();

        console.log('query:'+query);

        bodyFormData.set('currentPage','1');
        bodyFormData.set('countPerPage','100');
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey','U01TX0FVVEgyMDE5MDQyNjEzMDEwNjEwODY4Mjc='); //이지팜 키.
        bodyFormData.set('keyword', query);


        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrLinkApiJsonp.do', { method: "post",
            data: bodyFormData,
            config: {
                headers: {
                    dataType:'jasonp',
                    crossDomain: true
                }
            }
        });

        //괄호 제거
        let jsonResults = JSON.parse(allResults.substring(1, allResults.lastIndexOf(')')));

        let totalCount = jsonResults.results.common.totalCount;
        console.log(jsonResults.results);

        // let totalCountText = '검색결과:' + totalCount+'건';
        // if (totalCount > 100) totalCountText += ' (100건 초과 - 필요시 재검색 요망)';

        // this.setState({
        //
        // })

        const juso = jsonResults.results.juso || []

        //console.log(jsonResults.results.juso);
        let results = juso.map( (row,i) => {
                return {zipNo: row.zipNo, roadAddrPart1: row.roadAddrPart1};
            }
        );

        console.log('results:',results);
        this.setState({
            totalCount: totalCount,
            results:results
        });

    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    addressSelected = (row) => {
        const buyer = Object.assign({}, this.state.buyer)
        buyer.addr = row.roadAddrPart1
        buyer.zipNo = row.zipNo

        this.setState({
            buyer
        })

        // this.setState(prevState => ({
        //     receiverAddr: prevState.results[i].roadAddrPart1,
        //     zipNo: prevState.results[i].zipNo
        // }));
        //
        this.modalToggle();
    }
    /////////////////////////팝업END///////////////////////////


    // 기본배송지 저장 체크 유무
    // true면 order, buyer 테이블의 addr, phone 필드값 수정. false면 order 테이블의 addr에만 저장
    onCheckDefaultDeliver = (e) => {
        this.setState({
            isCheckedDefault: e.target.checked
        })
    }

    // 저장버튼 클릭
    saveAddress = async () => {
        const buyer = Object.assign({}, this.state.buyer)

        const name = this.state.receiverName
        const phone = this.state.phone
        // buyer.addr = deliverInfo.addr + '  ' + deliverInfo.addr2; //기본주소와 상세주소는 space두칸으로 분리.

        if (this.state.isCheckedDefault) {  // true-buyer 테이블에 저장, false-buyer에 저장은 안 하고 input value만 buy화면으로 넘김
            await updateDeliverInfo(buyer);
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
            ...buyer,
            name,
            phone
        })

    }

    render() {
        const buyer = this.state.buyer

        if(!this.state.buyer)
            return null

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
                                    <Input disabled name="addr" placeholder="[주소검색]을 클릭해 주세요" value={buyer.addr || ''} onChange={this.buyer_handleChange} />
                                    <Button outline color="secondary" onClick={this.addressModalPopup}>주소검색</Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Input name="addrDetail" placeholder="상세주소" value={buyer.addrDetail || ''}  onChange={this.buyer_handleChange} />
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
                                <Button block color={'primary'} onClick={this.saveAddress} disabled={(this.state.receiverName && this.state.phone && buyer.addr && buyer.addrDetail) ? false : true}>확인</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
                <div>
                    {/* 주소검색 모달 */}
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.modalToggle}> 주소 검색 </ModalHeader>
                        <ModalBody>
                            <Container fluid>
                                <Row>
                                    <Col xs={9} style={style.cell}>
                                        <Input name="inputAddress" type="text" placeholder="도로명 주소 입력" onChange={this.buyer_handleChange}/>
                                    </Col>
                                    <Col xs={3} style={style.cell}>
                                        {' '}<Button block outline color="secondary" onClick={this.searchAPIcall}>검색</Button>
                                    </Col>
                                </Row>
                                <p/>
                                {
                                    this.state.results.length <= 0 && (
                                        <p className="text-muted text-center">검색된 내용이 없습니다</p>
                                    )
                                }
                                {
                                    this.state.results.length > 0 && (
                                        <Row>
                                            <Col xs={12} style={style.cell}>
                                                <small className="text-muted">검색결과 : <Badge color={'warning'}>{this.state.totalCount}</Badge> 건{this.state.totalCount >100 && '(100건 초과 - 필요시 재검색 요망)'}</small>
                                                <Table size={'sm'}>
                                                    <thead>
                                                    <tr>
                                                        <th style={{width:52}}><small>우편번호</small></th>
                                                        <th><small>도로명 주소</small></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        this.state.results.map((row, i) => {
                                                            return(
                                                                <tr>
                                                                    <td><small>{row.zipNo} </small></td>
                                                                    <td className="text-primary" onClick={() => this.addressSelected(row)}>{row.roadAddrPart1}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    }
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>
                                    )
                                }

                            </Container>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                        </ModalFooter>
                    </Modal>
                </div>



            </Fragment>
        )
    }


}