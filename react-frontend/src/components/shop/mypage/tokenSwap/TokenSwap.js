import React, { Component, PropTypes } from 'react';
import { scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { checkPassPhrase } from '~/lib/loginApi'
import { BlockChainSpinner, BlocerySpinner, PassPhrase } from '~/components/common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import { allocateSwapAccount, getBlyBalanceByConsumerNo, swapBlyToBlct, swapBlctToBly } from '~/lib/swapApi'
import { toChecksumAddress, isValidAddress, isValidChecksumAddress } from 'ethereumjs-util';

export default class TokenSwap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ercAccount : '',
            blyBalance : 0,
            blctBalance: 0,
            modal:false,                //모달 여부
            modalType: '',              //모달 종류
            passPhrase: '', //비밀번호 6 자리 PIN CODE
            clearPassPhrase: false,
            chainLoading: false
        }
    }

    onGetErcAccount = async() => {

        // consumer로 로그인한 상태이면 consumerNo 생략가능.

        let {data:result} = await allocateSwapAccount()
        // let result = await getErcAccount(this.ercAccountConsumerNo.value)
        console.log(result);
        if('' !== result)
            alert("계좌발급이 완료되었습니다. 임시계좌로 오늘 자정까지 유효하니 오늘 내로 송금하세요.")

        this.setState({
            ercAccount: result
        })
    }

    onGetBlyBalance = async() => {

        // consumer로 로그인한 상태이면 consumerNo 생략가능.

        let {data:result} = await getBlyBalanceByConsumerNo();
        console.log(result);
        if(result === 0) {
            alert("잔액이 없습니다. 입금여부를 확인해주세요. ")
        } else {
            let confirmResult = window.confirm(result + 'BLY가 입금되었습니다. 완료확인을 하시면 '+ result +'BLCT로 환전이 완료됩니다.');
            if(confirmResult){
                this.onConfirmBly(result);
            }
        }
        this.setState({
            blyBalance: result
        })
    }

    onConfirmBly = async(blyBalance) => {

        // consumer로 로그인한 상태이면 consumerNo 생략가능.

        this.setState({chainLoading: true});

        let {data:result} = await swapBlyToBlct(blyBalance);

        this.setState({chainLoading: false});

        // * 0    controller에서 로그인체크시 Null
        // * 200  성공
        // * 100  스왑진행중
        // * 101  사용자의 BLCT를 manager에게 전송 실패. 사용자가 스왑자체를 다시 요청해야함.

        switch (result) {
            case 0:
                alert("로그인 해주세요");
                break;
            case 100 :
                alert("이미 토큰스왑이 진행중입니다. 결과를 기다려주세요.");
                break;
            case 101 :
                alert("BLCT를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.");
                break;
            case 200 :
                alert("토큰스왑이 완료되었습니다. 마이페이지의 자산을 확인해주세요.");
                break;
        }
    }

    onWithdrawBlct = async() => {
        try {
            let ethAccount = toChecksumAddress(this.ercWithdrawAccount.value);
            let result = isValidAddress(ethAccount)
            console.log(result);

            if (!isValidAddress(ethAccount)) {
                alert("올바른 이더리움 주소가 아닙니다 ");
                return;
            }
        } catch(e) {
            console.log(e)
            alert("올바른 이더리움 주소가 아닙니다 ");
            return;
        }

        // if(!isValidChecksumAddress(ethAccount)) {
        //     alert("올바른 이더리움 체크섬 주소가 아닙니다 ");
        //     return;
        // }

        // TODO kyc 레벨에 따라 최대 송금토큰도 체크해야 함.
        if(this.blctAmount.value < 100) {
            alert('최소 토큰 swap양은 100이상입니다. 토큰양을 다시 입력해주세요')
            return;
        }

        // 블록체인 비밀번호 입력받기.
        this.setState({
            modal:true, //결제비번창 오픈. //////////////////////////
            modalType: 'pay'
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
        let {data:result} = await swapBlctToBly(this.blctAmount.value, this.ercWithdrawAccount.value, this.ercWithdrawMemo.value);

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
                alert("로그인 해주세요");
                break;
            case -1 :
                alert("BLCT 잔액이 부족합니다.");
                break;
            case 100 :
                alert("이미 토큰스왑이 진행중입니다. 결과를 기다려주세요.");
                break;
            case 101 :
                alert("BLCT를 전송하는 중 오류가 발생했습니다. 다시 시도해주세요.");
                break;
            case 102 :
                alert("토큰스왑이 완료되었습니다. 외부계좌로 BLY가 입금되기까지 시간이 걸릴 수 있습니다.");
                break;
            case 200 :
                alert("토큰스왑이 완료되었습니다. 외부계좌에서 BLY를 확인해주세요.");
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


    render() {
        return (
            <div className="m-4">
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <h5> 출금 </h5>
                <div className='m-4'>

                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="blctAmount"
                               ref = {(input) => {this.blctAmount = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="외부 ercAccount"
                               ref = {(input) => {this.ercWithdrawAccount = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="memo"
                               ref = {(input) => {this.ercWithdrawMemo = input}}
                        />
                        <button onClick = {this.onWithdrawBlct}> BLCT => BLY 출금요청  </button>
                    </div>
                    <br/>
                    <br/>
                </div>

                <h5> 입금 </h5>
                <div className='m-4'>
                    <div className='d-flex align-items-center'>
                        <button onClick = {this.onGetErcAccount}> 임시 ERC계좌 발급 </button>
                        <span id="userAccount" className='ml-2'> {this.state.ercAccount}</span>
                    </div>
                    <br/>
                    <br/>

                    <div className='d-flex align-items-center'>
                        <button onClick = {this.onGetBlyBalance}> 입금확인 및 환전 </button>
                        <span id="userAccount" className='ml-2'> {this.state.blyBalance}</span>
                    </div>
                    <br/>
                    <br/>

                </div>

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

            </div>
        )
    }
}