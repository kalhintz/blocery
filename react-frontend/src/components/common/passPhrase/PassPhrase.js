import React from 'react'
import { Table, Container, Row, Col, Button } from 'reactstrap';
import Style from './PassPhrase.module.scss'
import { faStarOfLife, faEraser,faBackspace, faRandom } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class PassPhrase extends React.Component {

    //컴포넌트 생성자 메소드
    constructor(props) {
        super(props);

        this.state = {
            passPhraseClass1:null,
            passPhraseClass2:null,
            passPhraseClass3:null,
            passPhraseClass4:null,
            passPhraseClass5:null,
            passPhraseClass6:null,
        };
        this.passPhraseAuthNo='';
        this.pad = []
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.clearPassPhrase !== this.props.clearPassPhrase && this.props.clearPassPhrase === true) {
            this.setState({
                passPhraseClass1:null,
                passPhraseClass2:null,
                passPhraseClass3:null,
                passPhraseClass4:null,
                passPhraseClass5:null,
                passPhraseClass6:null
            });
            this.passPhraseAuthNo='';
            this.props.onChange('');
        }
    }

    //컴포넌트 렌더링 시에 호출됨
    componentDidMount() {
        this.random();
    }

    // 0~9 의 랜덤 숫자 생성(중복x)
    random = () => {
        this.pad = [];

        while(true) {
            for (var i = 0; i < 10; i++) {
                const rand = Math.floor(Math.random() * 10) + 0

                this.pad.push(rand); //기존에 실패해도 앞부분 데이터 재활용

                this.pad = this.pad.reduce(function (a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                }, []);
            }
            if (this.pad.length >= 10 ) {
                break;
            }
        }

    }

    //6자리 비번 조인Join)해서 결과 리턴
    getPassPhrase = () => {
        let passPhrase = this.passPhraseAuthNo;
        return passPhrase;
    }

    //doClick
    passPhraseDoClick = (e) => {
        let curUpw='',i=1;
        let pincode = e.currentTarget.textContent;
        //console.log(e.currentTarget.textContent);
        //return;
        curUpw = String(this.passPhraseAuthNo);
        if (curUpw.length >= 6) {
            //alert('6자리까지만 입력가능합니다.');
            return false;
        }
        //console.log(curUpw.length);
        this.passPhraseAuthNo = (String(curUpw) + String(pincode));

        let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
        let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
        for(i = 1; i <= (curUpw.length + 1); i++){
            if(i == 1) passPhraseClass1 = "on";
            if(i == 2) passPhraseClass2 = "on";
            if(i == 3) passPhraseClass3 = "on";
            if(i == 4) passPhraseClass4 = "on";
            if(i == 5) passPhraseClass5 = "on";
            if(i == 6) passPhraseClass6 = "on";
        }
        this.setState({
            passPhraseClass1: passPhraseClass1,
            passPhraseClass2: passPhraseClass2,
            passPhraseClass3: passPhraseClass3,
            passPhraseClass4: passPhraseClass4,
            passPhraseClass5: passPhraseClass5,
            passPhraseClass6: passPhraseClass6
        });

        //6자리 입력 값 가져오기
        let result = this.getPassPhrase();
        //console.log("===result==="+result);

        //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
        this.props.onChange(result);
    }

    //doClear (백스페이스)
    passPhraseDoClearClick = (e) => {
        var curUpw='',i=1;
        if(this.passPhraseAuthNo !== '') {
            curUpw = String(this.passPhraseAuthNo);
            this.passPhraseAuthNo = curUpw.substr(0,curUpw.length -1);
            let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
            let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
            for(i = 1; i < curUpw.length; i++){
                if(i == 1) passPhraseClass1 = "on";
                if(i == 2) passPhraseClass2 = "on";
                if(i == 3) passPhraseClass3 = "on";
                if(i == 4) passPhraseClass4 = "on";
                if(i == 5) passPhraseClass5 = "on";
                if(i == 6) passPhraseClass6 = "on";
            }

            this.setState({
                passPhraseClass1: passPhraseClass1,
                passPhraseClass2: passPhraseClass2,
                passPhraseClass3: passPhraseClass3,
                passPhraseClass4: passPhraseClass4,
                passPhraseClass5: passPhraseClass5,
                passPhraseClass6: passPhraseClass6
            });

            //6자리 입력 값 가져오기
            let result = this.getPassPhrase();
            //console.log("===result==="+result);

            //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
            this.props.onChange(result);
        }
    }

    //doAllClear (전체삭제)
    passPhraseDoAllClearClick = (e) => {
        this.random();
        let passPhraseClass1=null, passPhraseClass2=null, passPhraseClass3=null;
        let passPhraseClass4=null, passPhraseClass5=null, passPhraseClass6=null;
        this.passPhraseAuthNo='';
        this.setState({
            passPhraseClass1: passPhraseClass1,
            passPhraseClass2: passPhraseClass2,
            passPhraseClass3: passPhraseClass3,
            passPhraseClass4: passPhraseClass4,
            passPhraseClass5: passPhraseClass5,
            passPhraseClass6: passPhraseClass6
        });
        //6자리 입력 값 가져오기
        let result = this.getPassPhrase();
        //console.log("===result==="+result);
        //부모의 onChange 속성 이벤트로 결과값을 넘겨줌
        this.props.onChange(result);
    }

    render() {
        return(
            <div>
                <div className="d-flex align-items-center justify-content-center bg-light" style={{height:'170px'}}>
                    {
                        (this.state.passPhraseClass1 ||
                        this.state.passPhraseClass2 ||
                        this.state.passPhraseClass3 ||
                        this.state.passPhraseClass4 ||
                        this.state.passPhraseClass5 ||
                        this.state.passPhraseClass6) ? (
                            <>
                            <div
                                id="key_1"
                                className={
                                    this.state.passPhraseClass1 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')

                                }
                            >{this.state.passPhraseClass1 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            <div
                                id="key_2"
                                className={
                                    this.state.passPhraseClass2 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')
                                }
                            >{this.state.passPhraseClass2 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            <div
                                id="key_3"
                                className={
                                    this.state.passPhraseClass3 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')
                                }
                            >{this.state.passPhraseClass3 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            <div
                                id="key_4"
                                className={
                                    this.state.passPhraseClass4 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')
                                }
                            >{this.state.passPhraseClass4 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            <div
                                id="key_5"
                                className={
                                    this.state.passPhraseClass5 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')
                                }
                            >{this.state.passPhraseClass5 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            <div
                                id="key_6"
                                className={
                                    this.state.passPhraseClass6 ?
                                        [Style.character,Style.on,'mr-1 p-1 rounded-sm'].join(' ') :
                                        [Style.character,'mr-1 p-1 rounded-sm'].join(' ')
                                }
                            >{this.state.passPhraseClass6 ? <FontAwesomeIcon icon={faStarOfLife} /> : ""}</div>
                            </>
                        ) : (
                            <div className={Style.fadeIn}>
                                <div className={'font-weight-border f1 text-center'}><u>비밀번호</u></div>
                                <small>블록체인 결제시 사용됩니다</small>
                            </div>
                        )
                    }

                </div>



                <div class={Style.container}>
                <div class={Style.row}>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[0]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[1]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[2]}</figure>
                </div>
                <div class={Style.row}>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[3]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[4]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[5]}</figure>
                </div>
                <div class={Style.row}>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[6]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[7]}</figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[8]}</figure>
                </div>
                <div class={Style.row}>
                    <figure onClick={this.passPhraseDoAllClearClick}><FontAwesomeIcon icon={faRandom} size={'1x'} /></figure>
                    <figure onClick={this.passPhraseDoClick}>{this.pad[9]}</figure>
                    <figure onClick={this.passPhraseDoClearClick}><FontAwesomeIcon icon={faBackspace} /></figure>
                </div>
                </div>

            </div>
        );
    }
}
export default PassPhrase
