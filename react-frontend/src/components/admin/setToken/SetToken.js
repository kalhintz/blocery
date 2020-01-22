import React, { Component, PropTypes } from 'react';
import { scOntTransferManagerBlct, scOntGetTotalBlsGuarantyBlct, scOntGetBalanceOfBlct, scOntGetManagerOngBalance, scOntTransferManagerBlctToMany, scOntUserSendBlctToManager } from '../../../lib/smartcontractApi';
import { getConsumerAccountByEmail} from '../../../lib/adminApi'
import { getLoginAdminUser } from '../../../lib/loginApi'
import { Server } from '../../../components/Properties';
import axios from 'axios';

export default class SetToken extends Component{

    constructor(props) {
        super(props);
        this.state = {
            account:'address',
            managerAccount: '',
            managerBlct: '-',
            managerOng: '-'
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
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
            userAccount.textContent = '회원가입이 되어있지 않은 email입니다 ';
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

        let originEmailList = '';
        switch (buttonNo) {
            case 1:
                originEmailList = this.giveManyAddresses1.value.split(',');
                break;
            case 2:
                originEmailList = this.giveManyAddresses2.value.split(',');
                break;
            case 3:
                originEmailList = this.giveManyAddresses3.value.split(',');
                break;
            case 4:
                originEmailList = this.giveManyAddresses4.value.split(',');
                break;
            case 5:
                originEmailList = this.giveManyAddresses5.value.split(',');
                break;
        }

        let emailList = new Array();
        for(let i = 0 ; i < originEmailList.length ; i++ ) {
            if(originEmailList[i].trim().length > 0)
                emailList[i] = originEmailList[i].trim();
        }

        // console.log('emailList : ', emailList);

        if(emailList.length > 15) {
            alert(emailList.length + '명 입력. 최대 전송인원은 15명을 초과했습니다')
            return;
        }

        let {data} = await scOntTransferManagerBlctToMany(this.eventTitle.value, this.eventSubTitle.value, emailList, this.giveManyAmount.value);
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

        if(this.getBalanceOfBlctAccount.value) {
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

                    4. 여러 email에 BLCT 지급(토큰 지급이 완료되면 알림창을 확인해야 합니다) <br />
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

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 2"
                               ref = {(input) => {this.giveManyAddresses2 = input}}
                        />
                        <button onClick = {this.onGiveManyToken.bind(this, 2)}> 여러명 BLCT지급 - 2  </button>
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 3"
                               ref = {(input) => {this.giveManyAddresses3 = input}}
                        />
                        <button onClick = {this.onGiveManyToken.bind(this, 3)}> 여러명 BLCT지급 - 3  </button>
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 4"
                               ref = {(input) => {this.giveManyAddresses4 = input}}
                        />
                        <button onClick = {this.onGiveManyToken.bind(this, 4)}> 여러명 BLCT지급 - 4  </button>
                    </div>

                    <div className='d-flex mt-2'>
                        <input className='w-50' type="text" placeholder="email을 적되 ,로 구분하기(최대15명) - 5"
                               ref = {(input) => {this.giveManyAddresses5 = input}}
                        />
                        <button onClick = {this.onGiveManyToken.bind(this, 5)}> 여러명 BLCT지급 - 5  </button>
                    </div>
                    <br/>
                    <br/>
                </div>
                <ColoredLine color="green"/>
                <h5> 블록체인 데이터 세팅 및 조회 </h5><br />

                1.
                <button onClick = {this.onGetTotalBlsGuarantyBlct}> BLCT담보 BLS 발행량 조회(console) </button>
                <br/>
                <br/>

            </div>
        )
    }
}

const Style = {
    placeholder : { color : 'red'}
}