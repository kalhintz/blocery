import React, { useState, useEffect } from 'react';
import { Container, Input, Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import Css from './Payment.module.scss'
import classNames from 'classnames'
import { getPaymentCheckMemoList, delPaymentMemo } from '~/lib/adminApi';


const PaymentCheck = (props) => {

    const [producerNoDotMonth, setProducerNoDotMonth] = useState(props.selectCheckData.producerNoDotMonth || '')
    const [yearMonth, setYearMonth] = useState(props.selectCheckData.yearMonth)
    const [producerNo, setProducerNo] = useState(props.selectCheckData.producerNo)
    const [producerName, setProducername] = useState(props.selectCheckData.producerName)
    const [bankName, setBankName] = useState(props.selectCheckData.bankName)
    const [payoutAccount, setPayoutAccount] = useState(props.selectCheckData.payoutAccount)
    const [payoutAccountName, setPayoutAccountName] = useState(props.selectCheckData.payoutAccountName)
    const [charger, setCharger] = useState(props.selectCheckData.charger)
    const [chargerPhone, setChargerPhone] = useState(props.selectCheckData.chargerPhone)
    const [shopPhone, setShopPhone] = useState(props.selectCheckData.shopPhone)
    const [coRegistrationNo, setCoRegistrationNo] = useState(props.selectCheckData.coRegistrationNo)
    const [email, setEmail] = useState(props.selectCheckData.email)
    const [invoice, setInvoice] = useState(props.selectCheckData.invoice || false)
    const [paymentStatus, setPaymentStatus] = useState(props.selectCheckData.paymentStatus || 0)
    const [forwardAmount, setForwardAmount] = useState(props.selectCheckData.forwardAmount || 0)
    const [lastForwardAmount, setLastForwardAmount] = useState(props.selectCheckData.lastForwardAmount || 0)
    const [memoList, setMemoList] = useState(props.selectCheckData.memoList || [])
    const [showingMemoList, setShowingMemoList] = useState(props.selectCheckData.memoList || [])
    const [todayMemo, setTodayMemo] = useState('')
    const [searchMemoMonth, setSearchMemoMonth] = useState(props.selectCheckData.yearMonth)


    useEffect(()=> {
        console.log(props.selectCheckData);

        const memoListYearMonth = memoList.map((memo) => {
            const tempItem = {...memo}
            tempItem.yearMonth = yearMonth;
            return tempItem;
        })

        setShowingMemoList(memoListYearMonth.reverse());

    }, []);

    const onSaveCheckData = async() => {

        if(todayMemo.length > 0) {

            let memo = {
                regDate: ComUtil.getNow(),
                content: todayMemo
            }

            memoList.push(memo)
        }

        let _forwardAmount = forwardAmount;
        if(paymentStatus !== 2) {
            _forwardAmount = 0;
            setForwardAmount(0);
        }

        let checkData = {
            producerNoDotMonth: producerNoDotMonth,
            yearMonth: yearMonth,
            producerNo: producerNo,
            invoice: invoice,
            paymentStatus: paymentStatus,
            forwardAmount: _forwardAmount,
            memoList: memoList
        }

        console.log(checkData);

        props.onSave(checkData);
        // let {data:result} = await savePaymentCheck(checkData);
        //
        // if(result) {
        //     alert("정보를 등록했습니다");
        // } else {
        //     alert("정보 등록에 실패했습니다. 다시 시도해주세요.");
        // }

    }

    const onSelectStatus = (e) => {
        setPaymentStatus(parseInt(e.target.value));
    }

    const onRadioChange = (e) => {
        if(e.target.value === '0'){
            console.log('미발행')
            setInvoice(false);
        }else{
            console.log('발행완료')
            setInvoice(true);
        }
    }

    const onChangeForwardAmount = (e) => {
        setForwardAmount(e.target.value);
    }

    const onInputMemo = (e) => {
        setTodayMemo(e.target.value);
    }

    const getMoreMemoList = async() => {

        // console.log('searchMemoMonth : ', searchMemoMonth);

        let year = searchMemoMonth.substring(0,4);
        let month = searchMemoMonth.substring(4);

        if(month === '01') {
            year = year - 1;
            month = '12';
        } else {
            month = month - 1;
            if(month < 10) {
                month = '0' + month;
            }
        }

        const searchMonth = producerNo + '.' + year + month;
        // console.log('searchMonth : ', searchMonth);

        let {data: result} = await getPaymentCheckMemoList(searchMonth);
        // console.log(result);

        setSearchMemoMonth(year + month);
        if(result.length === 0) {
            alert(year + month  + '의 메모가 없습니다 ');
        } else {

            const resultYearMonth = result.map((memo) => {
                const tempItem = {...memo}
                tempItem.yearMonth = year + month;
                return tempItem;
            });

            setShowingMemoList(showingMemoList.concat(resultYearMonth));
        }

    }

    const delMemo = async(memoData) => {
        console.log(memoData);
        // memoData.yearMonth, producerNo, memoData.regDate

        const data = {
            yearMonth: memoData.yearMonth,
            producerNo: producerNo,
            regDate: memoData.regDate,
            content: memoData.content
        }

        let delResult = await delPaymentMemo(data);
        if(delResult) {
            alert("메모가 삭제되었습니다. ")

            const searchMonth = producerNo + '.' + yearMonth;
            let {data: result} = await getPaymentCheckMemoList(searchMonth);
            const resultYearMonth = result.map((memo) => {
                const tempItem = {...memo}
                tempItem.yearMonth = yearMonth;
                return tempItem;
            });
            setShowingMemoList(resultYearMonth);

            setSearchMemoMonth(yearMonth);
        } else {
            alert("메모 삭제에 실패했습니다. 다시 시도해주세요. ")
        }
    }

    return(
        <Container>
            <div className={'d-flex p-3 border bg-light'}>
                <ul className={classNames(Css.farmInfo, 'pl-3 pt-0 pb-1 m-0 f10 text-secondary')}>
                    <li>·대표자 : {producerName}</li>
                    <li>·사업자번호 : {coRegistrationNo}</li>
                    <li>·담당자 : {charger}</li>
                    <li>·이메일 : {email}</li>
                    <li>·담당자연락처 : {chargerPhone}</li>
                    <li>·고객센터 : {shopPhone}</li>
                    <li>·계좌정보 : {bankName}</li>
                    <li>{payoutAccountName} {payoutAccount}</li>
                </ul>
            </div>

            <div className={'p-3 border'}>
                <label>정산 check ({yearMonth})</label>
                <div className="d-flex ml-3 mt-2">
                    <label className={'text-secondary'}>계산서 발행</label>
                    <span className="ml-4">
                        <input checked={!invoice} type="radio" id="notyet" name="time" onChange={onRadioChange} value={'0'} />
                        <label for="notyet" className='pl-1 mr-3'>미발행</label>
                        <input checked={invoice} type="radio" id="done" name="time" onChange={onRadioChange} value={'1'} />
                        <label for="done" className='pl-1'>발행완료</label>
                    </span>
                </div>

                <div className="d-flex align-items-center ml-3 mt-2 mb-1">
                    <div className="" style={{width: '80px'}}>
                        <label className={'text-secondary m-0'}>입금확인</label>
                    </div>
                    <div className="" style={{width: '120px'}}>
                        <Input type='select' name='select' id='status' onChange={onSelectStatus}>
                            <option name='radio_notYet' value='0' selected={ paymentStatus === 0 }>정산예정</option>
                            <option name='radio_completed' value='1' selected={ paymentStatus === 1 }>계좌입금</option>
                            <option name='radio_forward' value='2' selected={ paymentStatus === 2 }>이월</option>
                        </Input>
                    </div>
                    { paymentStatus === 2 ? (
                        <div className="d-flex">
                            <div className="ml-3 d-flex align-items-center " style={{width: '100px'}}>
                                <label className={'text-secondary m-0'}>이월정산금액</label>
                            </div>
                            <div className="" style={{width: '150px'}}>
                                <Input type='number' value={forwardAmount} onChange={onChangeForwardAmount}/>
                            </div>
                        </div>
                        ) : null
                    }
                </div>

                <div className="d-flex ml-3 mt-3">
                    <label className={'text-secondary mr-3'}>전월 이월금액</label>
                    { ComUtil.addCommas(lastForwardAmount)}
                </div>
            </div>

            <div className={'p-3 border'}>
                <label>Memo</label>
                <div className="d-flex ml-3 mt-2 mb-3">
                    <label className={'text-secondary mr-3'}>오늘의 메모</label>
                    <div className="" style={{width: '500px'}}>
                        <Input type='text' value={todayMemo} onChange={onInputMemo}/>
                    </div>
                </div>
                {
                    showingMemoList.map((memo, index) => {
                        return(
                            <div key={'div'+index} className="d-flex ml-3 mt-2">
                                <div className="mr-4">
                                    {ComUtil.utcToString(memo.regDate,'YYYY-MM-DD HH:mm')}
                                </div>
                                <div className="mr-2" style={{maxWidth:480}}>
                                    {memo.content}
                                </div>

                                <div className='ml-auto'>
                                    <Button size='sm' onClick={delMemo.bind(this, memo)} className='ml-1'>삭제</Button>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="text-right mt-4">
                    <Button size={'sm'} outline color="secondary" style={{width: '80px'}}
                            onClick={getMoreMemoList}>
                            더보기
                    </Button>
                </div>
            </div>

            <div className='flex-grow-1 mt-4 align-items-center  justify-content-center'>
                <Button onClick={onSaveCheckData} block color={'info'}>저장</Button>
            </div>

        </Container>
    )
}

export default PaymentCheck