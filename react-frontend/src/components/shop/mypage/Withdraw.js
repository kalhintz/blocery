import React, { Component, Fragment } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
import { ShopXButtonNav } from '../../common'
import { Div, Span, Input, Button, Flex, Hr } from '~/styledComponents/shared'
import { BlockChainSpinner, PassPhrase } from '~/components/common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { toChecksumAddress, isValidAddress } from 'ethereumjs-util';
import { swapBlctToBly, getTodayAmountBlctToBly } from '~/lib/swapApi'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { scOntGetBalanceOfBlct } from "~/lib/smartcontractApi";
import { checkPassPhrase } from '~/lib/loginApi'
import { getConsumer } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil';
import { Webview } from '~/lib/webviewApi'

import { Badge } from "~/styledComponents/mixedIn";
import {getValue} from "../../../styledComponents/Util";
import styled from 'styled-components'

import {color, activeColor} from "~/styledComponents/Properties";

import {FaPaste, FaQrcode} from 'react-icons/fa'

const HeadingLayout = styled(Flex)`
    justify-content: space-between;
    align-items: flex-end;
    font-size: ${getValue(15)};
    margin-bottom: ${getValue(20)};
`;

const OutBox = styled(Flex)`
    border: 1px solid ${color.light};
    
    & > div:first-child {
        
        width: 100%;
        & input {
            border: 0;
            padding-left: 13px;
            width: 100%;
        }
    }
    & > div:last-child {
        flex-shrink: 0;
        width: 50px;
        border-left: 1px solid ${color.light};
        
        & button {
            border: 0;
            background-color: rgba(0,0,0,0);
            width: 100%;
            
            &:active {
                background-color ${activeColor.light};
                color: ${color.white};
            }
        }
    }
`;
const Card = styled(Div)`
    background: ${color.white};
    border-radius: ${getValue(6)};
    margin-bottom: ${getValue(16)};
    padding: ${getValue(25)} ${getValue(16)};
`;

export default class Withdraw extends Component {
    constructor(props){
        super(props)
        this.state = {
            consumerAccount: null,
            ercAccount : '',
            withdrawAmount : '',
            blctBalance: 0,
            blctToWon: 0,
            modal:false,                //모달 여부
            modalType: '',              //모달 종류
            passPhrase: '', //비밀번호 6 자리 PIN CODE
            clearPassPhrase: false,
            chainLoading: false,
            maxAmount: 1250,
            kycLevel: 0,
            todayRemainedAmount: 0,
            memo: '',
            // withdrawAmountError: false,
            errorText: '',
            accountOk: null,
            withdrawOk: null,

        }

        this.withdrawAmountRef = React.createRef()
    }

    componentDidMount = () => {

        // android 수신 이벤트(android)
        window.document.addEventListener('message', this.onMessageListener );

        // ios 수신 이벤트(ios)
        window.addEventListener('message', this.onMessageListener );

        this.getConsumerTokenInfo();
    }

    componentWillUnmount = () => {

        // android 수신 이벤트(android)
        window.document.removeEventListener('message', this.onMessageListener );

        // ios 수신 이벤트(ios)
        window.removeEventListener('message', this.onMessageListener );
    }

    getConsumerTokenInfo = async() => {
        let {data:loginUser} = await getConsumer();
        console.log(loginUser);

        if(loginUser && loginUser.account) {
            let {data:blctBalance} = await scOntGetBalanceOfBlct(loginUser.account);

            let maxAmount = 1250;
            if(loginUser.kycLevel === 1) {
                maxAmount = 250000;
            }

            let {data:todayAmount} = await getTodayAmountBlctToBly();
            // console.log('todayAmount : ', todayAmount);

            let todayRemainedAmount = maxAmount - todayAmount;
            // console.log('todayRemainedAmount : ', todayRemainedAmount);

            let kycLevel = loginUser.kycLevel ? loginUser.kycLevel : 0;

            const {data:blctToWon} = await BLCT_TO_WON();

            this.setState({
                kycLevel: kycLevel,
                consumerAccount: loginUser.account,
                blctBalance: blctBalance,
                blctToWon: blctToWon,
                maxAmount: maxAmount,
                todayRemainedAmount: todayRemainedAmount
            });
        }
    }

    onWithdrawBlct = async() => {

        if(!this.checkErcAccount(this.state.ercAccount) || !this.checkWithdrawAmount(this.state.withdrawAmount)) {
            return;
        }

        // 다시한번 주소와 토큰금액 확인하기. confirm
        let confirmText = this.state.ercAccount + "로 " + ComUtil.toCurrency(this.state.withdrawAmount) + "BLY 을 출금하시겠습니까?";
        if(!window.confirm(confirmText)) return;

        // 블록체인 비밀번호 입력받기.
        this.setState({
            modal:true, //결제비번창 오픈. //////////////////////////
            modalType: 'pay',
            passPhrase: ''  //비밀번호 초기화
        });

    }

