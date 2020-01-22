import React, { Component, Fragment } from 'react';
import { Container, ListGroup, ListGroupItem, FormGroup, Label, Button } from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import Select from 'react-select';
import moment from 'moment-timezone';
import Textarea from 'react-textarea-autosize'
import { getFoodsQnaByFoodsQnaNo, setFoodsQnaAnswerByFoodsQnaNo } from '~/lib/b2bSellerApi';

import { ToastContainer, toast } from 'react-toastify'; //토스트
import 'react-toastify/dist/ReactToastify.css';

import Style from './FoodsQnaAnswer.module.scss';

export default class FoodsQnaAnswer extends Component{
    constructor(props){
        super(props);
        this.state = {
            foodsQnaNo: this.props.foodsQnaNo,
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
        const { data: goodsQna } = await getFoodsQnaByFoodsQnaNo(this.state.foodsQnaNo);
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
        this.props.onClose(refreash) //부모(FoodsQnaList.js) callback
    }

    onSave = async () => {
        console.log(this.state.goodsQna);

        if(!this.state.goodsQna.goodsAns){
            this.notify('답변내용을 입력해 주십시오!', toast.warn);
            return
        }

        const { status, data } = await setFoodsQnaAnswerByFoodsQnaNo(this.state.goodsQna);
        console.log("status",status)
        console.log("data",data)
        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error);
            return
        }

        alert('저장되었습니다.');
        this.onClose(true);  //부모(FoodsQnaList.js) callback
    }


    render(){
        if(!this.state.goodsQna) return null;

        const { goodsQna } = this.state;

        return(
            <Fragment>
                <Container className={Style.wrap}>
                    <ListGroup>
                        <ListGroupItem>
                            <div>
                                <span className='f6 text-secondary'>{' 상품문의번호 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>{ goodsQna.foodsQnaNo }</span>
                                <span className='f6 text-secondary'>{ goodsQna.goodsQueDate ? ' 작성일 ' : null}</span>
                                <span className='f5 text-secondary text-dark'>{ goodsQna.goodsQueDate ? ComUtil.utcToString(goodsQna.goodsQueDate,'YYYY-MM-DD HH:MM'):null}</span>
                            </div>
                            <div>
                                <span className='f6 text-secondary'>{'(상품번호 '}</span>
                                <span className='f5 text-secondary text-dark'>{ goodsQna.foodsNo }</span>
                                <span className='f6 text-secondary'>{')'}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>{' '}{ goodsQna.goodsName }</span>
                            </div>
                            <div>
                                <span className='f6 text-secondary'>{' 문의자 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>{ goodsQna.consumerName }</span>
                            </div>
                            <span className='f6 text-secondary'>{' 상품문의 '}</span>
                            <div>
                                <p style={{whiteSpace:"pre-line"}}>
                                    {goodsQna.goodsQue}
                                </p>
                            </div>
                        </ListGroupItem>
                    </ListGroup>
                    <hr className={"p-0 m-1"} />
                    <div className={Style.answerBox}>
                        <FormGroup>
                            <div>
                            <Label>
                                <span className='f6 text-secondary'>{' 작성자 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>{goodsQna.producerName} ( {goodsQna.farmName} )</span>
                                <span className='f6 text-secondary'>{ goodsQna.goodsAnsDate ? ' 작성일 ' : null}</span>
                                <span className='f5 text-secondary text-dark'>{ goodsQna.goodsAnsDate ? ComUtil.utcToString(goodsQna.goodsAnsDate,'YYYY-MM-DD HH:MM'):null}</span>
                            </Label>
                            </div>
                            <Label><small>답변내용</small></Label>
                            <div className='p-0 m-0'>
                            {
                                this.state.act === 'U' ?
                                    <Textarea
                                        name="goodsAns"
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        className={'border-primary'}
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
                        </FormGroup>
                        <div className="d-flex justify-content-between p-1">
                            <div className="d-flex w-100">
                                <Button color={'primary'} block onClick={this.onClose}>{this.state.act === 'U' ? '취소':'닫기' }</Button>
                            </div>
                            {
                                this.state.act === 'U' ?
                                    <div className="d-flex w-100 pl-1">
                                        <Button color={'warning'} block onClick={this.onSave}>확인</Button>
                                    </div>
                                    :null
                            }
                        </div>
                    </div>
                </Container>
                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </Fragment>
        )
    }
}