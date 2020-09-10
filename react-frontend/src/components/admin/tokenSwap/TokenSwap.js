import React, { Component, PropTypes } from 'react';
import { scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { allocateSwapAccount, getBlyBalanceByConsumerNo, swapBlyToBlct, swapBlctToBly } from '~/lib/swapApi'

export default class TokenSwap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ercAccount : '',
            blyBalance : 0,
            blctBalance: 0
        }
    }

    onGetErcAccount = async() => {

        // consumer로 로그인한 상태이면 consumerNo 생략가능.
        let {data:result} = await allocateSwapAccount(this.ercAccountConsumerNo.value)
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

        let {data:result} = await getBlyBalanceByConsumerNo(this.confirmBlyConsumerNo.value);
        console.log(result);
        if(result === 0) {
            alert("아직 입금 전입니다. 입금여부를 확인해주세요. ")
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

        let {data:result} = await swapBlyToBlct(blyBalance, this.confirmBlyConsumerNo.value);

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
                alert("토큰스왑이 완료되었습니다. 외부계좌에서 BLY를 확인해주세요.");
                break;
        }
    }

    onBlctBalance = async() => {
        let {data:result} = await scOntGetBalanceOfBlct(this.blctConsumerAccount.value);

        this.setState({
            blctBalance: result
        })
    }

    onWithdrawBlct = async() => {

        if(this.blctAmount.value < 100) {
            alert('최소 토큰 swap양은 100이상입니다. 토큰양을 다시 입력해주세요')
            return;
        }
        // consumer로 로그인한 상태이면 consumerNo 생략가능.
        let {data:result} = await swapBlctToBly(this.blctAmount.value, this.ercWithdrawAccount.value, this.blctConsumerNo.value);

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

    render() {
        return (
            <div className="m-4">

                <h5> 출금 </h5>
                <div className='m-4'>
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="consumerAccount"
                               ref = {(input) => {this.blctConsumerAccount = input}}
                        />
                        <button onClick = {this.onBlctBalance}> BLCT 잔액조회   </button>
                        <span className='ml-2'> {this.state.blctBalance}</span>
                    </div>
                    <br/>
                    <br/>

                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="consumerNo"
                               ref = {(input) => {this.blctConsumerNo = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="blctAmount"
                               ref = {(input) => {this.blctAmount = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="외부 ercAccount"
                               ref = {(input) => {this.ercWithdrawAccount = input}}
                        />
                        <button onClick = {this.onWithdrawBlct}> BLCT => BLY 출금요청  </button>
                    </div>
                    <br/>
                    <br/>
                </div>

                <h5> 입금 </h5>
                <div className='m-4'>
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="consmerNo"
                               ref = {(input) => {this.ercAccountConsumerNo = input}}
                        />
                        <button onClick = {this.onGetErcAccount}> 임시 ERC계좌 발급 </button>
                        <span id="userAccount" className='ml-2'> {this.state.ercAccount}</span>
                    </div>
                    <br/>
                    <br/>

                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="consmerNo"
                               ref = {(input) => {this.confirmBlyConsumerNo = input}}
                        />
                        <button onClick = {this.onGetBlyBalance}> 입금확인 및 환전 </button>
                        <span id="userAccount" className='ml-2'> {this.state.blyBalance}</span>
                    </div>
                    <br/>
                    <br/>

                </div>
            </div>
        )
    }
}