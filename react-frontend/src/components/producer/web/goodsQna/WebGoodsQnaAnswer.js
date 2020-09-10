import React, { Component, Fragment } from 'react';
import { Container, ListGroup, ListGroupItem, FormGroup, Label, Button } from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import Select from 'react-select';
import moment from 'moment-timezone';
import Textarea from 'react-textarea-autosize'
import { getGoodsQnaByGoodsQnaNo, setGoodsQnaAnswerByGoodsQnaNo } from '~/lib/producerApi';

import { ToastContainer, toast } from 'react-toastify'; //토스트
import 'react-toastify/dist/ReactToastify.css';

import Style from './WebGoodsQnaAnswer.module.scss';
import { Server } from '~/components/Properties'

export default class WebGoodsQnaAnswer extends Component{
    constructor(props){
        super(props);
        this.state = {
            goodsQnaNo: this.props.goodsQnaNo,
            goodsQna: null,
            act:"U"
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    async componentDidMount(){
        this.search();
    }

    search = async () => {
        const { data: goodsQna } = await getGoodsQnaByGoodsQnaNo(this.state.goodsQnaNo);
        console.log({goodsQna });
        if(goodsQna.goodsQnaStat === "ready"){
            this.act = "U";
        }else{
            this.act = "R";
        }
        this.setState({
            act:this.act,
            goodsQna: goodsQna
        })
    }

    onGoodsQnaAnsChange = (e) => {
        const { name, value } = e.target;
        const goodsQna = Object.assign({}, this.state.goodsQna);
        goodsQna[name] = value;

        if(value.length > 0) {
            goodsQna['goodsQnaStat'] = 'success';   //답변완료
        }else{
            goodsQna['goodsQnaStat'] = 'ready';     //답변대기
        }

        this.setState({
            goodsQna: goodsQna
        })
    }

    onClose = (refreash) => {
        this.props.onClose(refreash) //부모(GoodsQnaList.js) callback
    }

    onSave = async () => {
        console.log(this.state.goodsQna);

        if(!this.state.goodsQna.goodsAns){
            this.notify('답변내용을 입력해 주십시오!', toast.warn);
            return
        }

        const { status, data } = await setGoodsQnaAnswerByGoodsQnaNo(this.state.goodsQna);
        console.log("status",status)
        console.log("data",data)
        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error);
            return
        }

        alert('저장되었습니다.');
        this.onClose(true);  //부모(GoodsQnaList.js) callback
    }


    render(){
        if(!this.state.goodsQna) return null;

        const { goodsQna } = this.state;

        return(
            <Fragment>

                <div className={'p-4'}>
                    <div className={'d-flex align-items-center m-2 border p-2'}>
                        <img className={'rounded-sm mr-3'} style={{width: 60, height: 60, objectFit: 'cover'}} src={Server.getThumbnailURL() + goodsQna.goodsImages[0].imageUrl}/>
                        <div>{ goodsQna.goodsName }</div>
                        <div className={'ml-auto small text-secondary'}>상품번호({goodsQna.goodsNo})</div>
                    </div>

                    <div className={'m-2 border'}>
                        <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                            <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-info text-white rounded-sm mr-2'}>
                                Q
                            </div>
                            <div>
                                { goodsQna.consumerName }
                            </div>
                            <div className={'m-2 text-secondary ml-auto'}>
                                {goodsQna.goodsQueDate && ComUtil.utcToString(goodsQna.goodsQueDate,'YYYY-MM-DD HH:MM')}
                            </div>
                        </div>
                        <div className={'p-3'} style={{whiteSpace:"pre-line"}}>
                            {goodsQna.goodsQue}
                        </div>
                    </div>


                    <div className={'m-2 border'}>
                        <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                            <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-danger text-white rounded-sm mr-2'}>
                                A
                            </div>
                            <div>
                                {goodsQna.producerName} ( {goodsQna.farmName} )
                            </div>
                            <div className={'m-2 text-secondary ml-auto'}>
                                { goodsQna.goodsAnsDate && ComUtil.utcToString(goodsQna.goodsAnsDate,'YYYY-MM-DD HH:MM')}
                            </div>
                        </div>
                        <div className={'p-3'} style={{whiteSpace:"pre-line"}}>
                            {
                                this.state.act === 'U' ?
                                    <Textarea
                                        name="goodsAns"
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        className={'border-info'}
                                        rows={3}
                                        maxRows={3}
                                        onChange={this.onGoodsQnaAnsChange}
                                        placeholder='상품문의에 대한 답변내용을 입력해 주세요.'>{goodsQna.goodsAns}</Textarea>
                                    :
                                    <p style={{whiteSpace:"pre-line"}}>
                                        {goodsQna.goodsAns}
                                    </p>
                            }
                        </div>
                    </div>

                    <div className={'m-2 d-flex justify-content-center'}>
                        <Button onClick={this.onClose}>{this.state.act === 'U' ? '취소':'닫기' }</Button>
                        {
                            this.state.act === 'U' ?
                                <Button className={'ml-2'} color={'info'} onClick={this.onSave}>확인</Button>
                                :null
                        }

                    </div>

                </div>

                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </Fragment>
        )
    }
}