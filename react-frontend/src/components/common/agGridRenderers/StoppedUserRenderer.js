import React, { Component, useState, useEffect } from 'react';
// import {getConsumerByConsumerNo} from "~/lib/shopApi";
import {getConsumerByConsumerNo} from '~/lib/adminApi'
import {Span} from '~/styledComponents/shared/Layouts'
import ComUtil from "~/util/ComUtil";

const StoppedUserRenderer = (props) => {
    const [state, setState] = useState({
        stoppedDate: null,
        stoppedUser: false
    });

    useEffect(() => {
        getAbuser()
    }, [])

    const getAbuser = () => {
        const consumerNo = props.data.consumerNo
        if (consumerNo > 0)
            getConsumerByConsumerNo(consumerNo).then(({data}) => {
                if (data) {
                    console.log({data: data})
                    const {stoppedDate, stoppedUser} = data
                    setState({
                        stoppedDate,
                        stoppedUser
                    })
                }
            })
    }

    const {stoppedUser, stoppedDate} = state

    return (
        stoppedUser ?
        <>
            <Span fg={'danger'}>{ComUtil.intToDateString(stoppedDate, 'YYYY-MM-DD')}</Span>
        </> : null
    )
}
export default StoppedUserRenderer