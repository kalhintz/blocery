import React, { Component } from 'react'
import { Button } from 'reactstrap'

import { setConsumerStop } from '~/lib/adminApi'

export default class StoppedConsumer extends Component{
    constructor(props) {
        super(props);
        this.state = {
            consumer: this.props.data,
            refresh: 0
        }
    }

    componentDidMount() {

    }

    onClick = async () => {
        const consumer = this.state.consumer
        if(!window.confirm('해당 회원을 탈퇴 처리 하시겠습니까?')) {
            return false
        } else {
            const {status, data} = await setConsumerStop(consumer)

            if(status === 200) {
                alert('회원 탈퇴처리 완료했습니다')
                this.props.onClose();
            }
        }
    }

    render() {
        const consumer = this.state.consumer
        return (
            <div className='p-2'>
                <div className='mb-2'>회원명 : {consumer.name}</div>
                <div className='mb-2'>Email : {consumer.email}</div>
                <div className='mb-2'>결제비밀번호 : {consumer.hintFront}**{consumer.hintBack}</div>
                {
                    consumer.stoppedUser ? <div className='text-danger'>탈퇴한 회원</div> : <Button size='sm' onClick={this.onClick}>탈퇴처리</Button>
                }
            </div>
        )
    }

}