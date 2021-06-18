import React, { Component, PropTypes } from 'react'
import { FormGroup, Label, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import {FaSearchPlus} from 'react-icons/fa'
import { BlocerySpinner, B2cGoodsSelSearch } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getTimeSaleAdmin, setSuperRewardRegist, setSuperRewardUpdate } from '~/lib/adminApi'
import Style from './OrderCardTempReReg.module.scss'
import importImpUid from '~/images/importImpUid.png'
import axios from "axios";
import {Server} from "~/components/Properties";
import {getOrdersByOrderGroupNo} from "~/lib/shopApi";
import {map} from "lodash";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
export default class OrderCardTempReReg extends Component {
    constructor(props) {
        super(props);

        const {
            orderGroupNo,
            orderNo,
            goodsNm,
            consumerNm,
            consumerEmail,
            consumerPhone,
            cardPrice,
        } = this.props;

        this.state = {
            reOrder: {
                orderNo:orderNo,            // 주문번호
                goodsNm:goodsNm,            // 상품명
                merchantUid:orderGroupNo,   // 주문그룹번호 (아임포트 주문번호)
                consumerNm:consumerNm,
                consumerEmail:consumerEmail,
                consumerPhone:consumerPhone,
                cardPrice:cardPrice,
                impUid:''                   // 아임포트 impPgId
            }
        };
    }

    //밸리데이션 체크
    setValidatedObj = (reOrder) => {

        if(!reOrder.impUid) {
            alert("imp_uid 필수 입니다.");
            return false;
        }

        return true;

    };

    componentDidMount = () => {
    };

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;
        let reOrder = Object.assign({}, this.state.reOrder);
        let obj_state = {};
        reOrder[name] = value;
        obj_state.reOrder = reOrder;
        this.setState(obj_state);
    };

    onCancelClick = () => {
        // 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //등록 및 수정 처리
        const reOrder = Object.assign({}, this.state.reOrder);

        let return_chk = this.setValidatedObj(reOrder);
        if(!return_chk){
            return false;
        }

        // PG 결제일경우
        if (reOrder.impUid && reOrder.impUid.length > 0) {
            axios(
                Server.getRestAPIHost() + "/iamport/paycomplate",
                {
                    method: "post",
                    headers: {"Content-Type": "application/json"},
                    data: {
                        impUid: reOrder.impUid,
                        merchantUid: reOrder.merchantUid
                    },
                    withCredentials: true,
                    credentials: 'same-origin'
                }
            ).then(async ({data}) => {
                //결재성공
                if (data.resultStatus === "success" || data.resultStatus == "orderT") {
                    alert("주문 처리 완료되었습니다!!")
                    this.onCancelClick();
                }
                //주문정보가 없을경우
                if (data.resultStatus == "orderF") {
                    alert("주문정보가 존재하지 않습니다.");
                    this.onCancelClick();
                }
                //아임포트 REST API로부터 고유 UID가 같을경우 => 결제정보확인 및 서비스 루틴이 정상적이지 않으면
                if (data.resultStatus == "failed") {
                    alert("결재실패 - 비정상적인 결재로 인해 주문취소 처리 되었습니다.");
                    this.onCancelClick();
                }
                //위조된 결제시도
                if (data.resultStatus == "forgery") {
                    alert("결재실패 - 비정상적인 결재로 인해 주문취소 처리 되었습니다.");
                    this.onCancelClick();
                }
            });
        }
    };

    render() {
        const { reOrder } = this.state;

        const star = <span className='text-danger'>*</span>;

        return (
            <div className={Style.wrap}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            아임포트PG결제내역 : <a href={'https://admin.iamport.kr/'} target="_blank">https://admin.iamport.kr/</a> 에서 주문내역 확인 후 <br/>
                            결제는 했지만 주문내역이 없으신 고객분일 경우, <br/>
                            imp_uid 을 입력해 주셔야 주문처리가 가능합니다! <br/>
                            <img src={importImpUid} />
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문 번호</Label>
                            <span className="ml-2">{reOrder.orderNo}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>상품명</Label>
                            <span className="ml-2">{reOrder.goodsNm}</span>
                        </div>

                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>merchant_uid</Label>
                            <span className="ml-2">{reOrder.merchantUid}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자</Label>
                            <span className="ml-2">{reOrder.consumerNm}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자EMail</Label>
                            <span className="ml-2">{reOrder.consumerEmail ? reOrder.consumerEmail:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자연락처</Label>
                            <span className="ml-2">{reOrder.consumerPhone ? reOrder.consumerPhone:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>카드결제금액</Label>
                            <span className="ml-2">{reOrder.cardPrice}원</span>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>imp_uid {star}</Label>
                            <div className="input-group">
                                <input type="text"
                                       name={'impUid'}
                                       className="ml-1"
                                       style={{width:'200px'}}
                                       value={reOrder.impUid||""}
                                       placeholder={'imp_uid'}
                                       onChange={this.onInputChange} />
                            </div>
                        </div>
                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>
                        </div>
                    </div>

                </div>

            </div>
        )
    }
}