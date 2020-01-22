import React, { Component } from 'react';
import { getLoginAdminUser, getLoginUser } from '../../../lib/loginApi'
import { BlocerySpinner } from '../../../components/common'
import { BLCT_TO_WON } from '../../../lib/exchangeApi'

import { scOntOrderGoodsBlct, scOntCancelOrderBlct, scOntRewardReviewBlct, scOntCalculateOrderBlct, scOntGetConsumerBlctHistory,
    scOntGetManagerTotalDeposit, scOntGetProducerTotalBls, scOntPayProducerDeposit, scOntGetBalanceOfBlct,
    scOntGetProducerOrderBlctHistory, scOntGetProducerGoodsBlctHistory} from "../../../lib/smartcontractApi";

export default class TokenTest extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: []
        }
    }

    async componentDidMount() {
        let admin = await getLoginAdminUser();

        if (!admin || admin.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    onGetBalanceOfBlct = async() => {
        let result = await scOntGetBalanceOfBlct(this.blctGethSC, this.getBlctBalance.value);
        console.log("BLCT allowance amount : ", result);
    }

    // 생산자 위약금 납부
    onPayProducerDeposit = async () => {
        let result = await scOntPayProducerDeposit(this.payProducerDepositProdNo.value, this.payProducerDepositAmount.value);
        console.log('onPayProducerDeposit front : ', result);
    };

    // BLCT 물품 주문
    onOrderGoodsBlct = async () => {
        this.setState({loading: true})

        const blctToWon = await BLCT_TO_WON();
        let orderPrice = this.orderBLCTGoodsPrice.value * blctToWon;
        scOntOrderGoodsBlct(this.orderBLCTGoodsOrderNo.value, this.orderBLCTGoodsProducer.value, this.orderBLCTGoodsgoodsNo.value,
            this.orderBLCTGoodsPrice.value, orderPrice, this.orderBLCTGoodsDeposit.value)
            .then(result => {

            console.log('onOrderGoodsBlct front THEN : ', result);
            if(result !== 200){
                alert('토큰 구매에 실패 하였습니다. 다시 구매해주세요.');
            } else {
                alert('BLCT로 구매를 완료하였습니다 ')
            }
            this.setState({loading: false})
            });
    };

    onCancelOrderBlct = async() => {
        // cancelBlctAmount = 취소할 blct 양 , cancelBlctFee = 취소수수료(원)
        let result = await scOntCancelOrderBlct(this.cancelBlctOrderNo.value, this.cancelBlctPrice.value, this.cancelBlctAmount.value, this.cancelBlctFee.value, false);
        console.log('onCancelOrderBlct front : ', result);
    }

    // 배송완료(정산)
    onCalculateOrderBlct = async() => {
        let result = await scOntCalculateOrderBlct(this.calculateOrderNo.value, this.calculateOrderPenalty.value,
            this.calculateBloceryFee.value, this.calculateOrderPenaltyBlct.value, this.calculateConsumerRewardBlct.value, this.calculateProducerRewardBlct.value, this.calculateOrderDepositBlct.value);
        console.log('onCalculateOrderBlct front : ', result);
    }

    // 매니저에게 적립왼 총 위약금 조회
    onGetManagerTotalDeposit = async () => {
        let result = await scOntGetManagerTotalDeposit(this.logicWeb3SC);
        // let {data : result} = await scOntGetManagerTotalDeposit();
        console.log('Page Result : ', result);
    };

    onGetProducerTotalBls = async () => {
        let {data : result} = await scOntGetProducerTotalBls(this.getProducerTotalBls.value);
        console.log('Page Result : ', result);
    }

    // 주문에 따른 소비자 토큰내역 조회
    onGetConsumerBlctHistory = async () => {
        let result = await scOntGetConsumerBlctHistory(this.getConsumerBlctHistoryNo.value);
        console.log('Page Result : ', result);
    }

    // 주문에 따른 생산자 토큰내역 조회
    onGetProducerBlctHistory = async () => {
        let {data: orderResult} = await scOntGetProducerOrderBlctHistory(this.getProducerBlctHistoryOrderNo.value);
        console.log('orderHistory : ', orderResult);

        let {data: goodsResult} = await scOntGetProducerGoodsBlctHistory(this.getProducerBlctHistoryGoodsNo.value);
        console.log('goodsHistory : ', goodsResult);
    }

    onRewardReviewBlct = async() => {
        let result = await scOntRewardReviewBlct(this.reviewOrderNo.value, this.reviewBlct.value);
        console.log('Page Result: ', result);
    }

    render() {
        const styles = {
            blueText : { color: 'blue' },
            blackText : { color: 'black' }
        };

        return (
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }

                <h5> Geth서버 Token Test</h5>

                1.
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.getConsumerBlctHistoryNo = input}}
                />
                <button onClick = {this.onGetConsumerBlctHistory}> 주문에 따른 소비자 토큰내역 조회   </button>
                <br/>
                <br/>

                2.
                <input type="text" placeholder="goodsNo"
                       ref = {(input) => {this.getProducerBlctHistoryGoodsNo = input}}
                />
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.getProducerBlctHistoryOrderNo = input}}
                />
                <button onClick = {this.onGetProducerBlctHistory}> 생산자 BLCT 내역 조회   </button>
                <br/>
                <br/>

                3.
                <button onClick = {this.onGetManagerTotalDeposit}> 매니저에게 걸린 총 위약금 </button>
                <br/>
                <br/>

                4.
                <input type="text" placeholder="producerNo"
                       ref = {(input) => {this.getProducerTotalBls = input}}
                />
                <button onClick = {this.onGetProducerTotalBls}> 생산자가 받을 BLS 총액  </button>
                <br/>
                <br/>

                <h5> Eth, Token 관련 Test <span style={styles.blueText}>(사용자 Login 필요 - getMyAccount 호출)</span></h5>

                1.
                <input type="text" placeholder="address"
                       ref = {(input) => {this.getBlctBalance = input}}
                />
                <button onClick = {this.onGetBalanceOfBlct}> BLCT 토큰잔액조회   </button>

                <br/>
                <br/>

                2.
                <input type="text" placeholder="goodsNo"
                       ref = {(input) => {this.payProducerDepositProdNo = input}}
                />
                <input type="text" placeholder="amount"
                       ref = {(input) => {this.payProducerDepositAmount = input}}
                />
                <button onClick = {this.onPayProducerDeposit}> <span style={styles.blueText}>생산자 위약금 지불 </span></button>
                <br/>
                <br/>


                3. <span style={styles.blueText}>BLCT 주문</span> <br/>
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.orderBLCTGoodsOrderNo = input}}
                />
                <input type="text" placeholder="producer"
                       ref = {(input) => {this.orderBLCTGoodsProducer = input}}
                />
                <input type="text" placeholder="goodsNo"
                       ref = {(input) => {this.orderBLCTGoodsgoodsNo = input}}
                />
                <input type="text" placeholder="BLCT price"
                       ref = {(input) => {this.orderBLCTGoodsPrice = input}}
                />
                <input type="text" placeholder="orderDeposit"
                       ref = {(input) => {this.orderBLCTGoodsDeposit = input}}
                />
                <button onClick = {this.onOrderGoodsBlct}> BLCT 주문하기 </button>
                <br/>
                <br/>

                4. BLCT 주문취소
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.cancelBlctOrderNo = input}}
                />
                <input type="text" placeholder="취소당시 blct물건값"
                       ref = {(input) => {this.cancelBlctPrice = input}}
                />
                <input type="text" placeholder="cancelBlct"
                       ref = {(input) => {this.cancelBlctAmount = input}}
                />
                <input type="text" placeholder="cancelFee"
                       ref = {(input) => {this.cancelBlctFee = input}}
                />
                <button onClick = {this.onCancelOrderBlct}> BLCT 주문취소 </button>
                <br/>
                <br/>

                5.
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.calculateOrderNo = input}}
                />
                <input type="text" placeholder="producerIncome"
                       ref = {(input) => {this.calculateProducerIncome = input}}
                />

                <input type="text" placeholder="orderPenalty"
                       ref = {(input) => {this.calculateOrderPenalty = input}}
                />

                <input type="text" placeholder="bloceryFee"
                       ref = {(input) => {this.calculateBloceryFee = input}}
                />
                <input type="text" placeholder="orderPenaltyBlct"
                       ref = {(input) => {this.calculateOrderPenaltyBlct = input}}
                />

                <input type="text" placeholder="consumerRewardBlct"
                       ref = {(input) => {this.calculateConsumerRewardBlct = input}}
                />
                <input type="text" placeholder="producerRewardBlct"
                       ref = {(input) => {this.calculateProducerRewardBlct = input}}
                />
                <input type="text" placeholder="orderDepositBlct"
                       ref = {(input) => {this.calculateOrderDepositBlct = input}}
                />

                <button onClick = {this.onCalculateOrderBlct}> 배송완료_BLCT정산 </button>
                <br/>
                <br/>

                6.
                <input type="text" placeholder="orderNo"
                       ref = {(input) => {this.reviewOrderNo = input}}
                />
                <input type="text" placeholder="reviewBlct"
                       ref = {(input) => {this.reviewBlct = input}}
                />
                <button onClick = {this.onRewardReviewBlct}> 리뷰리워드 blct </button>
                <br/>
                <br/>

            </div>
        );
    }
}
