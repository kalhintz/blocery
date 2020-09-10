// https://github.com/iamport/iamport-react-native/blob/master/exampleForWebView/src/Payment.js 를 class로 변경

import React from 'react';
import IMP from 'iamport-react-native';
import { View, Text, StyleSheet, Alert } from 'react-native';

/*Payment.js 를 class로 변경해 본 코드..  상단의 빨간 설명바 안뜨는 현상외엔 동일하게 동작하는 것으로 보임..
export default class Payment extends React.Component {
    static navigationOptions = {
        title: 'Payment',
        header: null
    };

    constructor(props) {
        super(props);

        this.userCode = this.props.navigation.getParam('userCode');
        this.data = this.props.navigation.getParam('data');

        console.log('----------------------> PaymentView', this.userCode, this.data);
    }


    //* 결제 후 실행될 콜백 함수 입력
    callback = (response) => {
        console.log('---------------------------> Payment callback',response);

        const isSuccessed = this.getIsSuccessed(response);
        if (isSuccessed) {
            //* 결제 성공한 경우, 리디렉션 위해 홈으로 이동한다
            const params = {
                ...response,
                type: 'payment', // 결제와 본인인증 구분을 위한 필드
            };
            this.props.navigation.replace('Home', params);
        } else {
            //* 결제 실패한 경우, 이전 화면으로 돌아간다
            this.props.navigation.goBack();
        }
    }

    getIsSuccessed = (response) => {
        const { imp_success, success } = response;

        if (typeof imp_success === 'string') return imp_success === 'true';
        if (typeof imp_success === 'boolean') return imp_success === true;
        if (typeof success === 'string') return success === 'true';
        if (typeof success === 'boolean') return success === true;
    }

    render() {
        return (
            <IMP.Payment
                userCode={this.userCode}
                data={{
                    ...this.data,
                    app_scheme: 'blocery',
                }}
                callback={(response) => this.callback(response)}
            />
        );
    }
}
*/
function Loading() {
    const { container, items } = styles;
    return (
        <View style={container}>
            <Text style={items}>결제 연동 중...</Text>
            <Text style={items}>잠시만 기다려주세요.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center'
    },
    items: {
        fontSize: 18,
        fontWeight: 'bold',
        top: 100
    }
});

function Payment({ navigation }) {
    /* 가맹점 식별코드, 결제 데이터 추출 */
    const userCode = navigation.getParam('userCode');
    const data = navigation.getParam('data');

    /* [필수입력] 결제 후 실행될 콜백 함수 입력 */
    function callback(response) {
        console.log('*************** Payment : ', response);
        const isSuccessed = getIsSuccessed(response);
        if (isSuccessed) {
            // 결제 성공한 경우, 리디렉션 위해 홈으로 이동한다
            const params = {
                response,
                type: 'payment',
            };
            //navigation.replace('Popup', params); //Home -> Popup

            navigation.goBack();
            navigation.state.params.onPayResult(JSON.stringify(params));

        } else {
            // 결제 실패한 경우, 본래 페이지로 돌아간다
            let alertTitle = '결제실패';
            // let alertContent = response.error_msg;
            let alertContent = '결제에 실패하였습니다. 다시 한 번 시도해주세요.';
            Alert.alert(
                alertTitle,
                alertContent,
                [
                    {
                        text: '확인',
                        onPress: () => navigation.goBack()
                    }
                ],
                {cancelable: false},
            )
        }
    }

    function getIsSuccessed(response) {
        const { imp_success, success } = response;

        if (typeof imp_success === 'string') return imp_success === 'true';
        if (typeof imp_success === 'boolean') return imp_success === true;
        if (typeof success === 'string') return success === 'true';
        if (typeof success === 'boolean') return success === true;
    }

    return (
        <IMP.Payment
            userCode={userCode}
            loading={<Loading />}  //iamport 1.2.0부터는 꼭 사용하라고 함. 실제로는 1.2.1에서는 디폴트가 더 이쁘지만 미래를 대비해서 자체제작.
            data={{
                ...data,
                app_scheme: 'blocery',
            }}
            callback={callback}
        />
    );
}

export default Payment;