    //결재처리
    modalToggleOk = async () => {
        let passPhrase = this.state.passPhrase;
        let {data: checkResult} = await checkPassPhrase(passPhrase);
        console.log("checkPassPhrase : ", checkResult);
        if (!checkResult) {
            this.notify('결제 비번이 틀렸습니다.', toast.warn);

            //결제 비번 초기화
            this.setState({clearPassPhrase: true});

            return; //결제 비번 오류
        }

        //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
        this.setState({
            modal: false,
            chainLoading: true
        });

        // consumer로 로그인한 상태이면 consumerNo 생략가능.
        let {data:result} = await swapBlctToBly(this.state.withdrawAmount, this.state.ercAccount, this.state.memo);

        this.setState({chainLoading: false});

        console.log("swapBlctToBly result : ", result);

        // * 0    controller에서 로그인체크시 Null
        // * 200  성공
        // * -1   잔액부족
        // * 100  스왑진행중
        // * 101  사용자의 BLCT를 manager에게 전송 실패. 사용자가 스왑자체를 다시 요청해야함.
        // * 102  사용자의 BLCT는 manager에게 전송 성공했는데 외부계좌로 BLY 송금 실패 (수동전송 필요)
        // * 103  BLCT, BLY 모두 전송 후 마지막 DB update시 데이터 없어서 실패(이건 생기면 안되는 상황)

        switch (result) {
            case 0:
                this.notify('로그인 해주세요', toast.error);
                this.moveToMypage();
                break;
            case -1 :
                this.notify('BLCT 잔액이 부족합니다.', toast.error);
                break;
            case 100 :
                this.notify('이미 출금이 진행중입니다. 결과를 기다려주세요.', toast.warn);
                break;
            case 101 :
                this.notify('BLCT를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.', toast.error);
                break;
            case 102 : // 내부 출금은 완료되었으나 외부 전송이 오류나서 수동으로 해주어야함. 사용자에게는 완료메시지 전송
            case 200 :
                alert('출금요청 완료 : 출금이 완료되면 이메일 및 push로 알려드립니다.');
                this.moveToTokenHistory()
                break;
        }
    }


    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        //console.log(passPhrase);
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    // 결제 비밀번호 힌트
    findPassPhrase = () => {
        this.setState({
            modalType: 'passPhrase',
            modal: true
        })
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }


    moveToTokenHistory = () => {
        this.props.history.goBack();
    }

    onSetMaxBlyAmount = () => {

        //잔고
        let withdrawAmount = this.state.blctBalance

        //남은 일한도
        const todayRemainedAmount = this.state.todayRemainedAmount

        console.log({withdrawAmount,todayRemainedAmount})

        //잔고가 일한도 초과 일 경우
        if (ComUtil.toNum(withdrawAmount) > ComUtil.toNum(todayRemainedAmount)){
            console.log("===================================")
            withdrawAmount = todayRemainedAmount
        }

        this.checkWithdrawAmount(withdrawAmount)

        this.setState({
            withdrawAmount: withdrawAmount,
            // withdrawOk: this.checkErcAccount(this.state.ercAccount),
        })

        //ref 로 변경
        this.withdrawAmountRef.value = withdrawAmount
    }

    onChangeAddress = (e) => {

        console.log('onChangeAddress', this.state.withdrawAmount, (this.checkErcAccount(e.target.value) && (this.state.withdrawAmount || 0) >= 100))

        const ercAccount = e.target.value;

        this.checkErcAccount(ercAccount)

        this.setState({
            ercAccount: ercAccount,
            // accountOk: false,
            // withdrawOk: (this.checkErcAccount(e.target.value) && (this.state.withdrawAmount || 0) >= 100)
        })
        // console.log(account);
    }

    onKeyupWithdrawAmount = e => {
        // var charCode = (e.which) ? e.which : e.keyCode;

        let amount = e.target.value;
        // if (amount && amount.indexOf('.') > 0 && amount.substr(amount.indexOf('.')).length > 3 ) {
        //     this.notify('소수점 2자리까지 입력됩니다', toast.warn);
        //     return;
        // }
        //
        // this.checkWithdrawAmount(e.target.value);

        // let pattern = /^\d+(?:[.]?[\d]?[\d]?[\d]?[\d]?[\d]?[\d]?[\d]?[\d])?$/;
        // if (!pattern.test(amount)) {
        //     return false;
        // }

        // 소수점 둘째자리까지만 입력가능
        let _pattern2 = /^\d*[.]\d{9}$/; // 현재 value값이 소수점 둘째짜리 숫자이면 더이상 입력 불가
        if (!_pattern2.test(amount)) {
            return false;
        }

    }

