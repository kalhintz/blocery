import React, { Component, Fragment } from 'react';
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Row, Fade, Modal, ModalHeader, ModalBody, ModalFooter, Badge, Table } from 'reactstrap'
import { getSellerEmail, addSeller } from "../../../lib/b2bSellerApi"
import ComUtil from "../../../util/ComUtil"

import { Link } from 'react-router-dom'
import Terms from '../../common/Terms/Terms'
// import TokenGethSC from '../../../contracts/TokenGethSC';
// import { initUserToken, scFrontGetUserEther } from "../../../lib/smartcontractApi";
import { Const, Server } from "../../Properties";
import { B2bShopXButtonNav } from '../../common/index'
import { PassPhrase } from '../../common'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import proj4 from 'proj4';
import { Webview } from "~/lib/webviewApi";

const style = {
    cell: {
        padding: 0,
        margin: 0
    }
}

export default class SellerJoin extends Component{

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            valword: '',
            name: '',
            // passPhrase: '',
            // passPhraseCheck: '',
            farmName: '',
            coRegistrationNo: '',
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

            /* region === 주소검색용 === */
            modal: false, //주소모달팝업.
            inputAddress: '',
            totalCount: '', //검색건수text
            results:[], //[{zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}, {zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}]
            /* endregion === 주소검색용 === */

        }
    }

    componentWillMount() {
        // this.tokenGethSC = new TokenGethSC();
        // this.tokenGethSC.initContract('/BloceryTokenSC.json');
    }

    // element의 값이 체인지될 때
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    findOverlapEmail = async (email) => {
        const response = await getSellerEmail(email)
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
    // passPhraseCheck = () => {
    //     if(this.state.passPhraseCheck !== this.state.passPhrase) {
    //         this.setState({ fadePassPhraseCheck: true })
    //     } else {
    //         this.setState({ fadePassPhraseCheck: false })
    //     }
    // }

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
    registSeller = async (state) => {
        this.notify('가입 중입니다. 잠시 기다려주세요', toast.success);

        const response = await addSeller(state)
        // if(response.data === 100) {
        //     alert('가입 오류입니다. 잠시 후 다시 시도해주세요.');
        //     return false;
        // }
        if(response.data === -1) {
            alert('이미 등록된 아이디(이메일)입니다.');
            return false;
        } else {
            let sellerNo = response.data;
            Webview.updateFCMToken({userType: 'seller', userNo: sellerNo});

            //alert('가입이 정상처리되었습니다.');
            this.props.history.push('/b2b/joinComplete?name='+state.name+'&email='+state.email+'&farmName='+state.farmName+'&coRegistrationNo='+state.coRegistrationNo);
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
        // if(state.passPhrase.length !== 6 || state.fadePassPhraseCheck) {
        //     alert('블록체인 비밀번호를 정확하게 입력해주세요.')
        //     return false;
        // }
        if(!state.checkbox0 || !state.checkbox1) {
            alert('약관 동의는 필수사항입니다.')
            return false;
        }

        //가입후 자동로그인 용.
        localStorage.setItem('userType', 'producer');
        localStorage.setItem('email', state.email);
        localStorage.setItem('valword', ComUtil.encrypt(state.valword));

        this.registSeller(state);
    }

    addrModalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    // modalToggle = () => {
    //     this.setState(prevState => ({
    //         modalPassPhrase: !prevState.modalPassPhrase
    //     }));
    // };

    // modalToggleCheck = () => {
    //     this.setState(prevState => ({
    //         modalPassPhraseCheck: !prevState.modalPassPhraseCheck
    //     }))
    // }
    //
    // //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    // onPassPhrase = (passPhrase) => {
    //     this.setState({
    //         passPhrase: passPhrase,
    //         clearPassPhrase:false
    //     });
    // };
    //
    // onPassPhraseCheck = (passPhrase) => {
    //     this.setState({
    //         passPhraseCheck: passPhrase,
    //         clearPassPhrase:false
    //     });
    // };
    //
    // modalPassPhrase = () => {
    //     this.setState({
    //         modalPassPhrase: true
    //     })
    // }
    //
    // modalPassPhraseCheck = () => {
    //     this.setState({
    //         modalPassPhraseCheck: true
    //     })
    // }
    //
    // modalToggleOk = () => {
    //     if(this.state.modalPassPhrase == true) {
    //         this.setState({
    //             modalPassPhrase: false
    //         });
    //     } else {
    //         this.setState({
    //             modalPassPhraseCheck: false
    //         });
    //     }
    //
    //     if(this.state.passPhrase && this.state.passPhraseCheck) {
    //         this.passPhraseCheck();
    //     }
    // }

    //우편번호검색 팝업 //////////////////////////////////////////
    addressModalPopup = () => {
        this.setState({
            modal:true //주소검색창 오픈.
        });
    }
    //주소검색 API //////////////////////////////////////////
    searchAPIcall = async () => {
        //공공주소 open API
        let query = this.state.inputAddress;
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

        const juso = jsonResults.results.juso || []

        //좌표검색에 필요한 변수들 return.(B2B추가
        let results = juso.map( (row,i) => {
                return {zipNo: row.zipNo, roadAddrPart1: row.roadAddrPart1, admCd:row.admCd, rnMgtSn:row.rnMgtSn, udrtYn:row.udrtYn, buldMnnm:row.buldMnnm, buldSlno:row.buldSlno };
            }
        );

        console.log('results:',results);
        this.setState({
            totalCount: totalCount,
            results:results
        });
    }

    addressSelected = async (row) => {

        console.log('좌표검색', row);

        let bodyFormData = new FormData();
        bodyFormData.set('admCd', row.admCd);
        bodyFormData.set('rnMgtSn',row.rnMgtSn);
        bodyFormData.set('udrtYn', row.udrtYn);
        bodyFormData.set('buldMnnm', row.buldMnnm);
        bodyFormData.set('buldSlno',row.buldSlno);
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey', 'U01TX0FVVEgyMDE5MTExOTE1MzY0NTEwOTIwMzE=');

        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrCoordApiJsonp.do', { method: "post",
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

        //GRS80 UTM-K 형태의 좌표가 return됨.-> 위경도로 변환필요. : 참고 https://okky.kr/article/485807?note=1479964
        console.log('좌표검색결과', jsonResults);  //common.totalCount, common.errorMessage,  juso.entX, juso.entY가 중요
        let convertedX = 0;
        let convertedY = 0;

        if (jsonResults && jsonResults.results && jsonResults.results.juso && jsonResults.results.juso.length > 0) {
            let convertedXy = this.convertXY(jsonResults.results.juso[0].entX,  jsonResults.results.juso[0].entY);
            convertedX = convertedXy[0];
            convertedY = convertedXy[1];
            console.log('좌표변환결과', convertedX, convertedY);
        }


        this.setState({
            shopAddress: row.roadAddrPart1,
            shopAddressDetail: row.roadAddrPart2,
            shopZipNo: row.zipNo,

            location : {
                type:'Point',
                coordinates:[convertedX, convertedY]
            }
        })

        this.addrModalToggle();
    }

    //xy를 위경도로 변환. [x,y]리턴..
    convertXY = (x, y) => {
        console.log( 'converXY start', x, y);

        let firstProjection = '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs ';  //GRS80 UTM-K
        let secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'; //위경도
        return proj4(firstProjection,secondProjection,[Number(x), Number(y)]);
    }


    render(){
        const data = Object.assign({}, this.state)
        return(
            <Fragment>
                <B2bShopXButtonNav back history={this.props.history}>판매자 회원가입</B2bShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>아이디</Label>
                                <InputGroup>
                                    <Input name="email" value={this.state.email} placeholder="아이디(이메일)" onBlur={this.emailCheck} onChange={this.handleChange} />
                                </InputGroup>
                                {
                                    this.state.fadeEmail && <Fade in className={'text-danger'}>이메일 형식을 다시 확인해주세요.</Fade>
                                }
                                {
                                    this.state.fadeOverlapEmail && <Fade in className={'text-danger'}>이미 사용중인 이메일입니다.</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="valword" value={this.state.valword} placeholder="영문자, 숫자, 특수문자 필수조합 8~16자" onBlur={this.valwordRegexCheck} onChange={this.handleValwordChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValword && <Fade in className={'text-danger'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <InputGroup>
                                    <Input type="password" name="valwordCheck" placeholder="비밀번호 확인" onBlur={this.valwordCheck} onChange={this.handleChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValwordCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>대표자 이름</Label>
                                <InputGroup>
                                    <Input name="name" value={this.state.name} placeholder="대표자 이름" onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>업체명</Label>
                                <InputGroup>
                                    <Input name="farmName" value={this.state.farmName} placeholder="업체명" onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>사업자등록번호</Label>
                                <InputGroup>
                                    <Input name="coRegistrationNo" value={this.state.coRegistrationNo} placeholder="'-'제외한 숫자만 입력해주세요(10자리)" onBlur={this.coRegistrationNoCheck} onChange={this.handleChange} maxLength={10} />
                                </InputGroup>
                                {
                                    this.state.fadeCoNo && <Fade in className={'text-danger'}>'-'제외한 숫자 10자리 입력해주세요</Fade>
                                }
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>주소</Label>
                                <InputGroup>
                                    <Input disabled name="shopAddress" placeholder="[주소검색]을 클릭해 주세요" value={this.state.shopAddress} onChange={this.handleChange} />
                                    <Button outline color="secondary" onClick={this.addressModalPopup}>주소검색</Button>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Input name="shopAddressDetail" placeholder="상세주소" value={this.state.shopAddressDetail || ''}  onChange={this.handleChange} />
                            </FormGroup>
                        </Col>
                    </Row>

                    <h6>필수항목 정보를 정확하게 입력해주세요</h6>
                    <br />

                    {/* B2B 판매자는 비번 일단제거 - 향후 필요시 정보관리에서 입력해서 생성..*/}

                    {/*<Row>*/}
                        {/*<Col xs={12}>*/}
                            {/*<FormGroup>*/}
                                {/*<Label>블록체인 비밀번호</Label>*/}
                                {/*<InputGroup>*/}
                                    {/*<Input type="password" name="passPhrase" readOnly value={this.state.passPhrase}  onClick={this.modalPassPhrase} placeholder="블록체인 비밀번호(숫자6자리)" maxLength="6" />*/}
                                {/*</InputGroup>*/}
                            {/*</FormGroup>*/}
                        {/*</Col>*/}
                        {/*<Col xs={12}>*/}
                            {/*<FormGroup>*/}
                                {/*<InputGroup>*/}
                                    {/*<Input type="password" name="passPhraseCheck" readOnly value={this.state.passPhraseCheck} placeholder="블록체인 비밀번호 확인" onClick={this.modalPassPhraseCheck} maxLength="6" />*/}
                                {/*</InputGroup>*/}
                                {/*{*/}
                                    {/*this.state.fadePassPhraseCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>*/}
                                {/*}*/}

                            {/*</FormGroup>*/}
                        {/*</Col>*/}
                    {/*</Row>*/}

                    {/*<h6>BLS/BLCT 환전시 사용할 비밀번호를 숫자 6자리로 입력하세요.</h6>*/}
                    {/*<h6><span className={'text-danger'}>(블록체인 특성상 블록체인 비밀번호는 변경이 불가능합니다. 분실 또는 유출되지 않도록 주의해주세요)</span></h6>*/}

                    <Terms data={this.state.terms} onClickCheck={this.handleCheckbox} onCheckAll={this.onChangeCheckAll} />

                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'primary'} onClick={this.onRegisterClick}>회원가입</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>

                <ToastContainer/>

                {/* 블록체인 비밀번호용 modal */}
                {/*<Modal isOpen={this.state.modalPassPhrase} centered>*/}
                    {/*<ModalHeader toggle={this.modalToggle}>블록체인 비밀번호</ModalHeader>*/}
                    {/*<ModalBody>*/}
                        {/*<PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>*/}
                    {/*</ModalBody>*/}
                    {/*<ModalFooter>*/}
                        {/*<Button color="primary" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6)?false:true}>확인</Button>*/}
                        {/*<Button color="secondary" onClick={this.modalToggle}>취소</Button>*/}
                    {/*</ModalFooter>*/}
                {/*</Modal>*/}

                {/* 블록체인 비밀번호 확인용 modal */}
                {/*<Modal isOpen={this.state.modalPassPhraseCheck} centered>*/}
                    {/*<ModalHeader toggle={this.modalToggleCheck}>블록체인 비밀번호 확인</ModalHeader>*/}
                    {/*<ModalBody>*/}
                        {/*<PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhraseCheck}></PassPhrase>*/}
                    {/*</ModalBody>*/}
                    {/*<ModalFooter>*/}
                        {/*<Button color="primary" onClick={this.modalToggleOk} disabled={(this.state.passPhraseCheck.length === 6)?false:true}>확인</Button>*/}
                        {/*<Button color="secondary" onClick={this.modalToggleCheck}>취소</Button>*/}
                    {/*</ModalFooter>*/}
                {/*</Modal>*/}

                {/* 주소검색 모달 */}
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.modalToggle}> 주소 검색 </ModalHeader>
                    <ModalBody>
                        <Container fluid>
                            <Row>
                                <Col xs={9} style={style.cell}>
                                    <Input name="inputAddress" type="text" placeholder="도로명 주소 입력" onChange={this.handleChange}/>
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
                        <Button color="secondary" onClick={this.addrModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </Fragment>

        );
    }
}