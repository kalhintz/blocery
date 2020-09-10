import React, {Fragment, Component} from 'react';
import {Col, Button, FormGroup, Label, Input, Container, Table, Badge, Row, Modal, ModalBody, ModalFooter, ModalHeader, InputGroup, InputGroupAddon} from 'reactstrap'
import axios from 'axios'
import { getBuyerByBuyerNo, updateBuyerInfo, updateDeliverInfo, putAddress } from "~/lib/b2bShopApi";
import { JusoSearch } from '~/components/common'
import {B2bShopXButtonNav} from '../../../common/index'
import ComUtil from '~/util/ComUtil'
import {Webview} from "~/lib/webviewApi";
import TextCss from "~/styles/Text.module.scss"

export default class AddressModify extends Component {
    constructor(props){
        super(props);
        this.state = {
            buyerNo: 0,
            addresses: [],
            addrName: '',
            receiverName: '',
            phone: '',
            addr: '',
            addrDetail: '',
            zipNo: '',
            modal: false,
            isCheckedDefault: false,            // 기본배송지로 저장 체크 유무
            addressIndex: null,          // null이면 신규추가, 값이 있으면 수정
            flag: ''                     // flag(order:주문에서 화면전환, mypage:마이페이지에서 전환)
        }
    }

    componentDidMount() {
        let buyerNo, index, flag

        if(this.props.location){
            const params = new URLSearchParams(this.props.location.search)
            buyerNo = params.get('buyerNo')
            index = params.get('index')
            flag = params.get('flag')
        }else{
            buyerNo = this.props.buyerNo
            index = this.props.index
            flag = this.props.flag
        }

        this.setState({ flag: flag })

        this.setState({
            addressIndex: index
        })

        this.search(buyerNo)
    }

