import React, { Component } from 'react'
import Style from './FarmDiaryReg.module.scss'
import { Container, FormGroup, Label, FormText } from 'reactstrap'
import { SingleImageUploader, FormGroupInput, FooterButtonLayer, ModalConfirm } from '../../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { addFarmDiary, updFarmDiary, delFarmDiary } from '~/lib/producerApi'
import { getItems } from '~/lib/adminApi'
import { Button, Alert } from 'reactstrap'
import PropTypes from 'prop-types'

import ComUtil from '../../../../util/ComUtil'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';

import Select from 'react-select'
import Textarea from 'react-textarea-autosize'

const cultivationStep = [
    { value: '0', label:'단계없음'},
    { value: '1', label:'파종단계'},
    { value: '2', label:'발아단계'},
    { value: '3', label:'정식단계'},
    { value: '4', label:'수확단계'}]

class FarmDiaryReg extends Component{
    constructor(props){
        super(props)
        //쿼리스트링 파싱
        // const params = ComUtil.getParams(this.props)
        // const { goodsNo, diaryNo, cultivationDiary } = this.props

        // console.log(cultivationDiary.diaryRegDate? true : false)
        // console.log(this.props)


        //기본값 지정
        this.state = {
            // goodsNo: this.props.goodsNo,                    //조회 화면에서 받아야 할 상품번호
            bindData: {
                items: [],
                itemKinds: []
            },
            //등록 시 사용
            farmDiary: {
                diaryNo: null,	            //순번 (diaryNo 가 null 일 경우 신규 재배일지 등록, 값이 있을 경우 업데이트)
                diaryRegDate: '',	        //등록일자
                diaryImages: [],	        //재배 현황 이미지
                cultivationStepNm: '단계없음',	//재배단계
                cultivationStepCd: '0',	    //재배단계 코드
                cultivationStepMemo: '',	//제목
                diaryContent: '',	        //내용
                contractHash: '',	        //블록체인 저장된 해시값
                itemNo: null,
                itemName: null,
                itemKindCode: null,
                itemKindName: null
            },
            isSaving: false
        }

    }

    name = {
        diaryNo: 'diaryNo',	                        //순번
        diaryRegDate: 'diaryRegDate',	            //등록일자
        diaryImages: 'diaryImages',	                //재배 현황 이미지
        cultivationStepNm: 'cultivationStepNm',	    //재배단계
        cultivationStepCd: 'cultivationStepCd',	    //재배단계코드
        cultivationStepMemo: 'cultivationStepMemo',	//제목
        diaryContent: 'diaryContent',	            //내용
        contractHash: 'contractHash',	            //블록체인 저장된 해시값
        itemNo: 'itemNo',                           //품목번호
        itemKindCode: 'itemKindCode'                //품종번호

    }
    star = <span className='text-danger'>*</span>



    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    async componentDidMount(){

        await this.bind()

    }