    checkWithdrawAmount = (amount) => {

        let errorText = ''
        let withdrawOk = true

        if (this.state.blctBalance < amount) {
            errorText = `최대출금 수량은 ${ComUtil.addCommas(this.state.blctBalance)} 입니다`
            withdrawOk = false
        }else if(amount < 100) {
            errorText = '출금금액은 최소 100 BLY 입니다.'
            withdrawOk = false
        } else if(amount > this.state.todayRemainedAmount) {
            errorText = '일일 출금한도인 ' + this.state.maxAmount + 'BLY를 넘었습니다'
            withdrawOk = false
        }

        this.setState({
            errorText: errorText,
            withdrawOk: withdrawOk,
        })

        return withdrawOk
    }

    checkErcAccount = (account) => {

        let accountOk = true


        if(account.length === 0) {
            accountOk = false
        }

        try {
            let ethAccount = toChecksumAddress(account);
            if (!isValidAddress(ethAccount)) {
                accountOk = false
            }
        } catch(e) {
            accountOk = false
        }

        this.setState({
            accountOk: accountOk
        })

        return accountOk
    }

    onChangeMemo = (e) => {
        this.setState({
            memo: e.target.value
        })
    }

    qrcodeScan = () => {
        if(ComUtil.isMobileApp()) {
            Webview.qrcodeScan();
        } else {
            alert('폰에서만 가능합니다')
        }
    }

    //QR코드, 클립보드 이벤트 수신자 (erc
    onMessageListener = (e) => {

        try{
            // console.log(e);
            const data = JSON.parse(e.data);
            Webview.appLog(data.accountFromPhone);

            this.checkErcAccount(data.accountFromPhone)

            this.setState({
                ercAccount: data.accountFromPhone,
                // withdrawOk: (this.checkErcAccount(data.accountFromPhone) && this.state.withdrawAmount >= 100)
            })
        } catch(e) {}
    }

    onAccountPaste = async (e) => {

        if(ComUtil.isMobileAppAndQrEnabled()) {
            Webview.clipboardPaste();

        } else {
            const text = await navigator.clipboard.readText();
            this.setState({
                ercAccount: text,
                withdrawOk: (this.checkErcAccount(text) && this.state.withdrawAmount >= 100)
            })
        }

    }

    minusFee50 = () => {
        let amountStr = this.state.withdrawAmount.toString();
        let splitAmount = amountStr.split(".");
        let split1 = ComUtil.toCurrency(parseInt(splitAmount[0])-50);
        if(splitAmount.length > 1) {
            let split2 = splitAmount[1];
            return split1 + "." + split2;
        } else {
            return split1;
        }
    }


    onWithdrawChange = (e) => {
        const value = ComUtil.getBlyNumber(e.target.value)
        this.checkWithdrawAmount(value)
        this.setState({
            withdrawAmount: value
        })
        e.target.value = value
    }

