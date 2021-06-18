import React, { Component, Fragment } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    FormGroup,
    Label,
    Input,
    Fade,
    ModalHeader, ModalBody, ModalFooter, Modal
} from 'reactstrap'
import {doProducerLogout} from "~/lib/loginApi"
import {getBankInfoList, getProducer, setProducerShopModify, updValword, getProducerValword} from "~/lib/producerApi"
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import ComUtil from '~/util/ComUtil'
import { SingleImageUploader, BlocerySpinner, ModalWithNav, ProducerProfileCard, ModalPopup } from '~/components/common'
import { AddressCard } from '~/components/common/cards'
import Select from 'react-select'
import Textarea from 'react-textarea-autosize'
import {updateValword} from "~/lib/shopApi";
import axios from "axios";
import {Server} from "~/components/Properties";
const Star = () => <span className='text-danger'>*</span>
export default class WebShop extends Component{

    constructor(props) {
        super(props);
        this.state = {
            /* producer */
            producerNo: null,
            email: '',
            name: '',
            passPhrase: '',
            passPhraseCheck: '',
            farmName: '',
            coRegistrationNo: '',   //사업자등록번호
            address: '',
            fadeCoNo: false,

            shopZipNo: '',
            shopAddress: '',
            shopAddressDetail: '',

            shopPhone: '',      //고객센터 전화번호
            shopBizType: '',    //업종
            comSaleNumber: '',  //통신판매업 번호

            shopMainItems: '',                                           //상점 주요취급품목
            profileImages: [],                                           //상점 프로필 이미지
            shopIntroduce: '',                                           //상점 한줄소개

            payoutBankCode: '',  // 판매대금 입금 은행 코드: bankInfo.code
            payoutAccount: '',   // 판매대금 입금 은행 계좌
            payoutAccountName: '',  // 판매대금 입금 은행 계좌 예금주 이름
            charger: '',
            chargerPhone: '',
            memo:'',
            /* producer end */

            bankList: [],
            loading: false,
            isMounted: false,
            previewOpen: false,
            producerWrapDeliver: false,
            producerWrapLimitPrice: '-',
            producerWrapFee: '-',

            valword: '',
            newValword: '',
            modalValword: false,
            fadeValwordCheck: false,            // 현재비번 일치 체크
            fadeNewValwordCheck: false,          // 새비번 유효성 체크
            compareNewValword: false            // 새비번 일치 확인
        }

        //필수체크 포커스 이동을 위한 ref 적용
        this.farmName = React.createRef()
        this.name = React.createRef()

        this.coRegistrationNo = React.createRef()   //사업자등록번호

        this.addressButton = React.createRef()

        this.shopPhone = React.createRef()
        this.shopBizType = React.createRef()
        this.comSaleNumber = React.createRef()

        this.charger = React.createRef()
        this.chargerPhone = React.createRef()
        this.memo = React.createRef()


        this.producerWrapLimitPrice = React.createRef()
        this.producerWrapFee = React.createRef()

        this.valword = React.createFactory()
        this.newValword = React.createFactory()

    }

    async componentDidMount() {
        await this.bindBankData()
        const {status, data: producer} = await getProducer()

        //조회된 데이터가 있을 경우(수정모드)
        if(producer){
            if(status !== 200){
                alert('정보를 가져오는데 실패 했습니다. 재시도해 주세요')
                return
            }

            if(null === producer.producerFeeRate || producer.producerFeeRate === 0) {
                producer.producerRateId = 0;
                producer.producerFeeRate = 5;
            }
            //병합(producer 를 state로)
            const state = {...this.state, ...producer}

            this.setState(state)

            // console.log(state)
        } else {
        }

        this.setState({isMounted: true})
    }

    //은행 데이터 바인딩 정보
    bindBankData = async () => {
        const {data: itemsData} = await getBankInfoList();
        const bankList = itemsData.map(item => ({
            value: item.code,
            label: item.name
        }))
        this.setState({
            bankList: bankList
        })
    }


