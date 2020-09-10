import React, { useState, useEffect } from 'react';
import { Col, Input, Container, Row, Label } from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import { blctToWonWithTime } from "~/lib/exchangeApi"

const BlySise = (props) => {

    const [blySiseInfo, setBlySiseInfo] = useState(null);

    const [isOpenFetch, setIsOpenFetch] = useState(props.open);

    useEffect( () => {
        search();
    },[isOpenFetch]);

    const search = async () => {
        const {data:blySiseData} = await blctToWonWithTime();
        setBlySiseInfo(blySiseData);
    };

    if(!blySiseInfo) return null;

    return (
        <Container>
            <div className='d-flex justify-content-center align-items-center m-2 mt-2'>
                <span className='text-black-50'>
                    {blySiseInfo && ComUtil.utcToString(blySiseInfo.time,'YYYY-MM-DD HH') + '시 기준'}
                </span>
            </div>
            <div className={'d-flex justify-content-around align-items-center m-2 mt-1 mb-3 p-4 bg-light'}>
                <div className={'f1 text-dark font-weight-bold'}>1BLY</div><div className={'f1 text-dark font-weight-bold'}>=</div><div className={'f1 text-info font-weight-bold'}>{blySiseInfo.blctToWon}원</div>
            </div>
            <div className='d-flex justify-content-center align-items-center m-2 mt-4'>
                <span className='text-black-50'>
                BLY 가격은 거래소를 기준으로 반영하여 계산됩니다. (거래소 : 코인마켓캡)
                </span>
            </div>
        </Container>
    )
}

export default BlySise