    bind = async () => {
        const { data } = await getItems(true)

        const items =  data.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled}))

        const state = Object.assign({}, this.state)

        state.bindData.items = items

        if(this.props.farmDiary){
            const itemKinds = this.getItemKinds(this.props.farmDiary.itemNo)
            state.bindData.itemKinds = itemKinds
            state.farmDiary = this.props.farmDiary
        }
        this.setState(state)
    }

    //등록 | 수정
    save = async () => {

        const farmDiary = Object.assign({}, this.state.farmDiary)
        console.log(farmDiary)
        const validArr = [
            {key: this.name.diaryRegDate, msg: '날짜'},
            {key: this.name.itemNo, msg: '품목'},
            {key: this.name.itemKindCode, msg: '품종'},
            {key: this.name.diaryImages, msg: '작물현황 이미지는 최소 한장이상 필요합니다'},
            {key: this.name.cultivationStepMemo, msg: '제목'},
        ]

        const resultData = ComUtil.validate(farmDiary, validArr)

        if(!resultData.result)
            return

        if(!this.state.isSaving) {
            this.setState({isSaving: true})
            const {data: diaryNo} = farmDiary.diaryNo ? await updFarmDiary(farmDiary) : await addFarmDiary(farmDiary)

            farmDiary.diaryNo = diaryNo

            this.setState({
                farmDiary: farmDiary,
                isSaving: false
            })

            this.notify('저장되었습니다', toast.success)
        }

    }
    //재배일지 삭제
    delete = async() => {
        await delFarmDiary(this.state.farmDiary.diaryNo)
        // this.notify('삭제되었습니다', toast.success)
        this.props.onClose()//창닫기
    }

    getItemKinds = (itemNo) => {
        const item = this.state.bindData.items.find(item => item.value === itemNo)
        const itemKinds = item.itemKinds.map(itemKind => {
            const tempItemKind = typeof itemKind === 'string' ? JSON.parse(itemKind) : itemKind
            return {
                value: tempItemKind.code,
                label: tempItemKind.name
            }
        })
        return itemKinds
    }

    //품목
    onItemChange = (item) => {
        const state = Object.assign({}, this.state)

        //품목이 바뀌었을경우 품목 클리어 & 재바인딩
        if(item.value !== state.farmDiary.itemNo){

            //품목 변경
            state.farmDiary.itemNo  = item.value
            state.farmDiary.itemName  = item.label

            //품종 바인딩
            const itemKinds = this.getItemKinds(item.value)
            state.bindData.itemKinds = itemKinds
            //품종 클리어
            state.farmDiary.itemKindCode = null
            state.farmDiary.itemKindName = null

            this.setState(state)
        }
    }

    //품종
    onItemKindChange = ({value: itemKindCode, label: itemKindName}) => {
        const state = Object.assign({}, this.state)
        state.farmDiary.itemKindCode = itemKindCode
        state.farmDiary.itemKindName = itemKindName
        this.setState(state)
    }

    //작물현황 이미지
    onDiaryImageChange = (images) => {
        // const data = Object.assign({}, this.state)
        // data.diaryImages = images
        // this.setState({
        //     data: data
        // })
        const farmDiary = Object.assign({}, this.state.farmDiary)
        farmDiary.diaryImages = images
        this.setState({farmDiary})
    }

    //재배단계
    onCultivationStepClick = ({label, value}) => {
        const farmDiary = Object.assign({}, this.state.farmDiary)
        farmDiary.cultivationStepNm = label
        farmDiary.cultivationStepCd = value
        this.setState({farmDiary})
    }
    //재배단계 메모
    onInputChange = (e) => {
        const farmDiary = Object.assign({}, this.state.farmDiary)
        farmDiary[e.target.name] = e.target.value
        this.setState({farmDiary})
    }
    //저장
    onBtnSaveClick = (e) => {
        this.save()
    }
    //삭제
    onBtnDeleteClick = (isConfirmed) => {
        if(isConfirmed)
            this.delete()
    }
    //목록
    onBtnCloseClick = (e) => {
        this.props.onClose()
    }

    onFocusChange = ({focused}) => {
        this.setState({focused})
    }

    //
    onDiaryRegDateChange = (date) => {
        const farmDiary = Object.assign({}, this.state.farmDiary)
        farmDiary.diaryRegDate = date
        this.setState({farmDiary})
    }

    //일자 달력 문구 렌더러
    renderDiaryRegDateCalendarInfo = () => <Alert className='m-1'>작업일자를 선택해주세요</Alert>

    render(){


        return(
            <div className={Style.wrap}>
                <Container>
                    <FormGroup>
                        <Label>날짜{this.star}</Label>
                        {this.props.a}
                        <div>
                            <SingleDatePicker
                                placeholder="일자"
                                date={this.state.farmDiary.diaryRegDate ? moment(this.state.farmDiary.diaryRegDate) : null}
                                onDateChange={this.onDiaryRegDateChange.bind(this)}
                                focused={this.state.focused} // PropTypes.bool
                                onFocusChange={this.onFocusChange} // PropTypes.func.isRequired
                                id={"diaryRegDate"} // PropTypes.string.isRequired,
                                numberOfMonths={1}
                                withPortal  //모달
                                small
                                readOnly
                                calendarInfoPosition="top"
                                enableOutsideDays={true}
                                daySize={40}
                                // verticalHeight={700}
                                renderCalendarInfo={this.renderDiaryRegDateCalendarInfo}

                                showDefaultInputIcon
                                showClearDate
                                isOutsideRange={()=>false}

                            />

                            <FormText>{'재배일지의 날짜를 선택해 주세요'}</FormText>
                        </div>
                    </FormGroup>
                    <hr/>
                    <FormGroup>
                        <Label className={'text-secondary'}>품목{this.star}</Label>
                        <Select options={this.state.bindData.items}
                                value={this.state.bindData.items.find(item => item.value === this.state.farmDiary.itemNo)}
                                onChange={this.onItemChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label className={'text-secondary'}>품종{this.star}</Label>
                        <Select options={this.state.bindData.itemKinds}
                                value={ this.state.bindData.itemKinds.find(item => item.value === this.state.farmDiary.itemKindCode) || null}
                                onChange={this.onItemKindChange}
                        />
                        <FormText>등록한 상품의 품목/품종과 매칭되어 상품의 생산일지에 자동 노출됩니다</FormText>
                    </FormGroup>
                    <hr/>
                    <FormGroup>
                        <Label>작물현황 이미지{this.star}</Label>
                        {/*<ImageUploader onChange={this.onDiaryImageChange} multiple={true} limit={10}/>*/}
                        <SingleImageUploader images={this.state.farmDiary.diaryImages} defaultCount={3} isShownMainText={false} onChange={this.onDiaryImageChange} />
                        <FormText>이미지는 1장이상 등록해야 합니다</FormText>
                    </FormGroup>
                    <hr/>
                    {/*
                        <FormGroup>
                            <Label>재배단계{this.star}</Label>
                            <RadioButtons
                                value={cultivationStep.find(item => item.value === this.state.farmDiary.cultivationStepCd)}
                                options={cultivationStep} onClick={this.onCultivationStepClick}/>
                        </FormGroup>
                    */}
                    <FormGroupInput
                        title={'제목'}
                        name={this.name.cultivationStepMemo}
                        value={this.state.farmDiary.cultivationStepMemo}
                        explain={'파종준비 및 소독, 벌목, 종자준비, 비닐작업 등..'}
                        isRequired
                        onChange={this.onInputChange}
                    />
                    <FormGroup>
                        <Label className={'text-secondary'}>메모</Label>
                        <Textarea style={{width: '100%', minHeight: 30, borderRadius: 0, border: 0, borderBottom: '2px solid'}}
                                  name={this.name.diaryContent}
                                  className={'border-info'}
                                  onChange={this.onInputChange}
                                  inputRef={el => this.diaryContent = el}
                                  value={this.state.farmDiary.diaryContent}
                                  placeholder='작업 내용입니다'/>
                    </FormGroup>

                </Container>

                <FooterButtonLayer data={[
                    <Button color={'secondary'} onClick={this.onBtnCloseClick} block>닫기</Button>,
                    <Button color={'warning'} onClick={this.onBtnSaveClick} disabled={this.state.isSaving} block>저장</Button>,
                    this.state.farmDiary.diaryNo ? (
                        <ModalConfirm title={'삭제하시겠습니까?'} content={'삭제된 데이터는 복구 불가능 합니다'} onClick={this.onBtnDeleteClick}>
                            <Button color="danger" block>삭제</Button>
                        </ModalConfirm>
                    ) : null
                ]} />
                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </div>
        )
    }
}

FarmDiaryReg.propTypes = {
    farmDiary: PropTypes.shape({
        diaryRegDate: PropTypes.instanceOf(Date),	//등록일자
        producerNo: PropTypes.number,
        diaryImages: PropTypes.arrayOf({
            imageNo: PropTypes.number.isRequired,
            imageNm: PropTypes.string.isRequired,
            imageUrl: PropTypes.string.isRequired
        }),	                                    //재배 현황 이미지
        cultivationStepNm: PropTypes.string,	//재배단계
        cultivationStepCd: PropTypes.string,	//재배단계 코드
        cultivationStepMemo: PropTypes.string,	//제목
        diaryContent: PropTypes.string,	        //내용
        contractHash: PropTypes.string,	        //블록체인 저장된 해시값
        itemNo: PropTypes.number,
        itemKinkCode: PropTypes.number,
        itemKindName: PropTypes.string
    })
}
//defaultProps에서 nested 된 object 일 경우 merge 되지 않습니다

export default FarmDiaryReg