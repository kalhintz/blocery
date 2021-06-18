import React, { Component, useState, useEffect } from 'react';
import {getAbuserByConsumerNo} from "~/lib/adminApi";
import {Div, Span} from '~/styledComponents/shared/Layouts'

const AbuserRenderer = (props) => {
    const [state, setState] = useState({
        blocked: null,
        memo: ''
    });

    useEffect(() => {
        getAbuser()
    }, [])

    const getAbuser = () => {
        const consumerNo = props.data.consumerNo
        if (consumerNo > 0)
            getAbuserByConsumerNo(consumerNo).then(({data}) => {
                if (data)
                    setState(data)
            })
    }

    const {blocked, memo} = state

    if (blocked === null)
        return null

    return (
        <Div>
            {
                state.hackerFlag && <Span fg={'danger'}>해커/</Span>
            }
            {
                state.blocked ?
                <>
                    <Span fg={'danger'}>어뷰저</Span>
                    <Span>({state.memo})</Span>
                </> :
                    <Span>내역 존재</Span>
            }

        </Div>
    )
}
export default AbuserRenderer