    search = async (buyerNo) => {
        const buyerInfo = await getBuyerByBuyerNo(buyerNo)

        this.setState({
            buyerNo: buyerNo,
            addresses: buyerInfo.data.buyerAddresses
        })

        if(this.state.addressIndex !== null) {       // addressIndex가 있으면 수정모드
            const modifyAddress = buyerInfo.data.buyerAddresses[this.state.addressIndex]
            this.setState({
                addrName: modifyAddress.addrName,
                receiverName: modifyAddress.receiverName,
                phone: modifyAddress.phone,
                addr: modifyAddress.addr,
                addrDetail: modifyAddress.addrDetail,
                zipNo: modifyAddress.zipNo
            })
            if(modifyAddress.basicAddress === 1) {
                this.setState({ isCheckedDefault: true })
            }
        }
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 전화번호 정규식 체크
    checkPhoneRegex = (e) => {
        this.setState({
            [e.target.name]: ComUtil.phoneRegexChange(e.target.value)
        })
    }

    // 주소검색 클릭
    addressModalPopup = () => {
        this.setState({ modal: true })
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    jusoModalOnChange = (obj) => {

        this.setState({
            addr: obj.address,
            zipNo: obj.zipNo
        });

        this.modalToggle();
    }

    // 기본배송지 저장 체크 유무
    // true면 order, consumer 테이블의 addr, phone 필드값 수정. false면 order 테이블의 addr에만 저장
    onCheckDefaultDeliver = (e) => {
        this.setState({
            isCheckedDefault: e.target.checked
        })
    }

    // 주소 저장버튼 클릭
    onClickOk = async () => {
        const state = Object.assign({}, this.state)
        if(state.addrName == '' || state.receiverName == '' || state.addr == '' || state.addrDetail == '' || state.phone == '' || state.zipNo == '') {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }

        let data = {};
        let modifiedAddress = {};
        const index = this.state.addressIndex
        if (index !== null) {    // 배송지 수정일때.
            this.state.addresses[index].addrName = this.state.addrName;
            this.state.addresses[index].receiverName = this.state.receiverName;
            this.state.addresses[index].phone = this.state.phone;
            this.state.addresses[index].addr = this.state.addr;
            this.state.addresses[index].addrDetail = this.state.addrDetail;
            this.state.addresses[index].zipNo = this.state.zipNo;

            modifiedAddress = Object.assign({
                addrName: this.state.addresses[index].addrName,
                receiverName: this.state.addresses[index].receiverName,
                phone: this.state.addresses[index].phone,
                addr: this.state.addresses[index].addr,
                addrDetail: this.state.addresses[index].addrDetail,
                zipNo: this.state.addresses[index].zipNo
            })
        } else {
            data.addrName = this.state.addrName;
            data.receiverName = this.state.receiverName;
            data.phone = this.state.phone;
            data.addr = this.state.addr;
            data.addrDetail = this.state.addrDetail;
            data.zipNo = this.state.zipNo;
            if (this.state.addresses.length === 0) {
                data.basicAddress = 1
            } else {
                data.basicAddress = 0
            }
            modifiedAddress = Object.assign(data)
        }

        if (this.state.isCheckedDefault) {                  // 기본배송지로 저장 체크O
            if (this.state.addressIndex !== null) {         // 배송지 수정일 때
                for (var i = 0; i < this.state.addresses.length; i++) {
                    this.state.addresses[i].basicAddress = 0
                }
                this.state.addresses[index].basicAddress = 1
            } else {
                for (var i = 0; i < this.state.addresses.length; i++) {
                    this.state.addresses[i].basicAddress = 0
                }
                data.basicAddress = 1
            }
        } else {                                            // 기본배송지로 저장 체크X
            if (this.state.addressIndex !== null) {         // 배송지 수정일 때
                if (this.state.addresses.length <= 0) {
                    this.state.addresses[index].basicAddress = 1
                } else {
                    this.state.addresses[index].basicAddress = 0
                }
            } else {
                if (this.state.addresses.length <= 0) {
                    data.basicAddress = 1
                } else {
                    data.basicAddress = 0
                }
            }
        }

        let addresses = Object.assign([], this.state.addresses);
        if(this.state.addressIndex === null)        // 추가일 때만 push
            addresses.push(data)

        this.setState({
            addresses: addresses
        })

        let modified = await putAddress(addresses)

        if (modified.data === 1) {
            alert('배송지 정보 저장이 완료되었습니다.')
            if(this.state.flag === 'order') {
                this.props.onClose({
                    ...modifiedAddress
                })
            } else {
                this.props.history.goBack();
            }
        } else {
            alert('배송지 정보 저장 실패. 다시 시도해주세요.')
            return false;
        }
    }

    onDelete = async () => {
        const index = this.state.addressIndex

        let addresses = Object.assign([], this.state.addresses);
        addresses.splice(index, 1);

        let deleted = await putAddress(addresses)

        if(deleted.data === 1) {
            alert('배송지 정보 삭제가 완료되었습니다.')
            this.props.history.goBack();
        } else {
            alert('배송지 정보 삭제 실패. 다시 시도해주세요.')
            return false;
        }

    }

    render() {
        return (
            <Fragment>
                {
                    this.state.flag === 'mypage' && <B2bShopXButtonNav history={this.props.history} >배송지 추가/수정</B2bShopXButtonNav>
                }
                <div className={TextCss.textUnderlineWrap}>
                <Container fluid>
                    <Row>
                        <Col xs={12} className={'pt-2 pb-2'}>
                            <div className={'mb-3'}>
                                <Label className={'small'}>배송지 이름</Label>
                                <Input name="addrName" value={this.state.addrName} onChange={this.handleChange} />
                            </div>
                            <div className={'mb-3'}>
                                <Label className={'small'}>받는 사람</Label>
                                <Input name="receiverName" value={this.state.receiverName} onChange={this.handleChange} />
                            </div>
                            <div className={'mb-3'}>
                                <Label className={'small'}>연락처</Label>
                                <Input name="phone" value={this.state.phone || ''} onChange={this.handleChange} onBlur={this.checkPhoneRegex} maxLength={13} />
                            </div>
                            <div className={'mb-3'}>
                                <Label className={'small'}>주소</Label>
                                <div className={'mb-2'}>
                                    <InputGroup>
                                        <Input disabled name="addr" value={this.state.addr} placeholder=" [주소검색]을 클릭해 주세요" />
                                        <InputGroupAddon addonType="prepend">
                                            <Button outline size={'sm'} className={'ml-1'} onClick={this.addressModalPopup}>주소검색</Button>
                                        </InputGroupAddon>

                                    </InputGroup>
                                </div>
                                <div>
                                    <Input name="addrDetail" value={this.state.addrDetail} onChange={this.handleChange} placeholder="상세주소"/>
                                </div>
                            </div>
                            <div className='d-flex mb-2'>
                                <div className='d-flex flex-grow-1 align-items-center'>
                                    <input id='checkDefaultAddress' className={'mr-1'} type="checkbox" checked={this.state.isCheckedDefault} onChange={this.onCheckDefaultDeliver} />
                                    <label className={'m-0'} for='checkDefaultAddress'> 기본배송지로 저장</label>
                                </div>
                            </div>

                            <Button block color={'primary'} size={'md'} onClick={this.onClickOk}>저 장</Button>
                            {
                                this.state.addressIndex !== null && this.state.flag === 'mypage' && <Button block color={'secondary'} size={'md'} onClick={this.onDelete}>삭 제</Button>
                            }
                        </Col>
                    </Row>
                </Container>
                </div>
                <div>
                    {/*주소검색 모달 */}
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.modalToggle}> 주소 검색 </ModalHeader>
                        <ModalBody>
                            <JusoSearch onChange={this.jusoModalOnChange} />
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