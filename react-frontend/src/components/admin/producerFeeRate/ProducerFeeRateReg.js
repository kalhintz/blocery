import React, { useState, useEffect } from 'react';
import { Container, Input, Label, Button } from 'reactstrap';
import { regProducerFeeRate } from '~/lib/adminApi'

const ProducerFeeRateReg = (props) => {

    const [producerRateId, setProducerRateId] = useState(props.feeRateData.producerRateId || '');
    const [rate, setRate] = useState(props.feeRateData.rate || '');
    const [explain, setExplain] = useState(props.feeRateData.explain || '');

    useEffect(() => {
        console.log('props: ', props);
    }, []);

    const onSaveFeeRate = async() => {
        let feeRate = {
            producerRateId: producerRateId,
            rate: rate,
            explain: explain
        }

        // 등록 api 호출
        const { data } = await regProducerFeeRate(feeRate);
        if(data) {
            alert('생산자 수수료율을 등록하였습니다.');
            props.onClose();
        } else {
            alert('해당 수수료율을 사용하는 생산자가 있어 생산자 수수료율 수정에 실패하였습니다. ');
            props.onClose();
        }
    }

    const onChangeRate = (e) => {
        setRate(e.target.value);

    }

    const onChangeExplain = (e) => {
        setExplain(e.target.value);
    }

    return (
        <Container>
            <br/>
            <div className={'d-flex mb-3'}>
                <span>번호 : </span>
                <span>{producerRateId}</span>
            </div>

            <Label className={'text-secondary'} > 생산자 수수료율(%) </Label>
            <Input type='text' value={rate} onChange={onChangeRate}/>

            <Label className={'text-secondary mt-3'}> 설명 </Label>
            <Input type='text' value={explain} onChange={onChangeExplain}/>

            <br/><br/>
            <div className={'text-right'}>
                <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onSaveFeeRate} >등 록</Button>
            </div>

        </Container>
    )
}

export default ProducerFeeRateReg