    // element의 값이 체인지될 때
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 사업자등록번호가 10자리인지 체크
    coRegistrationNoCheck = (e) => {
        if (e.target.value.length !== 10 || !ComUtil.onlyNumber(e.target.value)) {
            this.setState({ fadeCoNo: true})
        } else {
            this.setState({ fadeCoNo: false})
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    onAddressChange = (address) => {
        this.setState({
            shopZipNo: address.zipNo,
            shopAddress: address.address,
            shopAddressDetail: address.addressDetail
        })
    }

    onProfileImageChange = (images) => {
        // const state = Object.assign({}, this.state);
        // state.profileImages = images;
        this.setState({profileImages:images})
    }

    onProfileBackgroundImageChange = (images) => {
        // const state = Object.assign({}, this.state);
        // state.profileImages = images;
        this.setState({profileBackgroundImages:images})
    }

    // 정산계좌 은행선택
    onChangeBankInfo = (data) => {
        this.setState({payoutBankCode:data.value});
    }


    onSaveClick = async(e) => {
        e.preventDefault()

        let verification = this.checkVerify();

        if(!verification){
            return
        }

        const response = await setProducerShopModify(this.state)
        this.notify('저장되었습니다', toast.success);

    }

    onPreviewClick = () => {
        this.setState({
            previewOpen: true
        })

    }

    onPreviewClose = () => {
        this.setState({
            previewOpen: false
        })
    }

    onProducerWrapDeliverCheck = (e) => {
        const checked = e.target.checked;
        this.setState({
            producerWrapDeliver: checked,
            producerWrapLimitPrice: 0,
            producerWrapFee: 0
        })
    }

    onInputProducerWrapLimit = (e) => {
        const value = e.target.value;
        this.setState({
            producerWrapLimitPrice: value
        })
    }

    onInputProducerWrapFee = (e) => {
        const value = e.target.value;
        this.setState({
            producerWrapFee: value
        })
    }

    checkVerify = () => {
        try{
            //공통 체크
            if(!this.state.name){
                alert('대표자명(농가명)은 필수입니다.')
                this.name.current.focus()
                return false
            }
            if(!this.state.coRegistrationNo){
                alert('사업자등록번호는 필수입니다.')
                this.coRegistrationNo.current.focus()
                return false
            }

            if(this.state.fadeCoNo){
                alert("사업자등록번호는 '-'제외한 숫자 10자리 입력해주세요")
                this.coRegistrationNo.current.focus()
                return false
            }

            if(!this.state.farmName){
                alert('상호명(농장명)은 필수입니다.')
                this.farmName.current.focus()
                return false
            }

            if(!this.state.shopZipNo){
                alert('사업장 우편번호는 필수입니다.')
                this.addressButton.current.focus()
                this.addressButton.current.click()
                return false
            }

            if(!this.state.shopAddress){
                alert('사업장 주소는 필수입니다.')
                this.addressButton.current.focus()
                this.addressButton.current.click()
                return false
            }

            if(!this.state.shopPhone){
                alert('고객센터 전화번호는 필수입니다.')
                this.shopPhone.current.focus()
                return false
            }

            if(!this.state.shopBizType){
                alert('업종은 필수입니다.')
                this.shopBizType.current.focus()
                return false
            }

            if(!this.state.comSaleNumber){
                alert('통신판매업번호는 필수입니다.')
                this.comSaleNumber.current.focus()
                return false
            }

            if(!this.state.charger){
                alert('담당자명은 필수 입니다')
                this.charger.current.focus()
                return false
            }
            if(!this.state.chargerPhone || !this.state.chargerPhone.startsWith('010') ){
                alert('담당자 휴대폰 번호는 필수이며, 010으로 시작해야합니다.')
                this.chargerPhone.current.focus()
                return false
            }
            if (this.state.chargerPhone.length < 11 || this.state.chargerPhone.length > 13){
                alert('담당자 휴대폰 번호가 잘못되었습니다.')
                this.chargerPhone.current.focus()
                return false
            }
            if(this.state.producerWrapDeliver && this.state.producerWrapLimitPrice === 0) {
                alert('생산자 묶음배송의 경우 무료배송 조건금액은 필수입니다 ')
                this.producerWrapLimitPrice.current.focus()
                return false
            }
            if(this.state.producerWrapDeliver && this.state.producerWrapFee === 0) {
                alert('생산자 묶음배송의 경우 배송비는 필수입니다 ')
                this.producerWrapFee.current.focus()
                return false
            }

        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }

    onClickModifyValword = () => {
        this.setState({ modalValword: true })
    }

    onBlurCurrentValword = async () => {
        const data = Object.assign({}, this.state)

        const {data: res} = await getProducerValword(data.valword)

        if(!res) {
            this.setState({fadeValwordCheck:true})
        } else {
            this.setState({fadeValwordCheck:false})
        }

    }

    onClickOk = async () => {
        if(!ComUtil.valwordRegex(this.state.newValword)) {
            alert('8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요.')
            return;
        }

        let data = {};
        data.valword = this.state.newValword;
        data.producerNo = this.state.producerNo;

        let modified = await updValword(data);

        if(modified.data === 1) {
            alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
            await doProducerLogout();
            this.props.history.push('/producer/webLogin')
        } else {
            alert('회원정보 수정 실패. 다시 시도해주세요.')
            return false;
        }
    }

    toggle = () => {
        this.setState(prevState => ({
            modalValword: !prevState.modalValword
        }));
    }

    // 새비번 유효성체크
    valwordRegexCheck = (e) => {
        if(!ComUtil.valwordRegex(e.target.value)) {
            this.setState({fadeNewValwordCheck: true})
        } else {
            this.setState({ fadeNewValwordCheck: false })
        }
    }

    compareValwordCheck = (e) => {
        if (e.target.value !== this.state.newValword) {
            this.setState({ compareNewValword: true })
        } else {
            this.setState({ compareNewValword: false })
        }
    }

    render(){

        const state = this.state

        if(!state.isMounted) return <BlocerySpinner/>

        return(
            <Fragment>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <div className='mt-2'>

                    <Container className={'bg-white m-0 p-0'}>

                        <Row className='p-0 m-0'>
                            <Col className='p-0'>
                                <span className='text-secondary small'>
                                    - 상점은 내 회사(농가) 전용 정보 페이지입니다. <br/>
                                    - 소비자에게 다양한 경로로 노출되는 화면이니 이미지, 텍스트 등 내용을 꼼꼼하게 등록해 주세요.<br/>
                                    - [미리보기] 버튼을 클릭하면 실제 블로서리 APP에 보여지는 화면을 먼저 확인할 수 있습니다.<br/>
                                </span>

                                {/* 기본정보 */}
                                <div className='m-4 pt-3'>
                                    <div className='d-flex mb-3'>
                                        <h5>기본정보</h5>
                                        <div className='ml-auto'><Button onClick={this.onClickModifyValword}>비밀번호 변경</Button></div>
                                    </div>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>대표자명<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="name" value={this.state.name} placeholder="대표자명" onChange={this.handleChange}
                                                       innerRef={this.name}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>사업자등록번호<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="coRegistrationNo" value={this.state.coRegistrationNo} placeholder="'-'제외한 숫자만 입력해주세요(10자리)" onBlur={this.coRegistrationNoCheck} onChange={this.handleChange} maxLength={10}
                                                       innerRef={this.coRegistrationNo}
                                                />
                                                {
                                                    this.state.fadeCoNo && <Fade in className={'text-danger small'}>'-'제외한 숫자 10자리 입력해주세요</Fade>
                                                }
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>상호명<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="farmName" value={this.state.farmName} placeholder="상호명(농장명)" onChange={this.handleChange}
                                                       innerRef={this.farmName}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>사업장 주소<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <AddressCard
                                                    zipNo={state.shopZipNo}
                                                    address={state.shopAddress}
                                                    addressDetail={state.shopAddressDetail}
                                                    onChange={this.onAddressChange} buttonRef={this.addressButton} />
                                            </Col>
                                        </Row>
                                    </FormGroup>

                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>판매수수료(%)</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input readOnly name="farmName" value={`${state.producerFeeRate} %`}/>
                                            </Col>
                                        </Row>
                                    </FormGroup>

                                    {/*<FormGroup inline>*/}
                                    {/*    <Row>*/}
                                    {/*        <Col sm={2}>*/}
                                    {/*            <div className='d-flex align-items-center mt-2'>*/}
                                    {/*                <input*/}
                                    {/*                    type="checkbox"*/}
                                    {/*                    id='producerWrapDeliver'*/}
                                    {/*                    className='mr-2'*/}
                                    {/*                    checked={state.producerWrapDeliver}*/}
                                    {/*                    onChange={this.onProducerWrapDeliverCheck}*/}
                                    {/*                />*/}
                                    {/*                <label for='producerWrapDeliver' className='m-0'>*/}
                                    {/*                    생산자 묶음 배송*/}
                                    {/*                </label>*/}
                                    {/*            </div>*/}
                                    {/*        </Col>*/}
                                    {/*        <Col sm={5}>*/}
                                    {/*            <div className='d-flex align-items-center'>*/}
                                    {/*                <span className="flex-shrink-0 mr-2"> 무료배송 조건 금액 </span>*/}
                                    {/*                <Input*/}
                                    {/*                    //className={'mt-2'}*/}
                                    {/*                    name="producerWrapLimitPrice"*/}
                                    {/*                    innerRef={this.producerWrapLimitPrice}*/}
                                    {/*                    value={state.producerWrapLimitPrice}*/}
                                    {/*                    readOnly={!state.producerWrapDeliver}*/}
                                    {/*                    onChange={this.onInputProducerWrapLimit}*/}
                                    {/*                />*/}
                                    {/*            </div>*/}
                                    {/*        </Col>*/}
                                    {/*        <Col sm={5}>*/}
                                    {/*            <div className='d-flex align-items-center'>*/}
                                    {/*                <span className="flex-shrink-0 mr-2"> 배송비 </span>*/}
                                    {/*                <Input*/}
                                    {/*                    // className={'mt-2'}*/}
                                    {/*                    name="producerWrapFee"*/}
                                    {/*                    innerRef={this.producerWrapFee}*/}
                                    {/*                    value={state.producerWrapFee}*/}
                                    {/*                    readOnly={!state.producerWrapDeliver}*/}
                                    {/*                    onChange={this.onInputProducerWrapFee}*/}
                                    {/*                />*/}
                                    {/*            </div>*/}
                                    {/*        </Col>*/}
                                    {/*    </Row>*/}

                                    {/*</FormGroup>*/}
                                </div>

                                <hr/>

                                <div className='m-4'>
                                    <h5>판매/운영정보</h5>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>고객센터 전화번호<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="shopPhone"
                                                       value={state.shopPhone}
                                                       onChange={this.handleChange}
                                                       innerRef={this.shopPhone}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>업종<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="shopBizType"
                                                       value={state.shopBizType}
                                                       onChange={this.handleChange}
                                                       innerRef={this.shopBizType}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>통신판매업번호<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="comSaleNumber"
                                                       value={state.comSaleNumber}
                                                       onChange={this.handleChange}
                                                       innerRef={this.comSaleNumber}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>주요취급상품</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="shopMainItems" value={this.state.shopMainItems} onChange={this.handleChange}/>
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>프로필 사진</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <SingleImageUploader images={this.state.profileImages} defaultCount={5} isShownMainText={false} onChange={this.onProfileImageChange} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>상점 배경사진</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <SingleImageUploader images={this.state.profileBackgroundImages} defaultCount={5} isShownMainText={false} onChange={this.onProfileBackgroundImageChange} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>한줄소개</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Textarea
                                                    name="shopIntroduce"
                                                    style={{width: '100%', minHeight: 90, borderRadius: 0}}
                                                    className={'border-secondary'}
                                                    value={state.shopIntroduce}
                                                    onChange={this.handleChange}
                                                    placeholder='한줄소개'
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </div>
                                <hr/>

                                {/* 정산계좌 정보 */}
                                <div className='m-4'>
                                    <h5>정산계좌 정보</h5>
                                    <div className={'p-3 border bg-light'}>
                                        <Row>
                                            <Col sm={3} className={'pr-sm-1'}>
                                                <Label>은행명</Label>
                                                <Select options={this.state.bankList}
                                                        value={ this.state.bankList.find(item => item.value === this.state.payoutBankCode)}
                                                        onChange={this.onChangeBankInfo}
                                                />
                                            </Col>
                                            <Col sm={6} className={'pr-sm-1'}>
                                                <Label>은행 계좌번호</Label>
                                                <Input name="payoutAccount"
                                                       value={this.state.payoutAccount || ''}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                            <Col sm={3} >
                                                <Label>예금주명</Label>
                                                <Input name="payoutAccountName"
                                                       value={this.state.payoutAccountName || ''}
                                                       onChange={this.handleChange}/>
                                            </Col>
                                        </Row>
                                    </div>
                                    <span className={'text-info small'} >매월 정산되는 상품판매 금액이 입금되는 계좌입니다</span>
                                </div>
                                <hr/>
                                {/* 정산계좌 정보 */}
                                <div className='m-4'>
                                    <h5>계약 담당자정보</h5>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>담당자명<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="charger"
                                                       value={state.charger}
                                                       onChange={this.handleChange}
                                                       innerRef={this.charger}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>담당자 휴대폰번호<Star/></Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="chargerPhone"
                                                       value={state.chargerPhone}
                                                       onChange={this.handleChange}
                                                       innerRef={this.chargerPhone}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={2}>
                                                <Label>메모</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="memo"
                                                       value={state.memo}
                                                       onChange={this.handleChange}
                                                       innerRef={this.memo}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </div>
                                {
                                    state.producerNo && (
                                        <>
                                            <hr/>
                                            <div className='m-4'>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={12} className='text-center'>
                                                            <Button onClick={this.onPreviewClick} color={'info'} style={{width: 200}} className='mr-4'>미리보기</Button>
                                                            <Button onClick={this.onSaveClick} color={'warning'} style={{width: 200}}>확인</Button>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </div>
                                        </>
                                    )
                                }
                            </Col>
                        </Row>
                    </Container>
                </div>
                <ModalWithNav show={this.state.previewOpen}
                              title={this.state.farmName}
                              onClose={this.onPreviewClose} noPadding>
                    <div>
                        <ProducerProfileCard
                            {...this.state}
                            profileBackgroundImages={this.state.shopMainItems}
                        />
                        <div className='m-3 p-3'/>
                    </div>
                </ModalWithNav>
                {
                    this.state.modalValword &&
                    <Modal isOpen={true} centered>
                        <ModalHeader>비밀번호 변경</ModalHeader>
                        <ModalBody>
                            <Input type="password" placeholder="현재 비밀번호를 입력해주세요" name="valword"
                                   className='mb-2'
                                   innerRef ={this.valword}
                                   onChange={this.handleChange}
                                   onBlur={this.onBlurCurrentValword}
                            />
                            {
                                this.state.fadeValwordCheck && <Fade in className={'text-danger small'}>비밀번호를 확인해주세요</Fade>
                            }
                            <Input type="password" placeholder="새로운 비밀번호를 입력해주세요" name="newValword"
                                   className={'mb-2'}
                                   innerRef={this.newValword}
                                   onChange={this.handleChange}
                                   onBlur={this.valwordRegexCheck}
                            />
                            {
                                this.state.fadeNewValwordCheck && <Fade in className={'text-danger small'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                            }
                            <Input type="password" placeholder="비밀번호 확인" name="newValwordCheck"
                                   onChange={this.handleChange}
                                   onBlur={this.compareValwordCheck}
                            />
                            {
                                this.state.compareNewValword && <Fade in className={'text-danger small'}>비밀번호가 일치하지 않습니다.</Fade>
                            }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={this.onClickOk} disabled={this.state.fadeValwordCheck || this.state.fadeNewValwordCheck || this.state.compareNewValword}>확인</Button>
                            <Button color="secondary" onClick={this.toggle}>취소</Button>
                        </ModalFooter>
                    </Modal>
                }

                <ToastContainer/>

            </Fragment>

        );
    }
}