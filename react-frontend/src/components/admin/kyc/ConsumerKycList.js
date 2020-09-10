import React, { Component, PropTypes, lazy, Suspense} from 'react';
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import { Cell, ModalConfirm } from '~/components/common'
import { Server } from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import { getConsumerKycList, setConsumerKycAuth } from '~/lib/adminApi'
import { isTokenAdminUser, getLoginAdminUser } from '~/lib/loginApi'
import { BlocerySpinner } from '~/components/common'

import {Flex} from '~/styledComponents/shared'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

import moment from 'moment-timezone'
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

export default class ConsumerKycList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            isMoalOpen: false,
            focused:null,
            search: {
                kycAuth: 1,
                consumerNo: 0,
                year:moment().format('YYYY')
            },
            kycReasonList:[
                {value: '', label: '거절 사유 선택 (편의기능)'},
                {value: '위조 사진을 이용한 경우', label: '위조 사진을 이용한 경우'},
                {value: '인터넷에서 다운로드 한 사진을 이용한 경우', label: '인터넷에서 다운로드 한 사진을 이용한 경우'},
                {value: '낮은 품질의 사진을 이용한 경우', label: '낮은 품질의 사진을 이용한 경우'},
                {value: '신분증 사진이 이용되지 않은 경우', label: '신분증 사진이 이용되지 않은 경우'},
                {value: '관련이 없는 사진을 이용한 경우', label: '관련이 없는 사진을 이용한 경우'},
                {value: '신분증사진과 셀피사진이 일치하지 않는 경우', label: '신분증사진과 셀피사진이 일치하지 않는 경우'},
                {value: '여권 또는 신분증이 유효하지 않는 경우', label: '여권 또는 신분증이 유효하지 않는 경우'},
                {value: '다른 나라 출신의 신청자를 수락하지 않았거나 거주 허가가없는 경우', label: '다른 나라 출신의 신청자를 수락하지 않았거나 거주 허가가없는 경우'},
                {value: '중복 신청한 경우', label: '중복 신청한 경우'},
                {value: '요구 사항을 충족하지 못하는 경우', label: '요구 사항을 충족하지 못하는 경우'},
                {value: '특정 지역 / 국가의 지원자가 등록 할 수없는 경우', label: '특정 지역 / 국가의 지원자가 등록 할 수없는 경우'},
                {value: '기타 이유 (대부분의 경우 낮은 화질의 사진을 사용했을 경우가 높음)', label: '기타 이유 (대부분의 경우 낮은 화질의 사진을 사용했을 경우가 높음)'}
            ],
            kycReasonSelected:'',
            kycModal: {
                consumerNo:0,
                consumerName:"",
                consumerEmail:"",
                consumerPhone:"",
                kycType:"",
                kycAuth:1,
                kycReason:"",
                kycImages:null,
                kycTimestamp:null
            },
            data: [],
            columnDefs: [
                {
                    headerName: "소비자번호", field: "consumerNo", width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'center'})
                },
                {
                    headerName: "이름", field: "name", width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'left'})
                },
                {
                    headerName: "이메일", field: "email", width: 150,
                    cellStyle:this.getCellStyle({cellAlign: 'left'})
                },
                {
                    headerName: "연락처", field: "phone", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'left'})
                },
                {
                    headerName: "KYC-종류", field: "kycType", width: 140,
                    cellStyle:this.getCellStyle({cellAlign: 'center'})

                },
                {
                    headerName: "KYC-이미지", field: "kycImages", width: 250,
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"kycImageRenderer",
                },
                {
                    headerName: "KYC-레벨", field: "kycLevel", width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'center'})
                },
                {
                    headerName: "KYC-처리상태", field: "kycAuth", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return ConsumerKycList.getKYCAuthStatus(params.data.kycAuth)
                    }
                },
                {
                    headerName: "신청일", field: "kycTimestamp", width: 140,
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return ComUtil.utcToString(params.data.kycTimestamp, 'YYYY-MM-DD HH:mm')
                    }
                },
                {
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 100,
                    cellRenderer: "kycButtonRenderer"
                },
                {
                    headerName: "승인거절사유",
                    field: "kycReason",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    width: 300
                },
            ],
            defaultColDef: {
                width: 110,
                resizable: true,
            },
            frameworkComponents: {
                kycImageRenderer: this.kycImageRenderer,
                kycButtonRenderer: this.kycButtonRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }
    static getKYCAuthStatus = (kycAuth) => {
        let kycAuthStatus = '';
        if(kycAuth === -1) {
            kycAuthStatus = '승인거절'
        } else if(kycAuth === 0) {
            kycAuthStatus = '미인증'
        } else if(kycAuth === 1) {
            kycAuthStatus = '신청'
        } else if(kycAuth === 2){
            kycAuthStatus = '승인처리'
        } else {
            kycAuthStatus = ''
        }
        return kycAuthStatus;
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    };
    formatDateTimeRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    //KYC 이미지 렌더러
    kycImageRenderer = ({value: images}) => {
        const rootUrl = Server.getImgTagServerURL();
        const Style = {
            width: 75, height: 75, paddingRight: '1px'
        };
        if(!images){return "이미지없음";}
        return images.map((image,index) => {
            const src = rootUrl + image.imageUrlPath + image.imageUrl;
            return <img key={"kycImage"+index} src={src} style={Style} alt={'KYC-이미지'}/>
        })
    };



    kycButtonRenderer = ({value, data:rowData}) => {
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    <Button block size='sm' color={'info'} onClick={this.onKycModalOpen.bind(this,rowData)}>KYC인증</Button>
                </div>
            </Cell>
        );
    };

    async componentDidMount() {
        // 토큰 권한 관리자
        // let {data:result} = await isTokenAdminUser();
        // if (!result) {
        //     //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
        //     window.location = '/admin/login';
        // }

        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async () => {
        this.setState({loading: true});

        const searchInfo = this.state.search;
        const params = {
            kycAuth:searchInfo.kycAuth,
            consumerNo:searchInfo.consumerNo,
            year:searchInfo.year
        }
        const { status, data } = await getConsumerKycList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }
        //console.log("getConsumerKycList==",data);

        this.setState({
            data: data,
            loading: false
        })
    }

    // 조회할 KYC상태 change
    onStateChange = async (e) => {

        const search_kycAuth = e.target.value;

        const search = Object.assign({},this.state.search);
        search.kycAuth = search_kycAuth;

        await this.setState({
            search: search
        });

        await this.search();
    }

    kycModalToggle = () => {
        this.setState(prevState => ({
            isMoalOpen: !prevState.isMoalOpen
        }));
    };

    onKycModalOpen = (rowData) => {
        const consumerNo = rowData.consumerNo;
        const consumerEmail = rowData.email;
        const consumerName = rowData.name;
        const consumerPhone = rowData.phone;
        const res_KycModal = Object.assign({},this.state.kycModal);
        res_KycModal.consumerNo = consumerNo;
        res_KycModal.consumerName = consumerName;
        res_KycModal.consumerEmail = consumerEmail;
        res_KycModal.consumerPhone = consumerPhone;
        res_KycModal.kycType = rowData.kycType;
        res_KycModal.kycAuth = rowData.kycAuth;
        res_KycModal.kycReason = rowData.kycReason;
        res_KycModal.kycImages = rowData.kycImages;
        res_KycModal.kycTimestamp = rowData.kycTimestamp;

        this.setState({
            isMoalOpen: true,
            kycReasonSelected:"",
            kycModal:res_KycModal
        });
    }

    onKycAuthUpdate = async (kycAuth, isConfirmed) => {

        const res_KycModal = Object.assign({}, this.state.kycModal);
        const p_consumerNo = res_KycModal.consumerNo;
        const p_kycAuth = kycAuth;
        const p_kycReason = res_KycModal.kycReason||"";

        if(p_kycAuth == -1){
            if(p_kycReason.length == 0) {
                alert("승인거절시 승인사유를 꼭 입력해 주세요!");
                return false;
            }
        }

        if(isConfirmed) {

            // 이메일 보내느라 시간이 좀 걸림.. 로딩 필요
            this.setState({loading: true});

            const res = await setConsumerKycAuth({consumerNo: p_consumerNo, kycAuth: p_kycAuth, kycReason:p_kycReason})
            //console.log("=====",res)
            if (res.data) {
                this.setState({loading: false});

                if (kycAuth == 2) {
                    alert("KYC 승인처리가 되었습니다!");
                } else if (kycAuth == -1) {
                    alert("KYC 승인거절처리가 되었습니다!");
                }
                await this.search();
                this.kycModalToggle();
            }
        }
    }

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, this.state.search);
        search.year = date.getFullYear();
        await this.setState({search:search});
        await this.search();
    }

    // kyc 사유 선택
    onChangeKycReasonInfo = async (data) => {
        const v_kycReason = data.value;
        const kycModal = Object.assign({},this.state.kycModal);
        kycModal.kycReason = v_kycReason;
        await this.setState({
            kycReasonSelected:v_kycReason,
            kycModal: kycModal
        });
    }

    // kyc 사유 온체인지
    onKycReasonChange = async (e) => {
        const v_kycReason = e.target.value;
        const kycModal = Object.assign({},this.state.kycModal);
        kycModal.kycReason = v_kycReason;
        await this.setState({
            kycModal: kycModal
        });
    }

    render() {

        // if(this.state.data.length <= 0)
        //     return null
        const ExampleCustomDateInput = ({ value, onClick }) => (
            <Button
                color="secondary"
                active={true}
                onClick={onClick}>신청 {value} 년</Button>
        );

        return(
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <div className="d-flex p-1">
                    <div className='ml-2'>
                        <Input type='select' name='select'
                               id='kycAuth'
                               onChange={this.onStateChange}>
                            <option name='radio1' value='-1'>승인거절</option>
                            {/*<option name='radio2' value='0'>미인증</option>*/}
                            <option name='radio3' value='1' selected>신청</option>
                            <option name='radio4' value='2'>승인처리</option>
                        </Input>
                    </div>
                    <div className='ml-2'>
                        <DatePicker
                            selected={new Date(moment().set('year',this.state.search.year))}
                            onChange={this.onSearchDateChange}
                            showYearPicker
                            dateFormat="yyyy"
                            customInput={<ExampleCustomDateInput />}
                        />
                    </div>
                    <div className='ml-2'>
                        <Button color={'info'} onClick={this.search}>검색</Button>
                    </div>
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </div>
                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '550px'
                    }}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        rowHeight={75}
                    >
                    </AgGridReact>
                </div>
                {/* KYC 인증 모달 */}
                <Suspense fallback={''}>
                    <Modal
                           size={'lg'}
                           style={{maxWidth: '100vw', width: '80%'}}
                           isOpen={this.state.isMoalOpen}
                           toggle={this.kycModalToggle} >
                        <ModalHeader toggle={this.kycModalToggle}>
                            KYC 인증
                        </ModalHeader>
                        <ModalBody>
                            <div>
                                <div className='mb-1'>
                                    이름(번호) : {this.state.kycModal.consumerName}({this.state.kycModal.consumerNo})<br/>
                                    연락처/이메일 : {this.state.kycModal.consumerPhone} / {this.state.kycModal.consumerEmail}<br/>
                                    신청일 : {ComUtil.utcToString(this.state.kycModal.kycTimestamp, 'YYYY-MM-DD HH:mm')}<br/>
                                    KYC종류 : {this.state.kycModal.kycType}
                                </div>
                                <Flex>
                                {
                                    this.state.kycModal.kycImages &&
                                    this.state.kycModal.kycImages.map((kycImage, index) => {
                                        return kycImage &&
                                            <div className="d-flex align-items-center mb-1" style={{width:'700px'}}>
                                                <img
                                                    style={{width:'100%'}}
                                                    src={kycImage.imageUrl ? Server.getImgTagServerURL() + kycImage.imageUrlPath + kycImage.imageUrl : ''}
                                                 />
                                            </div>

                                    })
                                }
                                </Flex>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div>
                                <label>승인거절 사유(15자이내로 짧게 입력)</label>
                                <div className="mb-1">
                                    <Select options={this.state.kycReasonList}
                                            value={ this.state.kycReasonList.find(item => item.value === this.state.kycReasonSelected)}
                                            onChange={this.onChangeKycReasonInfo}
                                    />
                                </div>
                                <Input type='text' name='kycReason' id='kycReason'
                                       size={300}
                                       value={this.state.kycModal.kycReason||""}
                                       onChange={this.onKycReasonChange}
                                />
                            </div>
                        </ModalFooter>
                        <ModalFooter>
                            <Button
                                color="secondary"
                                onClick={this.kycModalToggle}>취소</Button>

                            <ModalConfirm title={'승인거절'} content={'KYC 인증을 승인거절 하시겠습니까? 승인거절시 승인사유를 꼭 입력해 주세요! (승인거절시 이미지가 삭제 처리되어집니다.)'}
                                          onClick={this.onKycAuthUpdate.bind(this,-1)}>
                                <Button color={'danger'}>거절</Button>
                            </ModalConfirm>

                            <ModalConfirm title={'인증승인'} content={'KYC 인증을 승인처리 하시겠습니까? (인증승인시 이미지가 삭제 처리되어집니다.)'}
                                          onClick={this.onKycAuthUpdate.bind(this,2)}>
                                <Button color={'info'}>승인</Button>
                            </ModalConfirm>
                        </ModalFooter>
                    </Modal>
                </Suspense>
            </div>
        );
    }
}