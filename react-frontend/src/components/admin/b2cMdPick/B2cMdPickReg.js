import React, { Component, PropTypes } from 'react';
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, Alert, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

import moment from 'moment-timezone'

import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchPlus, faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons'
import
{
    BlocerySpinner,
    Spinner, RadioButtons, ModalConfirmButton, ProducerFullModalPopupWithNav,
    SingleImageUploader, FooterButtonLayer ,
    B2cGoodsSearch
} from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getAllGoods, getMdPick, setMdPickSave } from '~/lib/adminApi'
import Style from './B2cMdPickReg.module.scss'

export default class B2cMdPickReg extends Component{
    constructor(props) {
        super(props);

        const { mdPickId } = this.props;
console.log("mdPickId====>>>",mdPickId)
        this.state = {
            isDidMounted:false,
            focusedInput: null,

            mdPickTitleLenCnt:0,
            mdPickTitle1LenCnt:0,
            mdPickTitle2LenCnt:0,

            mdPick: {
                mdPickId:mdPickId,          // 기획전 ID
                mdPickNm:"",                        // 기획전 명
                mdPickStartDate:'',                 // 기획전 시작일
                mdPickEndDate:'',                   // 기획전 종료일

                mdPickMainImages:[],	            // 기획전 이미지 (메인)
                mdPickDetailImages:[],	            // 기획전 이미지 (상세)

                mdPickTitle:"",                     // 기획전 한줄 문구
                mdPickTitle1:"",                    // 기획전 타이틀 문구 1
                mdPickTitle2:"",                    // 기획전 타이틀 문구 2

                mdPickGoodsList: [],                // 기획전 상품
            },

            goodsSearchModal:false,
            currentGoodsIdx:null,
        };
    }

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    goodsSearchModalOnChange = (obj) => {

        let v_idx = this.state.currentGoodsIdx;

        const mdPick = Object.assign([], this.state.mdPick);

        mdPick.mdPickGoodsList[v_idx]["producerNo"] = obj.producerNo;
        mdPick.mdPickGoodsList[v_idx]["producerFarmNm"] = obj.producerFarmNm;
        mdPick.mdPickGoodsList[v_idx]["goodsNo"] = obj.goodsNo;
        mdPick.mdPickGoodsList[v_idx]["goodsNm"] = obj.goodsNm;

        this.setState({
            mdPick
        });

        this.goodsSearchModalToggle();
    };

    goodsSearchModalToggle = () => {
        this.setState(prevState => ({
            goodsSearchModal: !prevState.goodsSearchModal
        }));
    };

    //밸리데이션 체크
    setValidatedObj = (mdPick) => {

        if(mdPick.mdPickNm.length == 0) {
            alert("기획전명은 필수 입니다.");
            return false;
        }
        if(!mdPick.mdPickStartDate) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!mdPick.mdPickEndDate) {
            alert("종료일은 필수 입니다.");
            return false;
        }
        if(mdPick.mdPickMainImages.length == 0) {
            alert("이미지(메인)는 필수 입니다.");
            return false;
        }
        if(mdPick.mdPickDetailImages.length == 0) {
            alert("이미지(상세)는 필수 입니다.");
            return false;
        }
        if(mdPick.mdPickTitle.length == 0) {
            alert("한줄 문구는 필수 입니다.");
            return false;
        }
        if(mdPick.mdPickTitle1.length == 0) {
            alert("타이틀 문구 #1 은 필수 입니다.");
            return false;
        }
        if(mdPick.mdPickGoodsList.length == 0) {
            alert("상품등록은 필수 입니다.");
            return false;
        }

