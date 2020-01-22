import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, Alert, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem} from 'reactstrap'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { SingleImageUploader, FooterButtonLayer } from '~/components/common'
import { ModalWithNav, BlocerySpinner } from '~/components/common'
import { JusoSearch } from '~/components/common'

import { getProducerShopByProducerNo, setProducerShopModify } from '~/lib/producerApi'
import { Webview } from '~/lib/webviewApi'
import { getLoginUser } from '~/lib/loginApi'
import Style from './ShopModify.module.scss'

export default class ShopModify extends Component {

    constructor(props) {
        super(props);

        const { producerNo } = this.props;

        this.state = {
            isOpen: false,
            isDidMounted:false,
            loading: false,    //블로서리 로딩용
            loginUser: {},
            producerShop: {
                producerNo:producerNo,      //생산자NO
                email:null,                 //생산자 이메일
                name:null,                  //생산자명
                farmName:null,              //농장명

                profileImages:[],           //상점 프로필 사진
                profileBackgroundImages:[], //상점 프로필 배경 사진
                shopBizType:null,           //상점 업종
                shopZipNo:null,             //상점 우편번호
                shopAddress:null,           //상점 주소
                shopAddressDetail:null,     //상점 주소상세
                shopPhone:null,             //상점 고객센터(연락처)
                shopMainItems:null,         //상점 주요취급품목
                shopIntroduce:null          //상점 한줄소개
            },

            /* region === 주소검색용 === */
            jusoModal:false,  //주소검색 모달
            /* endregion === 주소검색용 === */
        }
    }

    componentDidMount = async() => {
        this.search();
    }

    //조회
    search = async () => {

        //생산자 번호
        let producerNo = this.state.producerShop.producerNo;

        const { status, data } = await getProducerShopByProducerNo(producerNo);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({producerShop:data,isDidMounted:true});

    }

    //프로필 이미지
    onProfileImageChange = (images) => {
        const producerShop = Object.assign({}, this.state.producerShop);
        producerShop.profileImages = images;
        this.setState({producerShop})
    }
    //프로필배경 이미지
    onBackgroundImageChange = (images) => {
        const producerShop = Object.assign({}, this.state.producerShop);
        producerShop.profileBackgroundImages = images;
        this.setState({producerShop})
    }

    //상점정보 온체인지 값
    onInputChange = (e) => {
        let { name, value } = e.target;
        const producerShop = Object.assign({}, this.state.producerShop);
        producerShop[name] = value;
        this.setState({producerShop})
    }

    //상점정보 저장
    onSaveClick = async () => {
        const producerShop = Object.assign({}, this.state.producerShop);
        const {status, data} = await setProducerShopModify(producerShop);
        if(status !== 200) {
            alert('상점정보 변경이 실패 하였습니다');
            return
        }
        console.log(data);
        if(data === 1) {
            this.props.onClose(true); //Shop.js callback search
            return
        }
    }

    //  region ===== 우편번호검색 팝업 메서드 모음 =====

    jusoModalOnChange = (obj) => {

        console.log("jusoModalOnChange",obj);

        const producerShop = Object.assign({}, this.state.producerShop);
        producerShop.shopZipNo = obj.zipNo;
        producerShop.shopAddress = obj.address;
        this.setState({
            producerShop
        });

        this.jusoModalToggle();
    }

    jusoAddressModalPopup = () => {
        this.setState({
            jusoModal:true //주소검색창 오픈.
        });
    }

    jusoModalToggle = () => {
        this.setState(prevState => ({
            jusoModal: !prevState.jusoModal
        }));
    }
    //  endregion ===== 우편번호검색 팝업 메서드 모음 =====

    render() {
        if(!this.state.isDidMounted) return null;
        let { producerShop } = this.state;

        return(
            <div className={Style.wrap}>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/* region ===== 상점정보 수정 ===== */}
                <Container fluid>
                    <Row>
                        <Col sm={12} lg={12} className='border p-0'>
                            <Container>
                                <Row>
                                    <Col className='pt-2'>
                                        <h6>상점관리</h6>
                                        <Alert color={'secondary'} className='small'>
                                            - 상점은 내 회사(농가) 전용 정보 페이지 입니다.<br/>
                                            - 소비자에게 다양한 경로로 노출되는 화면이나 이미지, 텍스트 등 내용을 꼼꼼하게 등록해 주세요.<br/>
                                        </Alert>
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <Label>프로필사진</Label>
                                    <SingleImageUploader images={producerShop.profileImages} defaultCount={1} isShownMainText={false} onChange={this.onProfileImageChange} />
                                    {/*<Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>*/}
                                </FormGroup>

                                <FormGroup>
                                    <Label>배경이미지</Label>
                                    <SingleImageUploader images={producerShop.profileBackgroundImages} defaultCount={1} isShownMainText={false} onChange={this.onBackgroundImageChange} />
                                </FormGroup>

                                <FormGroup>
                                    <Label>업종</Label>
                                    <Input name="shopBizType"
                                           value={producerShop.shopBizType || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>
                                <FormGroup>
                                    <Label>고객센터</Label>
                                    <Input name="shopPhone"
                                           placeholder={"고객센터 전화번호를 입력해 주세요 (예:XXX-XXXX-XXX)"}
                                           value={producerShop.shopPhone || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>주소</Label>
                                    <InputGroup>
                                        <Input name="shopZipNo" placeholder="우편번호5자리" maxLength="5" value={producerShop.shopZipNo || ''} onChange={this.onInputChange} />
                                        <Button outline color="secondary" onClick={this.jusoAddressModalPopup}>주소검색</Button>
                                    </InputGroup>
                                    <Input name="shopAddress" placeholder="주소" value={producerShop.shopAddress || ''} onChange={this.onInputChange} />
                                    <Input name="shopAddressDetail" placeholder="상세주소" value={producerShop.shopAddressDetail || ''} onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>주요취급품목</Label>
                                    <Input name="shopMainItems"
                                           placeholder={"주요취급품목을 입력해 주세요"}
                                           value={producerShop.shopMainItems || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>한줄소개</Label>
                                    <Input name="shopIntroduce"
                                           placeholder="회사(농가)를 잘 표현할 수 있는 문구를 입력해 주세요."
                                           value={producerShop.shopIntroduce || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                            </Container>

                            <FooterButtonLayer data={[
                                <Button onClick={this.onSaveClick} block color={'warning'}>확인</Button>
                            ]} />
                        </Col>
                    </Row>
                </Container>
                {/* endregion ===== 상점정보 수정 ===== */}

                {/* region ===== 주소검색 모달 ===== */}
                <Modal isOpen={this.state.jusoModal} toggle={this.jusoModalToggle}>
                    <ModalHeader toggle={this.jusoModalToggle}> 주소 검색 </ModalHeader>
                    <ModalBody>
                        <JusoSearch onChange={this.jusoModalOnChange} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.jusoModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* endregion ===== 주소검색 모달 ===== */}
            </div>
        )
    }
}
