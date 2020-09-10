import React, { Component, PropTypes } from 'react';
import { scOntTransferManagerBlct, scOntGetTotalBlsGuarantyBlct, scOntGetBalanceOfBlct, scOntGetManagerOngBalance, scOntManagerSendBlctToManager,
    scOntTransferManagerBlctToMany, scOntUserSendBlctToManager, scOntTransferUserBlctFromMany, scOntTransferManagerBlctToManyAccounts, scOntTransferManagerTokenToManyAccount } from '~/lib/smartcontractApi';
import { getConsumerAccountByEmail, getAllConsumerToken, getAllProducerToken } from '~/lib/adminApi'
import { getBlyBalanceByAccount, sendManagerBlyToUser, sendUserBlytToManager, getEthBalance, sendEth, updateSwapBlctToBlySuccess, copyErcAccountToErcHistory} from '~/lib/swapApi'
import { isTokenAdminUser } from '~/lib/loginApi'
import { Server } from '~/components/Properties';
import axios from 'axios';

export default class SetToken extends Component{

    constructor(props) {
        super(props);
        this.state = {
            account:'address',
            managerAccount: '',
            managerBlct: '-',
            managerOng: '-',
            sendKakao: false,
            ethAccount: '',
            tokenBalance: 0,
            ethBalance: 0,
            allConsumerTokens: 0,
            allProducerTokens: 0,
        }
    }

    async componentDidMount() {
        let {data:result} = await isTokenAdminUser();
        if (!result) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.getBaseAccount();
        await this.getManagerBalances();
    }

    getManagerBalances = async() => {
        console.log('manager Account : ' , this.state.managerAccount);

        let {data:managerOng} = await scOntGetManagerOngBalance();
        let {data:managerBlct} = await scOntGetBalanceOfBlct(this.state.managerAccount);

        this.setState({
            managerBlct: managerBlct,
            managerOng: managerOng
        })
    };

    getBaseAccount = async () => {
        //ropsten에서는 getAccounts 동작하지 않을 수도 있기 때문에 안전하게 backend 이용.
        return axios(Server.getRestAPIHost() + '/baseAccount',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        ).then((response) => {
            console.log('baseAccount response : ', response);
            this.setState({
                managerAccount: response.data
            })
        });
    }

    // email로 account 조회
    onGetAccount = async() => {
        // account 조회해오기
        let {data:consumerInfo} = await getConsumerAccountByEmail(this.getAccountEmail.value);
        console.log(consumerInfo);
        let userAccount = document.getElementById('userAccount');
        if(consumerInfo.account) {
            this.setState({
                account: consumerInfo.account
            })
        } else {
            this.setState({
                account: '회원가입이 되어있지 않은 email입니다 '
            });
        }
    };

    // 토큰 잔액조회
    onGetBalanceOfBlct = async () => {

        let result ;
        if(this.getBalanceOfBlctAccount.value) {
            result  = await scOntGetBalanceOfBlct(this.getBalanceOfBlctAccount.value);
        } else {
            result  = await scOntGetBalanceOfBlct(this.getBalanceOfBlctAccount.placeholder);
        }
        let userAccount = document.getElementById('userBalanceBlct');
        userAccount.textContent = result.data;
    };


