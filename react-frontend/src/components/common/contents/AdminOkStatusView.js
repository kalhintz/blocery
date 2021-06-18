import React, {useEffect, useState} from 'react';
import {Div, Flex, Input, Button, Right, Span} from '~/styledComponents/shared'
import {requestAdminOkStatus, updateSwapBlctToBlyMemo, getAbuserByConsumerNo, checkExtOwnAccount} from '~/lib/adminApi'
import {
    getSwapBlctToBlyById,
    getSwapManagerBlyBalance,
    getSwapManagerEthBalance,
    withdrawSecurityCheck,
    getEthGasPrice
} from '~/lib/swapApi'
import ComUtil from "~/util/ComUtil";
import useInterval from "~/hooks/useInterval";
import {getAbuser} from "~/lib/shopApi";

const STATUS_NM = {
    0: '승인',
    1: '요청',
    2: '검토중',
    3: '거절'
}

// (승인) 처리결과
const RESULT_NM = {
    '200': '성공',
    '0': '관리자 로그인 안되 어있음',
    '-100': '(-100) 일일한도 이상 출금',//1일 1회한도 걸려서 미발생 할 것임
    '-101': '(-101) 탈퇴한 회원',
    '-102': '(-102) 어뷰저',
    '-103': '(-103) 해킹시도(어뷰저)',
    '-104': '(-104) 19세 미만 출금 시도',
    '-1': '(-1) 잔액부족',
    '500': '(500) 내부 전송 실패',
    '501': '(500) 매니저 ETH 부족'
}

