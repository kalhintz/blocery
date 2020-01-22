import React, { Component, PropTypes } from 'react';
import { resetPassword, setCurrentPriceOfAllValidGoods, setNotDeliveryOrder, sendWarnShippingStart, sendNotiDelayShipping, setOrderDetailConfirm } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { BlockChainSpinner, Spinner } from '~/components/common'

export default class SimpleAdmin extends Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            chainLoading: false,
            account:'address'
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

    }

    onResetPassword = async() => {
        let {data:result} = await resetPassword(this.resetPassword.value);
        if (result === 200) {
            alert('비밀번호 변경에 성공했습니다')
        } else {
            alert('비밀번호 변경 실패. 다시 시도해주세요');
        }
    };

    onSetCurrentPriceOfAllValidGoods = async() => {
        this.setState({loading: true}); //스플래시 열기
        let {data:result} = await setCurrentPriceOfAllValidGoods();
        this.setState({loading: false});

        if(result == null)
            alert('상품 판매가격 설정에 실패했습니다')
        else
            alert(result + '개의 상품의 판매가격이 설정되었습니다')
    };

    onSetNotDeliveryOrder = async() => {
        this.setState({chainLoading: true}); //스플래시 열기
        let {data:result} = await setNotDeliveryOrder();
        this.setState({chainLoading: false});

        if(result == null)
            alert('미배송 배치 작업에 실패했습니다')
        else
            alert(result + '개의 미배송 주문에 대해 처리되었습니다')
    };

    onSendWarnShippingStart = async() => {
        this.setState({loading: true}); //스플래시 열기
        let {data:result} = await sendWarnShippingStart();
        this.setState({loading: false});

        if(result == null)
            alert('생산자에게 발송 임박 상품 안내 알림을 보내지 못했습니다')
        else
            alert('생산자에게 발송 임박 상품 안내 알림을 보냈습니다')
    };

    onSendShoppingDelay = async() => {
        let {data:result} = await sendNotiDelayShipping();
        console.log('미배송 발생 배치 노티 테스트 : ', result);
    }

    onSetOrderDetailConfirm = async() => {
        let {data:result} = await setOrderDetailConfirm();
        console.log('자동구매확정 배치 테스트 건수 : ', result);
    }

    render() {
        return (
            <div>
                {
                    this.state.loading && <Spinner/>
                }
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }

                <h5> 기본설정 Page</h5>
                <br/>

                1. 비밀번호 초기화 ( 랜덤8자리로 초기화 ) <br />
                <input type="text" placeholder="email주소"
                       ref = {(input) => {this.resetPassword = input}}
                />
                <button onClick = {this.onResetPassword}> 비밀번호 초기화   </button>
                <br/>
                <br/><br/>

                2. 상품 판매 가격 설정 (일배치 로직이 적용되기 전에 등록된 상품 중 판매개시된 상품에 대해 상품 판매 가격 설정)<br/>
                <button onClick = {this.onSetCurrentPriceOfAllValidGoods}> 상품 판매 가격 설정 </button>
                <br/>
                <br/><br/>

                3. 미배송 주문 배치 처리 (테스트 또는 미배송 주문 배치중 오류로 재시도할 경우 수행)<br/>
                - 매일 0시에 자동으로 도는 것과 충돌되지 않는 시간에 실행하세요<br/>
                - 미배송 주문이 많은 경우 블록체인 기록에 많은 시간이 소요될 수 있습니다.<br/>
                - 미배송 배치가 끝난 후 남은 미배송 보증금 정산 처리가 수행됩니다. <br/>
                <button onClick = {this.onSetNotDeliveryOrder}> 미배송 주문 배치 시작 </button>
                <br/>
                <br/><br/>

                4. 생산자에게 발송 임박 상품 정보 알림과 이메일을 보냅니다.<br/>
                <button onClick = {this.onSendWarnShippingStart}> 발송 임박 상품 정보 알림 보내기 </button>
                <br/>
                <br/><br/>

                5. 배송종료일이 지나고 미배송확정 이전까지의 배치를 테스트합니다. (배송종료일에서 1일 7일 13일 경과시 아침 9시에 푸쉬 알림)<br/>
                <button onClick = {this.onSendShoppingDelay}> 미배송 진행중 알림 보내기 </button>
                <br/>
                <br/><br/>

                6. 송장번호 입력 후 14일까지 소비자가 구매확정을 안할 시 자동구매확정 배치를 테스트합니다.<br/>
                <button onClick = {this.onSetOrderDetailConfirm}> 자동구매확정 </button>
                <br/>
                <br/><br/>

            </div>
        )
    }
}