    // 관리자가 사용자에게 토큰 지급하기
    onGiveUserToken = async() => {

        let address;
        let amount;
        if(this.giveUserAddress.value) {
            address = this.giveUserAddress.value;
        } else {
            address = this.giveUserAddress.placeholder;
        }

        if (this.giveUserAmount.value) {
            amount = this.giveUserAmount.value;
        } else {
            amount = this.giveUserAmount.placeholder;
        }

        let {data} = await scOntTransferManagerBlct(address, amount);
        console.log('data : ', data);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        }
    };

    onGiveManyToken = async(buttonNo) => {

        let originEmailList = this.giveManyAddresses1.value.split(',');

        let emailList = new Array();
        for(let i = 0 ; i < originEmailList.length ; i++ ) {
            if(originEmailList[i].trim().length > 0)
                emailList[i] = originEmailList[i].trim();
        }

        console.log('emailList : ', emailList);

        if(emailList.length > 15) {
            alert(emailList.length + '명 입력. 최대 전송인원은 15명을 초과했습니다')
            return;
        }

        let {data} = await scOntTransferManagerBlctToMany(this.eventTitle.value, this.eventSubTitle.value, emailList, this.giveManyAmount.value, this.state.sendKakao);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
    }

    onGiveManyTokenAccount = async() => {
        let originAccountList = this.giveManyAccount.value.split(',');
        let accountList = new Array();
        for(let i = 0 ; i < originAccountList.length ; i++ ) {
            if(originAccountList[i].trim().length > 0)
                accountList[i] = originAccountList[i].trim();
        }

        console.log('accountList : ', accountList);

        if(accountList.length > 15) {
            alert(accountList.length + '명 입력. 최대 전송인원은 15명을 초과했습니다')
            return;
        }

        let {data} = await scOntTransferManagerTokenToManyAccount(this.eventTitleAccount.value, this.eventSubTitleAccount.value, accountList, this.giveManyAmountAccount.value);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
    }

    onGiveManyCobakToken = async(buttonNo) => {

        let originAccountList = this.giveCobakAccount1.value.split(',');

        let accountList = new Array();
        for(let i = 0 ; i < originAccountList.length ; i++ ) {
            if(originAccountList[i].trim().length > 0)
                accountList[i] = originAccountList[i].trim();
        }

        console.log(accountList,  this.giveCobakAmount.value);

        // if(accountList.length > 15) {
        //     alert(accountList.length + '명 입력. 최대 전송인원은 15명을 초과했습니다')
        //     return;
        // }

        let {data} = await scOntTransferManagerBlctToManyAccounts(accountList, this.giveCobakAmount.value);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
    }

    onTakeManyToken = async(buttonNo) => {

        let originEmailList = this.takeManyAddresses1.value.split(',');

        let emailList = new Array();
        for(let i = 0 ; i < originEmailList.length ; i++ ) {
            if(originEmailList[i].trim().length > 0)
                emailList[i] = originEmailList[i].trim();
        }

        let {data} = await scOntTransferUserBlctFromMany(emailList, this.takeManyAmount.value);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
    }



    onGetTotalBlsGuarantyBlct = async() => {
        let {data : result}  = await scOntGetTotalBlsGuarantyBlct();
        console.log('onGetTotalBlsGuarantyBlct : ', result);

    }

    onSendUserToken = async() => {

        if(this.sendUserAddress.value) {
            let result  = await scOntUserSendBlctToManager(this.sendUserAddress.value, this.sendUserAmount.value);

            if(result) {
                alert('토큰이 성공적으로 지급되었습니다');
            } else {
                alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
            }

        } else {
            let placeResult  = await scOntUserSendBlctToManager(this.sendUserAddress.placeholder, this.sendUserAmount.value);

            if(placeResult) {
                alert('토큰이 성공적으로 지급되었습니다');
            } else {
                alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
            }
        }

    }

    onSendM2MToken = async() => {
        let result  = await scOntManagerSendBlctToManager(this.sendManagerEmail.value, this.sendManagerAmount.value);

        if(result) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
    }

    onSendKakao = (e) => {
        this.setState({
            sendKakao: e.target.checked
        })
    }

    // onGetNewEthAccount = async() => {
    //     console.log("newEthAccount", this.newEthAccountEmail.value)
    //     let {data:result} = await newEthAccount(this.newEthAccountEmail.value)
    //     this.setState({
    //         ethAccount : result
    //     })
    // }

    onGetBlyBalance = async() => {
        console.log(this.ownerAccount.value)
        let {data:result} = await getBlyBalanceByAccount(this.ownerAccount.value)
        this.setState({
            tokenBalance : result
        })
    }

    onGetEthBalance = async() => {
        console.log(this.ownerAccount.value)
        let {data:result} = await getEthBalance(this.ownerAccount.value)
        this.setState({
            ethBalance : result
        })
    }



    onSendManagerBlyToUser = async() => {
        let {data:result} = await sendManagerBlyToUser(this.blyReceiverAddress.value, this.blyAmount.value)
        console.log(result);
        alert('swapBlctToBly update시 txHash 값을 복사해서 저장해야 합니다 ' + result);
    }

    onSendEthToUser = async() => {
        let {data:result} = await sendEth(this.ethReceiverAddress.value)
        console.log(result);
        alert(result);
    }

    onSendUserBlytToManager = async() => {
        let {data:result} = await sendUserBlytToManager(this.blyUserAddress.value, this.blyUserPk.value, this.userBlyAmount.value)
        console.log(result);
        alert(result);
    }

    // onAddEthAccount = async() => {
    //     let {data:result} = await addTempEthAccount(this.tempEthAccount.value, this.tempEthPk.value)
    //     console.log(result);
    //
    // }
    //
    // onGetEthAccount = async() => {
    //     let {data:result} = await getErcAccoutInfoList()
    //     console.log(result)
    // }

    onUpdateSwapBlctToBlySuccess = async() => {
        let {data:result} = await updateSwapBlctToBlySuccess(this.swapBlctToBlyNo.value, this.swapBlctToBlyTxHash.value);
        if(result) {
            alert('update에 성공했습니다')
        } else {
            alert('update에 실패했습니다. swapBlctToBly DB에 해당 번호가 존재하는지 확인해주세요.')
        }
    }

    onGetAllConsumerToken = async() => {
        console.log("onGetAllConsumerToken 시작");
        let {data:result} = await getAllConsumerToken();

        this.setState({
            allConsumerTokens: result
        })
    }

    onGetAllProducerToken = async() => {
        console.log("onGetAllProducerToken 시작");
        let {data:result} = await getAllProducerToken();

        this.setState({
            allProducerTokens: result
        })
    }

    onCopyErcAccountToErcHistory = async() => {
        let {data:result} = await copyErcAccountToErcHistory();
        if(result) {
            alert("table 복사가 완료되었습니다")
        } else {
            alert("이미 SwapErcHistory table이 존재합니다.")
        }
    }

    render() {

        const styles = {
            redText : { color: 'red' },
            blueText : { color: 'blue' },
            blackText : { color: 'black' }
        };

        const ColoredLine = ({ color }) => (
            <hr
                style={{
                    color: color,
                    backgroundColor: color,
                    height: 1
                }}
            />
        );

        return (
            <div>

                <h5> 블록체인 기본 설정 </h5>
                <div className='m-2'>
                    Manager account : {this.state.managerAccount} <br/>
                    Manager ONG : <span style={styles.blueText}>{this.state.managerOng}</span> <br/>
                    Manager BLCT : <span style={styles.blueText}>{this.state.managerBlct} </span> <br/>
                </div>

                <ColoredLine color="green"/>
                <h5> 사용자 토큰 설정 </h5>
                <div className='m-2'>
                    1. 사용자 account 조회(b2c consumer만 가능) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="email주소"
                               ref = {(input) => {this.getAccountEmail = input}}
                        />
                        <button onClick = {this.onGetAccount}> account조회   </button>
                        <span id="userAccount" className='ml-2'> {this.state.account}</span>
                    </div>
                    <br/>

                    2. 해당 account의 토큰잔액 조회 <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder={this.state.account}
                               ref = {(input) => {this.getBalanceOfBlctAccount = input}}
                        />
                        <button onClick = {this.onGetBalanceOfBlct}> BLCT 잔액조회   </button>
                        <span id="userBalanceBlct" className='ml-2'> 토큰잔액</span>
                    </div>
                    <br/>

                    3. 해당 account에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder={this.state.account}
                               ref = {(input) => {this.giveUserAddress = input}}
                        />
                        <input className='m-0 w-auto' type="text" placeholder="1000"
                               ref = {(input) => {this.giveUserAmount = input}}
                        />
                        <button onClick = {this.onGiveUserToken}> 사용자 BLCT지급   </button>
                    </div>
                    <br/>

                    3.1 사용자 account에서 manager로 BLCT전송 (토큰 지급이 완료되면 알림창을 확인해야 합니다) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder={this.state.account}
                               ref = {(input) => {this.sendUserAddress = input}}
                        />
                        <input className='m-0 w-auto' type="text" placeholder="0"
                               ref = {(input) => {this.sendUserAmount = input}}
                        />
                        <button onClick = {this.onSendUserToken}> 사용자의 BLCT manager에게 전송   </button>
                    </div>
                    <br/>

                    3.2 manager에서(profit, tempProducer 등) ecoSystem로 BLCT전송 (토큰 지급이 완료되면 알림창을 확인해야 합니다) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder='manager Email'
                               ref = {(input) => {this.sendManagerEmail = input}}
                        />
                        <input className='m-0 w-auto' type="text" placeholder="0"
                               ref = {(input) => {this.sendManagerAmount = input}}
                        />
                        <button onClick = {this.onSendM2MToken}> 다른 매니저의 BLCT를 eco manager에게 전송   </button>
                    </div>
                    <br/>

                    <div className='d-flex'>
                        <span> 4. 여러 email(consumer)에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) </span>
                        <input id={'sendKakao'} type="checkbox" className={'m-2'} color={'default'} checked={this.state.sendKakao} onChange={this.onSendKakao} />
                        <label for={'sendKakao'} className='text-secondary '>카카오톡 발송</label>
                    </div>
                    {/*<br />*/}
                    <div className='d-flex'>
                        <input className='m-0 w-25' type="text" placeholder="이벤트 제목 (토큰내역에 보여질 진한 제목)"
                               ref = {(input) => {this.eventTitle = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="이벤트 상세제목 (토큰내역에 보여질 작은 설명)"
                               ref = {(input) => {this.eventSubTitle = input}}
                        />
                        <input className='m-0 w-auto' type="text" placeholder="100"
                               ref = {(input) => {this.giveManyAmount = input}}
                        />
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 1"
                               ref = {(input) => {this.giveManyAddresses1 = input}}
                        />
                        <button onClick = {this.onGiveManyToken.bind(this, 1)}> 여러명 BLCT지급 - 1  </button>
                    </div>

                    <br/>
                    <br/>

                    <div className='d-flex'>
                        <span> 4-1. 여러 account(consumer)에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) </span>
                    </div>
                    {/*<br />*/}
                    <div className='d-flex'>
                        <input className='m-0 w-25' type="text" placeholder="이벤트 제목 (토큰내역에 보여질 진한 제목)"
                               ref = {(input) => {this.eventTitleAccount = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="이벤트 상세제목 (토큰내역에 보여질 작은 설명)"
                               ref = {(input) => {this.eventSubTitleAccount = input}}
                        />
                        <input className='m-0 w-auto' type="text" placeholder="100"
                               ref = {(input) => {this.giveManyAmountAccount = input}}
                        />
                    </div>
                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="account를 적되 ,로 구분하기(최대15명)"
                               ref = {(input) => {this.giveManyAccount = input}}
                        />
                        <button onClick = {this.onGiveManyTokenAccount}> 여러명 BLCT지급  </button>
                    </div>
                    <br/>
                    <br/>

                    5. 여러 account에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) - 코박지급용 <br />
                    <div className='d-flex'>
                        지급할 토큰 양 :
                        <input className='m-0 w-auto' type="text" placeholder="100"
                               ref = {(input) => {this.giveCobakAmount = input}}
                        />
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="account 적되 ,로 구분하기 - 1"
                               ref = {(input) => {this.giveCobakAccount1 = input}}
                        />
                        <button onClick = {this.onGiveManyCobakToken.bind(this, 1)}> 여러명 BLCT지급 - 1  </button>
                    </div>

                    <br/>
                    <br/>


                    6. 여러 email로부터 BLCT 돌려받기(토큰 지급이 완료되면 알림창을 확인해야 합니다) <br />
                    <div className='d-flex'>
                        <input className='m-0 w-auto' type="text" placeholder="250"
                               ref = {(input) => {this.takeManyAmount = input}}
                        />
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 1"
                               ref = {(input) => {this.takeManyAddresses1 = input}}
                        />
                        <button onClick = {this.onTakeManyToken.bind(this, 1)}> 여러명 BLCT받기 - 1  </button>
                    </div>

                    <br/>
                    <br/>

                    7. eth token balance <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="owner Account"
                               ref = {(input) => {this.ownerAccount = input}}
                        />
                        <button onClick = {this.onGetBlyBalance}> BLY 잔액조회   </button>
                        <span className='ml-2 mr-2'> {this.state.tokenBalance}</span>
                        <button className="ml-3"  onClick = {this.onGetEthBalance}> Eth 잔액조회   </button>
                        <span className='ml-2'> {this.state.ethBalance}</span>
                    </div>
                    <br/>
                    <br/>

                    7-1. send ETH to User <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="ethReceiverAddress"
                               ref = {(input) => {this.ethReceiverAddress = input}}
                        />
                        <button onClick = {this.onSendEthToUser}> ETH 전송   </button>

                    </div>
                    <br/>
                    <br/>

                    8. send Bly to User (Failure swapBlctToBly transfer Token 실행필요) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="receiverAddress"
                               ref = {(input) => {this.blyReceiverAddress = input}}
                        />
                        <input className='m-0 w-25' type="number" placeholder="amount"
                               ref = {(input) => {this.blyAmount = input}}
                        />
                        <button onClick = {this.onSendManagerBlyToUser}> BLY 전송   </button>

                    </div>
                    <br/>
                    <br/>

                    9.BlctToBly swap 완료처리 <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="swapBlctToBlyNo"
                               ref = {(input) => {this.swapBlctToBlyNo = input}}
                        />
                        <input className='m-0 w-25' type="text" placeholder="txHash"
                               ref = {(input) => {this.swapBlctToBlyTxHash = input}}
                        />
                        <button onClick = {this.onUpdateSwapBlctToBlySuccess}> swapBlctToBly 완료 update   </button>

                    </div>
                    <br/>
                    <br/>

                    10. 소비자 토큰 총합 구하기 (부하 많음!!) <br />
                    <div className='d-flex align-items-center'>
                        <button onClick = {this.onGetAllConsumerToken}> 토큰 총합 </button>
                        <span className='ml-3'>{this.state.allConsumerTokens}</span>
                    </div>
                    <br/>
                    <br/>

                    11. 생산자 토큰 총합 구하기 (부하 많음!!) <br />
                    <div className='d-flex align-items-center'>
                        <button onClick = {this.onGetAllProducerToken}> 토큰 총합 </button>
                        <span className='ml-3'>{this.state.allProducerTokens}</span>
                    </div>
                    <br/>
                    <br/>

                    12. SwapErcAccount => SwapErcHistory copy <br/>
                    <div className='d-flex align-items-center'>
                        <button onClick = {this.onCopyErcAccountToErcHistory}> table copy </button>
                    </div>
                    <br/>
                    <br/>

                    {/*9. send User Bly to Manager <br />*/}
                    {/*<div className='d-flex align-items-center'>*/}
                        {/*<input className='m-0 w-25' type="text" placeholder="userAddress"*/}
                               {/*ref = {(input) => {this.blyUserAddress = input}}*/}
                        {/*/>*/}
                        {/*<input className='m-0 w-25' type="text" placeholder="userPk"*/}
                               {/*ref = {(input) => {this.blyUserPk = input}}*/}
                        {/*/>*/}
                        {/*<input className='m-0 w-25' type="number" placeholder="amount"*/}
                               {/*ref = {(input) => {this.userBlyAmount = input}}*/}
                        {/*/>*/}
                        {/*<button onClick = {this.onSendUserBlytToManager}> BLY 전송   </button>*/}
                    {/*</div>*/}


                </div>

                {/*<ColoredLine color="green"/>*/}
                {/*<h5> 블록체인 데이터 세팅 및 조회 </h5><br />*/}

                {/*1.*/}
                {/*<button onClick = {this.onGetTotalBlsGuarantyBlct}> BLCT담보 BLS 발행량 조회(console) </button>*/}

            </div>
        )
    }
}

const Style = {
    placeholder : { color : 'red'}
}