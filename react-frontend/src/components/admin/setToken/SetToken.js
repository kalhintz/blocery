import React, { Component, PropTypes } from 'react';
import { scOntTransferManagerBlct, scOntGetTotalBlsGuarantyBlct, scOntGetBalanceOfBlct, scOntGetManagerOngBalance, scOntManagerSendBlctToManager,
    scOntTransferManagerBlctWithEvent, scOntUserSendBlctToManager, scOntTransferManagerBlctToManyAccounts, scOntTransferManagerTokenToManyAccount } from '~/lib/smartcontractApi';
import { getConsumerAccountByEmail, getAllConsumerToken, getAllProducerToken } from '~/lib/adminApi'
import { getBlyBalanceByAccount, sendManagerBlyToUser, sendUserBlytToManager, getEthBalance, sendEth, updateSwapBlctToBlySuccess, copyErcAccountToErcHistory} from '~/lib/swapApi'
import { isTokenAdminUser } from '~/lib/loginApi'
import { getConsumerEmail, getKakaoPhoneConsumer } from '~/lib/shopApi';
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
            consumerNo: 0,
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

    // email이나 phone으로 consumerNo와 account 가져오기
    onGetConsumerInfo = async() => {

        if(this.getConsumerNoEmail.value) {
            let {data:consumerInfo} = await getConsumerEmail(this.getConsumerNoEmail.value);
            console.log(consumerInfo);
            if(consumerInfo.account) {
                this.setState({
                    consumerNo: consumerInfo.consumerNo,
                    account: consumerInfo.account
                })
            } else {
                this.setState({
                    account: '회원가입이 되어있지 않은 email입니다 '
                });
            }
        } else if(this.getConsumerNoPhone.value && this.getConsumerNoPhone.value.length > 11){
            let {data:consumerList} = await getKakaoPhoneConsumer(this.getConsumerNoPhone.value);
            console.log(consumerList);
            if(consumerList.length === 0) {
                this.setState({
                    account: '회원가입이 되어있지 않은 phone입니다 '
                });

            } else if(consumerList.length === 1) {
                if (consumerList[0].account) {
                    this.setState({
                        consumerNo: consumerList[0].consumerNo,
                        account: consumerList[0].account
                    })
                }

            }else {
                this.setState({
                    account: '2명 이상의 회원이 존재합니다. log를 확인해주세요.'
                });
            }
        } else {
            alert('입력한 소비자 회원정보를 확인해주세요.');
        }
    }

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

    onGiveEventToken = async() => {
        let {data} = await scOntTransferManagerBlctWithEvent(this.eventTitle.value, this.eventSubTitle.value,  this.giveConsumerNo.value, this.giveManyAmount.value, this.state.sendKakao);
        if(data) {
            alert('토큰이 성공적으로 지급되었습니다');
        } else {
            alert('토큰 지급에 실패하였습니다. 다시 시도해주세요.');
        }
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

    onSendUserBlytToManager = async() => {
        let {data:result} = await sendUserBlytToManager(this.blyUserAddress.value, this.blyUserPk.value, this.userBlyAmount.value)
        console.log(result);
        alert(result);
    }

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
                    1. 사용자 정보조회 (기존회원 email, 카카오회원 phone) <br />
                    <div className='d-flex align-items-center'>
                        <input className='m-0 w-25' type="text" placeholder="email주소"
                               ref = {(input) => {this.getConsumerNoEmail = input}}
                        />
                        <input className='m-0 w-25 ml-1' type="text" placeholder="핸드폰번호 000-0000-0000 형태 "
                               ref = {(input) => {this.getConsumerNoPhone = input}}
                        />
                        <button className='ml-1' onClick = {this.onGetConsumerInfo}> consumer 정보조회   </button>
                        <span id="consumerNo" className='ml-2'> consumerNo: {this.state.consumerNo} ,</span>
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
                        <span> 4. consumerNo에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) </span>
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
                        <input className='w-50' type="text" placeholder="consumerNo" value={this.state.consumerNo}
                               ref = {(input) => {this.giveConsumerNo = input}}
                        />
                        <button onClick = {this.onGiveEventToken.bind(this)}> BLCT지급  </button>
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

                </div>

            </div>
        )
    }
}

const Style = {
    placeholder : { color : 'red'}
}