        if(mdPick.mdPickGoodsList.length > 0) {

            let goodsListCnt = 0;
            mdPick.mdPickGoodsList.map((items) => {
                if(items.goodsNo == ""){
                    goodsListCnt += 1;
                }
            });
            if(goodsListCnt > 0){
                alert("상품등록은 필수 입니다.");
                return false;
            }
        }

    };

    componentDidMount = async () => {

        if(this.state.mdPick.mdPickId){

            // 기획전 정보 조회
            let mdPick = Object.assign({}, this.state.mdPick);
            let mdPickId = this.state.mdPick.mdPickId;
            const { status, data } = await getMdPick(this.state.mdPick.mdPickId);
            //console.log("getMdPick==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            // let v_mdPickGoodsList = data.mdPickGoodsList;
            // let r_mdPickGoodsList = [];
            //
            // v_mdPickGoodsList.map((goodsNo) => {
            //     goodsAllList.filter(function (goodsItems) {
            //         let v_goodsNo = goodsItems.goodsNo;
            //         if(goodsNo === goodsItems.goodsNo){
            //             r_mdPickGoodsList.push({
            //                 producerNo: goodsItems.producerNo,
            //                 producerNm: goodsItems.contractHash,
            //                 goodsNo: goodsItems.goodsNo,
            //                 goodsNm: goodsItems.goodsNm,
            //             });
            //             return;
            //         }
            //     });
            // });
            data.mdPickId = mdPickId;
            let mdPickTitle_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle);
            let mdPickTitle1_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle1);
            let mdPickTitle2_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle2);
            //console.log("data===",data)
            mdPick = data;
            //mdPick.mdPickGoodsList = r_mdPickGoodsList;
            this.setState({
                mdPickTitleLenCnt:mdPickTitle_TotalByte,
                mdPickTitle1LenCnt:mdPickTitle1_TotalByte,
                mdPickTitle2LenCnt:mdPickTitle2_TotalByte,
                mdPick
            })

        }else{
            this.addRowMdPickGoods();
        }

        this.setState({isDidMounted:true})

    };

    //이미지(메인) 온체인지 이벤트
    onMdPickMainImagesChange = (images) => {
        const mdPick = Object.assign({}, this.state.mdPick);
        mdPick.mdPickMainImages = images;
        this.setState({mdPick})
    };

    //이미지(상세) 온체인지 이벤트
    onMdPickDetailImagesChange = (images) => {
        const mdPick = Object.assign({}, this.state.mdPick);
        mdPick.mdPickDetailImages = images;
        this.setState({mdPick})
    };

    //기획전 기간 달력 문구 렌더러
    renderMdPickCalendarInfo = () => <Alert className='m-1'>기획전 시작일 ~ 종료일을 선택해 주세요</Alert>;

    //기획전 기간 달력
    onMdPickDatesChange = ({ startDate, endDate }) => {
        const mdPick = Object.assign({}, this.state.mdPick);
        mdPick.mdPickStartDate = startDate && startDate.startOf('day');
        mdPick.mdPickEndDate = endDate && endDate.endOf('day');
        this.setState({mdPick})
    };

    //글자 길이 (영문:1,한글:1)
    getLengthMaxChkCount = (message, maxlen) => {
        let totalByte = 0;
        for (let index = 0, length = message.length; index < length; index++) {
            let currentByte = message.charCodeAt(index);
            (currentByte > 128) ? totalByte += 1 : totalByte++;
        }
        return totalByte;
    };

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;
        let mdPick = Object.assign({}, this.state.mdPick);

        let obj_state = {};
        mdPick[name] = value;

        if(name == "mdPickTitle"){
            let totalByte = this.getLengthMaxChkCount(value);
            if(totalByte > 25){
                alert("최대 글자수가 25자를 넘었습니다.");
                return;
            }
            obj_state.mdPickTitleLenCnt = totalByte;
        }
        else if(name == "mdPickTitle1"){
            let totalByte = this.getLengthMaxChkCount(value);
            if(totalByte > 15){
                alert("최대 글자수가 15자를 넘었습니다.");
                return;
            }
            obj_state.mdPickTitle1LenCnt = totalByte;
        }
        else if(name == "mdPickTitle2"){
            let totalByte = this.getLengthMaxChkCount(value);
            if(totalByte > 15){
                alert("최대 글자수가 15자를 넘었습니다.");
                return;
            }
            obj_state.mdPickTitle2LenCnt = totalByte;
        }
        obj_state.mdPick = mdPick;
        this.setState(obj_state);
    };

    // 상품검색 클릭
    goodsSearchModalPopup = (e) => {
        let v_idx = e.target.getAttribute("data-index");

        this.setState({
            currentGoodsIdx : v_idx,
            goodsSearchModal: true
        })
    };

    //상품 컴포넌트 관련 온체인지
    onInputMdPickGoodsChange = (e) => {
        let v_idx = e.target.getAttribute("data-index");
        let { name, value } = e.target;
        const mdPick = Object.assign([], this.state.mdPick);
        const list = mdPick.mdPickGoodsList;

        if(name == "mdPickGoodsNo"){
            if(value.length > 0) {
                mdPick.mdPickGoodsList[v_idx]["goodsNo"] = value;
            }else{
                mdPick.mdPickGoodsList[v_idx]["producerNo"] = "";
                mdPick.mdPickGoodsList[v_idx]["producerFarmNm"] = "";
                mdPick.mdPickGoodsList[v_idx]["goodsNo"] = "";
                mdPick.mdPickGoodsList[v_idx]["goodsNm"] = "";
            }
        }

        this.setState({
            mdPick
        });
    };
    //상품 온체인지 인풋박스
    addRowMdPickGoods = () => {
        const mdPick = Object.assign({}, this.state.mdPick);
        let v_idx = 1;
        let data = {
            idx:v_idx,
            producerNo:"",
            producerFarmNm:"",
            goodsNo: "",
            goodsNm: ""
        };

        if(mdPick.mdPickGoodsList){
            v_idx = mdPick.mdPickGoodsList.length + 1;
        }else{
            mdPick.mdPickGoodsList = [];
        }

        mdPick.mdPickGoodsList.push(data);
        this.setState({
            mdPick
        });
    };

    delRowMdPickGoods = (e) => {
        const mdPick = Object.assign({}, this.state.mdPick);
        let v_idx = e.target.getAttribute("data-index");
        let tempRows = mdPick.mdPickGoodsList.filter((row,index) => {
            if(index != v_idx){
                return row
            }
        });
        mdPick.mdPickGoodsList=tempRows;
        this.setState({
            mdPick
        });
    };


    onCancelClick = () => {
        // 기획전 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //기획전 등록 및 수정 처리
        const mdPick = Object.assign({}, this.state.mdPick);

        this.setValidatedObj(mdPick);

        let v_mdPickGoodsList = mdPick.mdPickGoodsList;
        let p_mdPickGoodsList = [];
        v_mdPickGoodsList.map((items) => {
            if(ComUtil.toNum(items.goodsNo) > 0){
                p_mdPickGoodsList.push(items.goodsNo);
            }
        });
        mdPick.mdPickGoodsList = p_mdPickGoodsList;
        let params = mdPick;

        const { status, data } = await setMdPickSave(params);
        if(status !== 200){
            alert('기획전 저장이 실패 하였습니다');
            return
        }
        if(status === 200){
            // 기획전 닫기 및 목록 재조회
            let params = {
                refresh:true
            };
            this.props.onClose(params);
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { mdPick } = this.state;

        const star = <span className='text-danger'>*</span>;

        const btnCancel = <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>;
        const btnSave = <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>;

        return (
            <div className={Style.wrap}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                            설정된 기간에 기획전이 APP에 노출되오니 정확하게 입력해 주세요.
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            기획전명 {star}
                        </Label>
                        <div>
                            <input
                                type="text"
                                name={"mdPickNm"}
                                style={{width:'80%'}}
                                value={mdPick.mdPickNm}
                                onChange={this.onInputChange}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전명은 APP에 노출되는 것은 아니며 관리를 위한 항목입니다.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                        <div>
                            <DateRangePicker
                                startDateId='my-mdPickStartDate'
                                endDateId='my-mdPickEndDate'
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={this.state.mdPick.mdPickStartDate ? moment(this.state.mdPick.mdPickStartDate) : null}
                                endDate={this.state.mdPick.mdPickEndDate ? moment(this.state.mdPick.mdPickEndDate) : null}
                                onDatesChange={this.onMdPickDatesChange}
                                focusedInput={this.state.focusedInput}
                                onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
                                numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                orientation={'horizontal'}
                                openDirection="up"
                                withPortal
                                small
                                readOnly
                                showClearDates
                                calendarInfoPositio="top"
                                renderCalendarInfo={this.renderMdPickCalendarInfo}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전이 APP에 노출되는 기간을 선택해 주세요.
                        </span>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>이미지(메인) {star}</Label>
                        <div>
                            <SingleImageUploader
                                images={ mdPick.mdPickMainImages}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={this.onMdPickMainImagesChange}
                                isNoResizing={true}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전 목록에 노출되는 메인 이미지를 등록해 주세요.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>이미지(상세) {star}</Label>
                        <div>
                            <SingleImageUploader
                                images={mdPick.mdPickDetailImages}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={this.onMdPickDetailImagesChange}
                                isNoResizing={true}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전 상세화면에 노출되는 상세 이미지를 등록해 주세요.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>한 줄 문구 {star}</Label>
                        <div className="d-flex align-items-center">
                            <Input
                                type='text'
                                name='mdPickTitle'
                                style={{width:'80%'}}
                                maxLength="25"
                                value={mdPick.mdPickTitle}
                                onChange={this.onInputChange}
                            /> ({this.state.mdPickTitleLenCnt}/25)
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전 목록에 노출되는 한 줄 문구를 입력해 주세요.(최대 25자)
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>타이틀 문구 #1 {star}</Label>
                        <div className="d-flex align-items-center">
                            <Input
                                type='text'
                                name='mdPickTitle1'
                                style={{width:'80%'}}
                                maxLength="15"
                                value={mdPick.mdPickTitle1}
                                onChange={this.onInputChange}
                            /> ({this.state.mdPickTitle1LenCnt}/15)
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전 목록에 노출되는 타이틀 문구 첫 번째 줄을 입력해 주세요.(최대 15자)
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>타이틀 문구 #2</Label>
                        <div className="d-flex align-items-center">
                            <Input
                                type="text"
                                name="mdPickTitle2"
                                style={{width:'80%'}}
                                maxLength="15"
                                value={mdPick.mdPickTitle2}
                                onChange={this.onInputChange}
                            /> ({this.state.mdPickTitle2LenCnt}/15)
                        </div>
                        <span className={'small text-secondary'}>
                            * 기획전 목록에 노출되는 타이틀 문구 두 번째 줄을 입력해 주세요.(최대 15자)
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>상품등록 {star}</Label>
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-1">
                                {
                                    mdPick.mdPickGoodsList && mdPick.mdPickGoodsList.map((mdPickGoods,index) => (

                                        <div key={'mdPickGoodsList'+index}
                                             className="d-flex align-items-center mb-1" >
                                            <div className="input-group">
                                                <input type="text"
                                                       name={'mdPickProducerNo'}
                                                       data-index={index}
                                                       className="ml-1"
                                                       style={{width:'100px'}}
                                                       value={mdPickGoods.producerNo||""}
                                                       readOnly='readonly'
                                                       placeholder={'생산자번호'}
                                                       onChange={this.onInputMdPickGoodsChange} />
                                                <input type="text"
                                                       name={'mdPickProducerFarmNm'}
                                                       data-index={index}
                                                       className="ml-1"
                                                       style={{width:'200px'}}
                                                       value={mdPickGoods.producerFarmNm||""}
                                                       readOnly='readonly'
                                                       placeholder={'생산자명'}
                                                       onChange={this.onInputMdPickGoodsChange} />
                                                <input type="text"
                                                       name={'mdPickGoodsNm'}
                                                       data-index={index}
                                                       className="ml-1"
                                                       style={{width:'300px'}}
                                                       value={mdPickGoods.goodsNm||""}
                                                       readOnly='readonly'
                                                       placeholder={'상품명'}
                                                       onChange={this.onInputMdPickGoodsChange} />
                                                <input type="number"
                                                       name={'mdPickGoodsNo'}
                                                       data-index={index}
                                                       className="ml-1"
                                                       style={{width:'100px'}}
                                                       value={mdPickGoods.goodsNo||""}
                                                       placeholder={'상품번호'}
                                                       onChange={this.onInputMdPickGoodsChange} />
                                                <div className="input-group-append">
                                                    <Button color={'info'}
                                                            data-index={index}
                                                            onClick={this.goodsSearchModalPopup}>
                                                        <FontAwesomeIcon icon={faSearchPlus} /> 상품검색
                                                    </Button>
                                                </div>

                                                <Button
                                                    className="ml-2"
                                                    color={'info'}
                                                    data-index={index}
                                                    onClick={this.delRowMdPickGoods}><FontAwesomeIcon icon={faMinusCircle} /> 삭제</Button>

                                            </div>

                                        </div>

                                    ))
                                }
                                <div>
                                    <Button
                                        className="m-2"
                                        color={'info'}
                                        onClick={this.addRowMdPickGoods}><FontAwesomeIcon icon={faPlusCircle} /> 상품 행 추가</Button>
                                </div>
                            </div>

                        </div>
                        <span className={'small text-secondary'}>
                            * 상품번호를 입력해 주세요.
                        </span>
                    </FormGroup>

                    <FooterButtonLayer data={[
                        btnCancel,
                        btnSave,
                    ]} />

                </div>


                {/*상품검색 모달 */}
                <Modal size="lg" isOpen={this.state.goodsSearchModal}
                       toggle={this.goodsSearchModalToggle} >
                    <ModalHeader toggle={this.goodsSearchModalToggle}>
                        상품 검색
                    </ModalHeader>
                    <ModalBody>
                        <B2cGoodsSearch onChange={this.goodsSearchModalOnChange} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.goodsSearchModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </div>
        )
    }
}
