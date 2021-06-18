import React, {useState, useEffect} from 'react';
import Withdraw from "~/components/shop/mypage/withdraw";
import {withRouter} from 'react-router-dom'
import {getConsumer} from "~/lib/shopApi";
import {getLoginUserType} from "~/lib/loginApi";
import certApi from "~/lib/certApi";
import KakaoCert from "~/components/shop/mypage/kakaoCert";
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import WithdrawErcDon from "~/components/shop/mypage/withdrawErcDon";
import WithdrawIrcDon from "~/components/shop/mypage/withdrawIrcDon";

const requestKakaoCert = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(false)
    }, 1000)
})

const getKakaoCert = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(false)
    }, 1000)
})

const KakaoCertCheck = ({history}) => {

    const [loading, setLoading] = useState(true)
    const [certDone, setCertDone] = useState()
    console.log({history})

    //bly or don
    const {tokenName, type} = history.location.state ? history.location.state : {tokenName: 'bly'}

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const {data} = await getConsumer()

        if (!data) {
            history.replace('/mypage')
        }

        await searchCertDone()
        setLoading(false)
    }


    //1. 인증서 생성여부 조회
    const searchCertDone = async () => {
        //await 인증서 생성여부 판단
        const {data} = await certApi.getCertDone()
        console.log({certDone: data})
        setCertDone(data)
    }

    if (loading) return <BlocerySpinner />

    //인증서 생성 하였을 경우 출금페이지
    if (certDone) {
        if (tokenName === 'bly') {
            return <Withdraw />
        }
        else if (tokenName === 'ircDon') {
            return <WithdrawIrcDon />
        }else if (tokenName === 'ercDon') {
            return <WithdrawErcDon />
        }

    }

    //인증서 생성 하지 않았을 경우
    return (
        <KakaoCert refresh={searchCertDone}/>
    );
};

export default withRouter(KakaoCertCheck);