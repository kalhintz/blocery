import React, { Component } from 'react';
import { FormGroup, Label, Button} from 'reactstrap'
import { BlocerySpinner, FooterButtonLayer} from '~/components/common'
import { getEventInfo, setEventInfoSave } from '~/lib/adminApi'
import QullEditor from '~/components/common/quillEditor';

export default class EventReg extends Component{
    constructor(props) {
        super(props);

        const { eventNo } = this.props;

        this.state = {
            isDidMounted: false,
            event: {
                eventNo: eventNo,          // 이벤트 No
                eventTitle: "",            // 이벤트 타이틀
                eventContent: "",          // 이벤트 내용
            }
        };
    }

    //밸리데이션 체크
    setValidatedObj = (event) => {

        if(event.eventTitle.length == 0) {
            alert("이벤트 타이틀은 필수 입니다.");
            return false;
        }

    };

    componentDidMount = async () => {

        if(this.state.event.eventNo){

            // 이벤트 정보 조회
            let event = Object.assign({}, this.state.event);
            let eventNo = this.state.event.eventNo;
            const { status, data } = await getEventInfo(this.state.event.eventNo);
            //console.log("getEvent==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            data.eventNo = eventNo;
            event = data;

            this.setState({
                event
            })

        }

        this.setState({isDidMounted:true})

    };

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;
        let event = Object.assign({}, this.state.event);

        let obj_state = {};
        event[name] = value;

        obj_state.event = event;
        this.setState(obj_state);
    };

    onEventContentChange = (editorHtml) => {
        const event = Object.assign({}, this.state.event);
        event.eventContent = editorHtml;
        this.setState({event});
    };

    onCancelClick = () => {
        //  닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //등록 및 수정 처리
        const event = Object.assign({}, this.state.event);

        if(event.eventTitle.length == 0) {
            alert("이벤트 타이틀은 필수 입니다.");
            return false;
        }

        let params = event;

        const { status, data } = await setEventInfoSave(params);
        if(status !== 200){
            alert('이벤트 저장이 실패 하였습니다');
            return
        }
        if(status === 200){
            // 닫기 및 목록 재조회
            let params = {
                refresh:true
            };
            this.props.onClose(params);
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { event } = this.state;

        const star = <span className='text-danger'>*</span>;

        const btnCancel = <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>;
        const btnSave = <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>;

        return (
            <div style={{position: 'relative'}}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            이벤트 타이틀 {star}
                        </Label>
                        <div>
                            <input
                                type="text"
                                name={"eventTitle"}
                                style={{width:'80%'}}
                                value={event.eventTitle}
                                onChange={this.onInputChange}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>이벤트 내용</Label>
                        <div className="d-flex align-items-center">
                            <QullEditor
                                editorHtml={event.eventContent}
                                onChange={this.onEventContentChange}
                            />
                        </div>
                    </FormGroup>


                    <FooterButtonLayer data={[
                        btnCancel,
                        btnSave,
                    ]} />

                </div>

            </div>
        )
    }
}
