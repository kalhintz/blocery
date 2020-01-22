import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, InputGroup, Fade, Modal, ModalHeader, ModalBody, ModalFooter, Alert, CustomInput } from 'reactstrap'
import { getProducerEmail, addProducer, getProducer, setProducerShopModify } from "../../../lib/producerApi"
import { getBankInfoList } from '~/lib/b2bSellerApi'
import { Redirect } from 'react-router-dom'
import { Const } from "../../Properties"
import { PassPhrase } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import ComUtil from '~/util/ComUtil'
import { Webview } from "~/lib/webviewApi"
import { SingleImageUploader, BlocerySpinner } from '~/components/common'
import { B2cTermsOfUse, B2cPrivatePolicy } from '~/components/common/termsOfUses'
import { AddressCard } from '~/components/common/cards'
import Select from 'react-select'
import Textarea from 'react-textarea-autosize'
import Css from './ProducerJoinWeb.module.scss'

const Star = () => <span className='text-danger'>*</span>

export default class ProducerJoinWeb extends Component{

    constructor(props) {
        super(props);
        this.state = {


            /* producer */
            producerNo: null,
            email: '',
            valword: '',
            name: '',
            passPhrase: '',
            passPhraseCheck: '',
            farmName: '',
            coRegistrationNo: '',   //사업자등록번호
            address: '',
            checkbox0: false,
            checkbox1: false,
            fadeEmail: false,
            fadeOverlapEmail: false,
            fadeValword: false,
            fadeValwordCheck: false,
            fadeCoNo: false,
            fadePassPhraseCheck: false,
            modalPassPhrase: false,
            modalPassPhraseCheck: false,
            terms: [{name:'checkbox0', title:'이용약관', content:'이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다.'},
                {name:'checkbox1', title:'개인정보 취급방침', content:'개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다.'}],

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
            /* producer end */

            bankList: [],
            loading: false,
            redirectPath: '',
            isMounted: false


        }

        //필수체크 포커스 이동을 위한 ref 적용
        this.email = React.createRef()
        this.valword1 = React.createRef()
        this.valword2 = React.createRef()

        this.passPhrase1 = React.createRef()
        this.passPhrase2 = React.createRef()

        this.farmName = React.createRef()
        this.name = React.createRef()

        this.coRegistrationNo = React.createRef()   //사업자등록번호

        this.addressButton = React.createRef()

        this.shopPhone = React.createRef()
        this.shopBizType = React.createRef()
        this.comSaleNumber = React.createRef()

        this.agree1 = React.createRef()
        this.agree2 = React.createRef()

        this.charger = React.createRef()
        this.chargerPhone = React.createRef()

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

            //병합(producer 를 state로)
            const state = {...this.state, ...producer}

            this.setState(state)

            console.log(state)
        }