    render() {
        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <ShopXButtonNav underline historyBack>출금</ShopXButtonNav>

                <Div p={15} bg={'background'} fg={'darkBlack'} fontSize={12} lineHeight={20}>
                    <Span>블록체인 네트워크 상태에 따라 자산이 해당 지갑에 완전히 전송되기까지 다소 시간이 걸릴 수 있습니다.</Span>
                </Div>
                <Hr/>

                <Div p={16} bg={'backgroundDark'}>

                    <Flex mt={16} mb={32} textAlign={'center'}>
                        <Div width={'50%'} bc={'dark'} bl={0} bt={0} bb={0}>
                            <Div fontSize={12} mr={8} mb={5}>보유 자산(BLY) </Div>
                            <Div fontSize={15} bold fg={'green'}>{ComUtil.toCurrency(this.state.blctBalance)}</Div>
                        </Div>
                        <Div width={'50%'}>
                            <Div fontSize={12} mr={8} mb={5}>가치평가(KRW)</Div>
                            <Div fontSize={15} bold fg={'green'}>{ComUtil.addCommas(ComUtil.roundDown(this.state.blctBalance * this.state.blctToWon, 2))}</Div>
                        </Div>

                    </Flex>



                    <Card>
                        <HeadingLayout>
                            <Div fontSize={16} fw={500}>출금금액</Div>
                            <Div fontSize={12} fg={'adjust'}>수수료 50BLY</Div>
                        </HeadingLayout>


                        <Div bc={'green'} rounded={5} mb={10}>
                            <Flex  fg={'darkBlack'}  justifyContent={'space-between'}>
                                <Div flexGrow={1}>
                                    <Input
                                        type={'number'}
                                        ref={el => this.withdrawAmountRef = el}
                                        style={{borderColor: 'white'}} bc={'white'} block placeholder={'최소 100BLY'}
                                        onChange={this.onWithdrawChange}
                                        onBlur={this.onWithdrawChange}
                                    />
                                </Div>
                                <Flex pr={10} fontSize={12} flexShrink={0}>
                                    <Div mr={10}>BLY</Div>
                                    <Button px={10} rounded={2} bg={'green'} fg={'white'} textAlign={'center'} onClick={this.onSetMaxBlyAmount} >최대</Button>
                                </Flex>
                            </Flex>
                            <Div fg={'adjust'} px={13} fontSize={12} pb={5}>
                                ₩{ComUtil.addCommas(ComUtil.roundDown(this.state.withdrawAmount * this.state.blctToWon, 2))}
                            </Div>
                        </Div>


                        {
                            this.state.withdrawOk !== null && <Div mb={10}><Fade in={!this.state.withdrawOk} className="text-danger small mt-1" >{this.state.errorText}</Fade></Div>
                        }

                        <Flex fontSize={11}>
                            {
                                this.state.kycLevel === 0 ?
                                    <Badge fg={'white'} bg={'adjust'}> KYC인증 전 </Badge>
                                    :
                                    <Badge fg={'white'} bg={'green'}> KYC인증 완료 </Badge>
                            }
                            <Div ml={5} fg={'adjust'}> 일 한도 {ComUtil.toCurrency(ComUtil.toNum(this.state.todayRemainedAmount))} / {ComUtil.toCurrency(this.state.maxAmount)} BLY</Div>
                        </Flex>
                    </Card>

                    <Card>
                        <HeadingLayout>
                            <Div fontSize={16} fw={500}>지갑주소</Div>
                            <Flex fontSize={12} style={{marginBottom: -13}}>
                                {(ComUtil.isMobileAppAndQrEnabled()) && (
                                    <>
                                    <Button bg={'green'} fg={'white'} py={3} px={8} rounded={2} mr={3} onClick={this.onAccountPaste} >
                                        <Flex><Span mr={3}><FaPaste /></Span>붙여넣기</Flex>
                                    </Button>
                                    <Button bg={'green'} fg={'white'} py={3} px={8} rounded={2} onClick={this.qrcodeScan} >
                                        <Flex><Span mr={3}><FaQrcode/></Span>QR</Flex>
                                    </Button>
                                    </>
                                )}
                            </Flex>
                        </HeadingLayout>


                        <Input block green placeholder={'주소입력 또는 붙여넣기'} style={{fontSize:11}} value={this.state.ercAccount} onChange={this.onChangeAddress}/>
                        {
                            this.state.accountOk !== null && <Div mb={10}><Fade in={!this.state.accountOk} className="text-danger small mt-1" >지갑주소를 정확하게 입력해 주시기 바랍니다.</Fade></Div>
                        }
                    </Card>


                    <Card>
                        <HeadingLayout fw={500}>메모</HeadingLayout>
                        <Input block placeholder={'메모 입력 시 내역에 표시(필수 아님)'} maxLength={25} onChange={this.onChangeMemo}/>
                    </Card>


                    <Card fontSize={12}>
                            <Flex>
                                <Div width={100}>출금요청금액</Div>
                                <Div>{' : '}{ this.state.withdrawAmount > 0 && `${ComUtil.toCurrency(this.state.withdrawAmount)} BLY` }</Div>
                            </Flex>
                            <Flex>
                                <Div width={100}>수  수  료</Div>
                                <Div>{`  :  50 BLY`}</Div>
                            </Flex>
                            <Flex>
                                <Div width={100}>최종 출금금액</Div>
                                <Div>{' : '}{ this.state.withdrawAmount >99.99 && `${this.minusFee50()} BLY` }</Div>
                            </Flex>

                        {/*<Button my={20} bg={'green'} fg={'white'} py={12} block rounded={3} disabled={!this.state.withdrawOk || !this.state.accountOk} onClick={this.onWithdrawBlct} >확인</Button>*/}


                        <Button  mt={16} fontSize={16} bg={'green'} fg={'white'} rounded={2} block py={12} disabled={!this.state.withdrawOk || !this.state.accountOk} onClick={this.onWithdrawBlct} >출금신청하기</Button>

                    </Card>
                </Div>


                <ToastContainer/>
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 결제비밀번호 입력</ModalHeader>
                    <ModalBody className={'p-0'}>
                        {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* 결제비밀번호 조회 */}
                <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                    <ModalHeader>결제비밀번호 안내</ModalHeader>
                    <ModalBody>
                        마이페이지에서 결제비밀번호 힌트 조회 후 이용해주세요.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }
}