const AdminOkStatusView = ({swapBlctToBlyNo}) => {

    const [swapManagerBly, setSwapManagerBly] = useState();
    const [swapManagerEth, setSwapManagerEth] = useState();
    const [ethGasPrice, setEthGasPrice] = useState();

    const [swapBlctToBly, setSwapBlctToBly] = useState()
    const [swapCheckCode, setSwapCheckCode] = useState()
    const [intervalDelay, setIntervalDelay] = useState(null)
    const [abuser, setAbuser] = useState(null)
    const [extOwnAccount, setExtOwnAccount] = useState(false);

    useEffect(() => {
        async function fetch() {
            const data = await getData()
            setSwapBlctToBly(data)

            // 출금요청이 있는경우 본인 입금계좌로 잘못입력했는지 확인
            if(data) {
                const {data:extOwnAccount} = await checkExtOwnAccount(data.consumerNo, data.blyExtAccount)
                setExtOwnAccount(extOwnAccount);
            }

            const {data:swapManagerBly} = await getSwapManagerBlyBalance();
            const {data:swapManagerEth} = await getSwapManagerEthBalance();
            const {data:ethGasGwei} = await getEthGasPrice();
            setSwapManagerBly(swapManagerBly);
            setSwapManagerEth(swapManagerEth);
            setEthGasPrice(ethGasGwei)
        }
        fetch()
    }, [])

    useEffect(() => {
        //어뷰저 확인
        if(swapBlctToBly){
            getAbuser()
        }

        //5초마다 체크
        setIntervalDelay(5000)
    }, [swapBlctToBly])

    const getData = async () => {
        const {data} = await getSwapBlctToBlyById(swapBlctToBlyNo)
        return data
    }

    //출금 승인이 성공할지 안할지 백엔드에 어뷰저 여부 판단하게 하여 어뷰저 일 경우 어뷰저로 등록 하도록 요청
    const checkSecurity = async () => {

        const {consumerNo, extErcAccount, blctAmount} = swapBlctToBly

        await withdrawSecurityCheck({
            consumerNo: consumerNo,
            extErcAccount: blyExtAccount,
            blctAmount: blctAmount
        })
    }

    const onButtonClick = async (adminOkStatus) => {

        if (adminOkStatus === 0) {
            if (!window.confirm('승인 하시겠습니까? 이후 번복이 불가능 합니다.'))
                return
        }
        else if (adminOkStatus === 3) {
            if (!swapBlctToBly.userMessage){
                alert('사용자 노출 메시지는 필수 입니다.')
                return
            }else if (!swapBlctToBly.adminMemo){
                alert('관리자 메시지는 필수 입니다.')
                return
            }

            if (!window.confirm('거절 하시겠습니까? 이후 번복이 불가능 합니다.'))
                return
        }

        //한번더 상태값 확인
        const data = await getData()

        let canUpdate = false

        //검토중 선택
        if (adminOkStatus === 2) {

            await checkSecurity()

            //DB 값이 요청 일 경우만 검토중으로 업데이트
            if (data.adminOkStatus === 1) {
                canUpdate = true
            }else{
                alert(`다른 관리자가 이미 ${STATUS_NM[data.adminOkStatus]} 하여 해당 작업은 취소 되었습니다. 재검색하여 최신 내용을 반영 합니다.`)
                setSwapBlctToBly(await getData())
            }
        }
        //승인 or 거절 선택
        else if (adminOkStatus === 0 || adminOkStatus === 3) {
            //검토중으로 되어있는 경우만 승인 or 거절 처리
            if (data.adminOkStatus === 2) {
                canUpdate = true
            }else{
                alert(`다른 관리자가 이미 ${STATUS_NM[data.adminOkStatus]} 하여 해당 작업은 취소 되었습니다. 재검색하여 최신 내용을 반영 합니다.`)
                setSwapBlctToBly(await getData())
            }
        }

        if (canUpdate) {

            console.log({
                ...swapBlctToBly,
                adminOkStatus: adminOkStatus
            })

            const isSucceed = await requestAdminOkStatus({
                ...swapBlctToBly,
                adminOkStatus: adminOkStatus
            })

            if (isSucceed) {
                alert('반영 되었습니다.')
                setSwapBlctToBly(await getData())
            }else{
                alert('오류가 발생 하였습니다.')
            }
        }
    }

    //메모만 업데이트
    const onUpdateMemoClick = async () => {
        await updateSwapBlctToBlyMemo(swapBlctToBly);
        alert('저장 되었습니다.');
    }

    const onInputChange = ({target}) => {
        const {name, value} = target
        setSwapBlctToBly({
            ...swapBlctToBly,
            [name]: value
        })
    }

    useInterval(() => {
        if(swapBlctToBly && swapBlctToBly.consumerNo){
            getAbuser();
        }
    }, intervalDelay)

    const getAbuser = async () => {
        const {data} = await getAbuserByConsumerNo(swapBlctToBly.consumerNo)
        setAbuser(data)
    }

    if (!swapBlctToBly) return null

    const {
        consumerNo,         // swap 요청한 consumerNo
        swapTimestamp,      // swap 요청 시간
        blctAmount,         // swap 요청 토큰양
        blyAmount,          // 수수료 100 blct를 빼고 전송한 bly 토큰양
        blyExtAccount,      // 사용자가 입력한 Erc20 BLY 외부 송금 계좌
        blyPaid,
        blyPaidTime,        // bly 송금완료시각
        memo,               // 사용자가 작성한 메모
        txHash,
        adminOkStatus,      //1:승인필요 [데이터처음생성시],  2:검토 중, 3거절, 0:완료 (미출력)
        userMessage,        //사용자에게 노출되는 메세지
        adminMemo,          //관리자 기록용 메세지
        finalResult,        //200성공, 음수: 사용자실패, 500이상 내부실패. (그대로 출력)} = swapBlctToBly
    } = swapBlctToBly

    //검토중이 아니면 비활성화
    // const disabled = adminOkStatus !== 2
    const styles = {
        redText : { color: 'red' },
        blueText : { color: 'blue' },
        blackText : { color: 'black' }
    };

    return (
        <Div>
            <Flex p={16} bg={adminOkStatus === 3 ? 'danger' : 'green'} fg={'white'}>
                <Div>
                    {adminOkStatus === 0 && '승인 되었습니다'}
                    {adminOkStatus === 1 && '승인을 기다리고 있습니다'}
                    {adminOkStatus === 2 && '검토중 입니다'}
                    {adminOkStatus === 3 && '거절 되었습니다'}
                    {adminOkStatus === 4 && '자동출금 예정입니다'}
                </Div>
                <Right>
                    {ComUtil.utcToString(blyPaidTime, 'YYYY-MM-DD HH:mm:ss')}
                </Right>
            </Flex>
            <Div p={16}>
                <Div>
                    <Flex>
                        <Div width={150}>출금요청 BLCT</Div>
                        <Flex flexGrow={1}>
                            <Div>{ComUtil.toCurrency(blctAmount)}(수수료 포함)</Div>
                            <Right fg={'dark'}>
                                {ComUtil.utcToString(swapTimestamp, 'YYYY-MM-DD HH:mm:ss')}
                            </Right>
                        </Flex>
                    </Flex>
                </Div>
                <Flex my={10}>
                    <Div width={150}>소비자 메모</Div>
                    <Div flexGrow={1}>{memo}</Div>
                </Flex>
                <Flex my={10}>
                    <Div width={150}>사용자 노출 메시지</Div>
                    <Div flexGrow={1}><Input name={'userMessage'} onChange={onInputChange} value={userMessage} block placeholder={'사용자 노출 메시지 (거절시 작성)'}/></Div>
                </Flex>
                <Flex>
                    <Div width={150}>관리자 메모</Div>
                    <Div flexGrow={1}><Input name={'adminMemo'} onChange={onInputChange} value={adminMemo} block placeholder={'관리자 메모'}/></Div>
                </Flex>

                {
                    finalResult ? (
                        <Flex mt={10}>
                            <Div width={150}>처리(스왑)결과</Div>
                            <Div flexGrow={1}>
                                {RESULT_NM[finalResult]}
                            </Div>
                        </Flex>
                    ) : null
                }

                <Flex>
                    <Div width={150}></Div>
                    <Div flexGrow={1}>
                        <Div fg={'secondary'} fontSize={12} my={10}>
                            어뷰저/해커로 등록되면 승인처리 되더라도 출금이 되지 않습니다.
                            {
                                !finalResult && <Span fg={'primary'} ml={10} cursor onClick={getAbuser}><u>재확인</u></Span>
                            }
                        </Div>
                        {
                            (!finalResult && abuser && abuser.blocked) && (
                                <Div p={5} bc={'danger'} my={10}>
                                    회원정보를 확인해 주세요. 현재 상태로는 승인 불가 합니다.
                                    <br/>
                                    사유 : {abuser.memo}
                                </Div>
                            )
                        }
                        {
                            (extOwnAccount) && (
                                <Div fg={'danger'} fontSize={12} my={10}>
                                    본인 입금계좌로 출금요청 한 사용자입니다! 출금거절해주세요.
                                </Div>
                            )
                        }
                        {
                            (adminOkStatus === 1 || adminOkStatus === 2) ? (
                                <Div>
                                    <Button onClick={onButtonClick.bind(this, 2)} px={10} bg={'green'} fg={'white'} disabled={adminOkStatus !== 1}>검토중</Button>
                                    <Button onClick={onButtonClick.bind(this, 0)} px={10} bg={'green'} fg={'white'} mx={10} disabled={adminOkStatus !== 2 || (abuser && abuser.blocked)}>승인</Button>
                                    <Button onClick={onButtonClick.bind(this, 3)} px={10} bg={'danger'} fg={'white'} disabled={adminOkStatus !== 2}>거절</Button>
                                </Div>
                            ) : (
                                <Div>
                                    <Button onClick={onUpdateMemoClick} px={10} bc={'dark'} >저장</Button>
                                </Div>
                            )
                        }
                    </Div>
                </Flex>
                <Flex>
                    <Div width={150}></Div>
                    <Div flexGrow={1}>
                        <div className="mt-2 mr-4">
                            SwapManager ETH : <span style={styles.blueText}>{ComUtil.toEthCurrency(swapManagerEth)}</span> /
                            SwapManager BLY : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(swapManagerBly)} </span> /
                            EthGasGwei : <span style={ ethGasPrice >= 250 ? styles.redText:styles.blueText}>{ComUtil.toIntegerCurrency(ethGasPrice)}</span>
                        </div>
                    </Div>
                </Flex>
            </Div>


        </Div>
    );
};

export default AdminOkStatusView;