        this.setState({isMounted: true})
    }

    componentWillMount() {
        // this.tokenGethSC = new TokenGethSC();
        // this.tokenGethSC.initContract('/BloceryTokenSC.json');

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

    findOverlapEmail = async (email) => {
        const response = await getProducerEmail(email)
        if (response.data == '' || response.data == null) {
            this.setState({ fadeOverlapEmail: false })
        } else {
            this.setState({ fadeOverlapEmail: true })
        }
    }

    // email regex
    emailCheck = (e) => {
        if(!ComUtil.emailRegex(e.target.value)) {
            this.setState({ fadeEmail: true })
        } else {
            this.setState({ fadeEmail: false })
        }

        // db에 이미 있는 아이디인지 체크
        this.findOverlapEmail(e.target.value)
    }

    // valword regex
    valwordRegexCheck = (e) => {
        if (!ComUtil.valwordRegex(e.target.value)) {
            this.setState({ fadeValword: true })
        } else {
            this.setState({ fadeValword: false })
        }
    }

    handleValwordChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        //비밀번호가 틀린 상황이면.. RegexCheck 이중화..
        if (this.state.fadeValword) {
            //console.log('val: wrong-onChange:' + e.target.value)
            this.valwordRegexCheck(e);
        }
    }

    // 입력한 비밀번호와 일치하는지 체크
    valwordCheck = (e) => {
        if (e.target.value !== this.state.valword) {
            this.setState({ fadeValwordCheck: true })
        } else {
            this.setState({ fadeValwordCheck: false })
        }
    }

    // 사업자등록번호가 10자리인지 체크
    coRegistrationNoCheck = (e) => {
        if (e.target.value.length !== 10 || !ComUtil.onlyNumber(e.target.value)) {
            this.setState({ fadeCoNo: true})
        } else {
            this.setState({ fadeCoNo: false})
        }
    }

    // 입력한 블록체인 비밀번호와 일치하는지 체크
    passPhraseCheck = () => {
        if(this.state.passPhraseCheck !== this.state.passPhrase) {
            this.setState({ fadePassPhraseCheck: true })
        } else {
            this.setState({ fadePassPhraseCheck: false })
        }
    }

    // checkbox 클릭시
    handleCheckbox = (e, index) => {
        this.setState({
            [e[index].name]: e[index].checked
        })
    }

    // 약관 전체동의 check/uncheck
    onChangeCheckAll = (e) => {
        this.setState({
            checkbox0: e.target.checked,
            checkbox1: e.target.checked
        })
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    // 회원가입버튼 클릭시 호출하는 validation api
    registProducer = async (state) => {
        this.notify('가입 중입니다. 잠시 기다려주세요', toast.success);

        const response = await addProducer(state)
        // if(response.data === 100) {
        //     alert('가입 오류입니다. 잠시 후 다시 시도해주세요.');
        //     return false;
        // }
        if(response.data === -1) {
            alert('이미 등록된 아이디(이메일)입니다.');
            return false;
        } else {
            let producerNo = response.data;
            Webview.updateFCMToken({userType: 'producer', userNo: producerNo});

            //alert('가입이 정상처리되었습니다.');
            this.props.history.push('/joinComplete?name='+state.name+'&email='+state.email+'&farmName='+state.farmName+'&coRegistrationNo='+state.coRegistrationNo);
        }
    }

    // 회원가입버튼 클릭
    onRegisterClick = () => {
        const state = Object.assign({}, this.state)

        if(state.email == '' || state.valword == '' || state.name == '' || state.farmName == '' || state.coRegistrationNo == '' ||
            state.coRegistrationNo.length !== 10 || state.fadeEmail || state.fadeOverlapEmail || state.fadeValword || state.fadeValwordCheck) {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }
        if(state.passPhrase.length !== 6 || state.fadePassPhraseCheck) {
            alert('블록체인 비밀번호를 정확하게 입력해주세요.')
            return false;
        }
        if(!state.checkbox0 || !state.checkbox1) {
            alert('약관 동의는 필수사항입니다.')
            return false;
        }

        //가입후 자동로그인 용.
        localStorage.setItem('userType', 'producer');
        localStorage.setItem('email', state.email);
        localStorage.setItem('valword', ComUtil.encrypt(state.valword));

        this.registProducer(state);
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modalPassPhrase: !prevState.modalPassPhrase
        }));
    };

    modalToggleCheck = () => {
        this.setState(prevState => ({
            modalPassPhraseCheck: !prevState.modalPassPhraseCheck
        }))
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    onPassPhraseCheck = (passPhrase) => {
        this.setState({
            passPhraseCheck: passPhrase,
            clearPassPhrase:false
        });
    };

    modalPassPhrase = () => {
        this.setState({
            modalPassPhrase: true
        })
    }

    modalPassPhraseCheck = () => {
        this.setState({
            modalPassPhraseCheck: true
        })
    }

    modalToggleOk = () => {
        if(this.state.modalPassPhrase == true) {
            this.setState({
                modalPassPhrase: false
            });
        } else {
            this.setState({
                modalPassPhraseCheck: false
            });
        }

        if(this.state.passPhrase && this.state.passPhraseCheck) {
            this.passPhraseCheck();
        }
    }

    onAddressChange = (address) => {
        console.log('producerJoinWeb value ',address)
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

        const isNew = !this.state.producerNo ? true : false

        let verification = this.checkVerify(isNew);

        if(!verification){
            return
        }

        //신규가입 처리
        if(isNew){
            if(!window.confirm('생산자 입점 계약 체결 및 회원가입을 하시겠습니까?')){
                return
            }

            this.setState({loading: true})

            console.log(this.state)

            const response = await addProducer(this.state)
            // if(response.data === 100) {
            //     alert('가입 오류입니다. 잠시 후 다시 시도해주세요.');
            //     return false;
            // }
            if(response.data === -1) {
                alert('이미 등록된 아이디(이메일)입니다.');
                this.setState({loading: false})
                return false;
            } else {
                this.setState({loading: false})

                alert('생산자 입점 계약 체결이 정상적으로 완료 되었습니다. 감사합니다.')

                //가입완료 페이지로 이동
                this.setState({
                    redirectPath: '/producerJoinWeb/finish'
                })

            }
        }//신규가입 처리
        //수정 처리
        else{
            const response = await setProducerShopModify(this.state)
            this.notify('저장되었습니다', toast.success);
        }//수정 처리



    }

    checkVerify = (isNew) => {
        try{
            //신규 일때만 체크
            if(isNew){
                if(!this.state.email){
                    alert('이메일은 필수 입니다')
                    this.email.current.focus()
                    return false
                }

                if(this.state.fadeEmail){
                    alert('이메일 형식을 다시 확인해주세요')
                    this.email.current.focus()
                    return false
                }
                if(this.state.fadeOverlapEmail){
                    alert('이미 사용중인 이메일입니다.')
                    this.email.current.focus()
                    return false
                }

                if(!this.valword1.current.value){
                    alert('비밀번호는 필수 입니다')
                    this.valword1.current.focus()
                    return false
                }
                if(!this.valword2.current.value){
                    alert('비밀번호는 필수 입니다')
                    this.valword2.current.focus()
                    return false
                }

                if(this.state.fadeValword){
                    alert('8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요')
                    this.valword1.current.focus()
                    return false
                }
                if(this.state.fadeValwordCheck){
                    alert('비밀번호가 일치하지 않습니다.')
                    this.valword1.current.focus()
                    return false
                }

                if(!this.state.passPhrase){
                    alert('블록체인 비밀번호는 필수입니다.')
                    this.passPhrase1.current.focus()
                    return false
                }

                if(!this.state.passPhraseCheck){
                    alert('블록체인 비밀번호는 필수입니다.')
                    this.passPhrase2.current.focus()
                    return false
                }

                if(this.state.fadePassPhraseCheck){
                    alert('블록체인 비밀번호가 일치하지 않습니다')
                    this.passPhrase1.current.focus()
                    return false
                }
            }//신규 일때만 체크


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
            }//공통 체크

            //신규 일때만 체크
            if(isNew) {
                if (!this.agree1.current.checked) {
                    alert('이용약관 동의가 필요합니다.')
                    this.agree1.current.focus()
                    return false
                }

                if (!this.agree2.current.checked) {
                    alert('개인정보 취급방침 동의가 필요합니다.')
                    this.agree2.current.focus()
                    return false
                }
            }//신규 일때만 체크

            //공통체크
            if(!this.state.charger){
                alert('담당자명은 필수 입니다')
                this.charger.current.focus()
                return false
            }
            if(!this.state.chargerPhone){
                alert('담당자 전화번호는 필수 입니다')
                this.chargerPhone.current.focus()
                return false
            }

        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }

    render(){

        const state = this.state

        if(state.redirectPath) return <Redirect to={state.redirectPath}/>
        if(!state.isMounted) return <BlocerySpinner/>

        return(
            <Fragment>
                {
                    this.state.loading && <BlocerySpinner/>
                }

                <div className={Css.wrap}>
                    <div className='pt-sm-0 pb-sm-0 pt-md-4 pb-md-4'>
                        <Container className={'bg-white shadow-lg'}>
                            <Row>
                                <Col className='p-0'>
                                    <div className='pl-3 pr-3 p-2 f3 text-white bg-info d-flex align-items-center'>
                                        <div>
                                            {
                                                !state.producerNo ? '생산자 회원가입' : '상점 정보수정'
                                            }
                                        </div>
                                        <small className='ml-auto'>
                                            MARKETBLY
                                        </small>
                                    </div>
                                    <hr className='m-0'/>
                                </Col>
                            </Row>

                            <Row>
                                <Col className='p-0'>
                                    {/* 계정정보 [신규일 경우만 노출]*/}
                                    {
                                        !state.producerNo && (
                                            <>
                                            <div className='m-4'>
                                                <Alert color={'danger'}>
                                                    마켓블리(MarketBly)는 <b><u>별도의 계약서 작성 대신 회원가입으로 간소화 체결</u></b>을 하고 있습니다.<br/>
                                                    이용약관을 꼭 확인해 주세요!
                                                </Alert>
                                                <h5>계정정보</h5>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={2}>
                                                            <Label>아이디<Star/></Label>
                                                        </Col>
                                                        <Col sm={10}>
                                                            <Input
                                                                name="email" placeholder="아이디(이메일)" onBlur={this.emailCheck} onChange={this.handleChange}
                                                                innerRef={this.email}
                                                            />
                                                            {
                                                                this.state.fadeEmail && <Fade in className={'text-danger small'}>이메일 형식을 다시 확인해주세요.</Fade>
                                                            }
                                                            {
                                                                this.state.fadeOverlapEmail && <Fade in className={'text-danger small'}>이미 사용중인 이메일입니다.</Fade>
                                                            }
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={2}>
                                                            <Label>비밀번호<Star/></Label>
                                                        </Col>
                                                        <Col sm={10}>
                                                            <Input type="password" name="valword" placeholder="영문자, 숫자, 특수문자 필수조합 8~16자" onBlur={this.valwordRegexCheck}
                                                                   onChange={this.handleValwordChange}
                                                                   innerRef={this.valword1}
                                                            />
                                                            {
                                                                this.state.fadeValword && <Fade in className={'text-danger small'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                                            }
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={2}>
                                                            <Label>비밀번호확인<Star/></Label>
                                                        </Col>
                                                        <Col sm={10}>
                                                            <Input type="password" name="valwordCheck" placeholder="비밀번호 확인" onBlur={this.valwordCheck} onChange={this.handleChange}
                                                                   innerRef={this.valword2}
                                                            />
                                                            {
                                                                this.state.fadeValwordCheck && <Fade in className={'text-danger small'}>비밀번호가 일치하지 않습니다.</Fade>
                                                            }
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </div>

                                            <hr/>

                                            {/* 블록체인 계정정보 */}
                                            <div className='m-4'>
                                                <h5>블록체인 계정정보</h5>
                                                <Alert color={'danger'}>
                                                    BLS/BLCT 환전시 사용할 비밀번호 입니다.<br/>
                                                    (블록체인 특성상 블록체인 비밀번호는 변경이 불가능합니다. 분실 또는 유출되지 않도록 주의해주세요)
                                                </Alert>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={2}>
                                                            <Label>블록체인 비밀번호<Star/></Label>
                                                        </Col>
                                                        <Col sm={10}>
                                                            <Input type="password" name="passPhrase" readOnly value={this.state.passPhrase}  onClick={this.modalPassPhrase} placeholder="블록체인 비밀번호(숫자6자리)" maxLength="6"
                                                                   innerRef={this.passPhrase1}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup inline>
                                                    <Row>
                                                        <Col sm={2}>
                                                            <Label>블록체인 비밀번호 확인<Star/></Label>
                                                        </Col>
                                                        <Col sm={10}>
                                                            <Input type="password" name="passPhraseCheck" readOnly value={this.state.passPhraseCheck} placeholder="블록체인 비밀번호 확인" onClick={this.modalPassPhraseCheck} maxLength="6"
                                                                   innerRef={this.passPhrase2}
                                                            />
                                                            {
                                                                this.state.fadePassPhraseCheck && <Fade in className={'text-danger small'}>비밀번호가 일치하지 않습니다.</Fade>
                                                            }
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            </div>
                                            <hr/>

                                            </>
                                        )
                                    }

                                    {/* 기본정보 */}
                                    <div className='m-4'>
                                        <h5>기본정보</h5>
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
                                                    <Label>담당자 전화번호<Star/></Label>
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
                                    </div>
                                    {
                                        state.producerNo && (
                                            <>
                                                <hr/>
                                                <div className='m-4'>
                                                    <FormGroup inline>
                                                        <Row>
                                                            <Col sm={12} className='text-center'>
                                                                <Button onClick={this.onSaveClick} color={'warning'} style={{width: 200}}>정보수정</Button>
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

                        {/* 약관동의 [신규일때만 노출] */}
                        {
                            !state.producerNo && (
                                <Container className={'bg-white shadow-lg mt-4'}>
                                    <Row>
                                        <Col className='p-0 pb-3'>
                                            <div className='pl-3 pr-3 p-2 f3 text-white bg-info d-flex align-items-center'>
                                                약관동의
                                            </div>
                                            <hr className='m-0'/>
                                            <div className='m-3'>
                                                <p className='font-weight-bolder'>
                                                    이용약관<Star/>
                                                </p>
                                                <p className='bg-light p-3' style={{height: 200, overflow: 'auto'}}>
                                                    <B2cTermsOfUse/>
                                                </p>
                                                <p className='text-right'>
                                                    <CustomInput type="checkbox" id="agree1" label="동의합니다" inline innerRef={this.agree1} />
                                                </p>
                                            </div>
                                            <hr/>
                                            <div className='m-3'>
                                                <p className='font-weight-bolder'>
                                                    개인정보 취급방침<Star/>
                                                </p>
                                                <p className='bg-light p-3' style={{height: 200, overflow: 'auto'}}>
                                                    <B2cPrivatePolicy/>
                                                </p>
                                                <p className='text-right'>
                                                    <CustomInput type="checkbox" id="agree2" label="동의합니다" inline innerRef={this.agree2} />
                                                </p>
                                            </div>
                                            <hr/>
                                            <div className='text-center'>
                                                <Button onClick={this.onSaveClick} color={'warning'} style={{width: 200}}>가입완료</Button>
                                            </div>
                                        </Col>
                                    </Row>

                                </Container>
                            )
                        }


                    </div>
                    }
                </div>


                <ToastContainer/>

                {/* 블록체인 비밀번호용 modal */}
                <Modal isOpen={this.state.modalPassPhrase} centered>
                    <ModalHeader toggle={this.modalToggle}>블록체인 비밀번호</ModalHeader>
                    <ModalBody>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6)?false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 블록체인 비밀번호 확인용 modal */}
                <Modal isOpen={this.state.modalPassPhraseCheck} centered>
                    <ModalHeader toggle={this.modalToggleCheck}>블록체인 비밀번호 확인</ModalHeader>
                    <ModalBody>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhraseCheck}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhraseCheck.length === 6)?false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggleCheck}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>

        );
    }
}