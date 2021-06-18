import React, { Component, Suspense} from 'react';
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import { Cell, ModalConfirm } from '~/components/common'
import { Server } from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import { getConsumerKycList, setConsumerKycAuth } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { BlocerySpinner } from '~/components/common'

import {Div, Link, Flex, Span, FilterGroup, Hr} from '~/styledComponents/shared'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

import moment from 'moment-timezone'
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import AbuserRenderer from '../../common/agGridRenderers/AbuserRenderer';
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import StoppedUserRenderer from "~/components/common/agGridRenderers/StoppedUserRenderer";
import KycView from "~/components/common/contents/KycView";
import {FiLink} from 'react-icons/fi'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";

export default class ConsumerKycList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: null,
            loading: false,
            isMoalOpen: false,
            modalType: '',  //kyc, consumerDetail
            focused:null,
            search: {
                kycAuth: 1,
                consumerNo: 0,
                year:moment().format('YYYY')
            },
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
                    cellRenderer: "nameRenderer",
                    cellStyle:this.getCellStyle({cellAlign: 'left'})
                },
                {
                    headerName: "어뷰징", field: "abuser", cellRenderer: "abuserRenderer",
                    cellStyle:this.getCellStyle({cellAlign: 'left'})
                },
                {
                    headerName: "탈퇴", field: "abuser", cellRenderer: "stoppedUserRenderer",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'})
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
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {
                nameRenderer: this.nameRenderer,
                abuserRenderer: AbuserRenderer,
                stoppedUserRenderer: StoppedUserRenderer,
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
        } else if(kycAuth === 3){
            kycAuthStatus = '보류'
        }else {
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

    nameRenderer = ({value, data:rowData}) => {
        return (<Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.name}</u></Span>);
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
            console.log("image====",image)
            console.log("src====",src)
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

    onNameClick = (row) => {
        this.setState({
            isMoalOpen: true,
            modalType: 'consumerDetail',
            consumerNo: row.consumerNo
        })
    }

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
        this.setState({
            consumerNo: rowData.consumerNo,
            isMoalOpen: true,
            modalType: 'kyc',
        });
    }

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, this.state.search);
        search.year = date.getFullYear();
        await this.setState({search:search});
        await this.search();
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        // console.log("onGridReady");
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
                <Flex p={5}>
                    <div className='ml-2'>
                        <Input type='select' name='select'
                               id='kycAuth'
                               onChange={this.onStateChange}>
                            <option name='radio1' value='-1'>승인거절</option>
                            <option name='radio2' value='3'>보류</option>
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

                    <Link to={'/admin/shop/order/swapTokenOutList'} fg={'primary'} ml={10}>
                        <Flex fontSize={12} bc={'secondary'} cursor={1} p={5} rounded={3}>
                            <Flex mr={3}><FiLink/></Flex>
                            토큰출금 페이지
                        </Flex>
                    </Link>

                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>
                </Flex>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} excelFileName={'KYC 인증 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'consumerNo', name: '소비자번호'},
                                {field: 'name', name: '이름'},
                                {field: 'email', name: '이메일'},
                                {field: 'phone', name: '연락처'},
                                {field: 'kycReason', name: '승인거절사유'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'kycType'}
                            name={'kyc-종류'}
                            data={[
                                {value: '주민등록증', name: '주민등록증'},
                                {value: '운전면허증', name: '운전면허증'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'kycLevel'}
                            name={'kyc-레벨'}
                            data={[
                                {value: 0, name: '0'},
                                {value: 1, name: '1'},
                                {value: 2, name: '2'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}

                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '550px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        rowHeight={75}
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
                {/* KYC 인증 모달 */}
                <Suspense fallback={''}>
                    <Modal
                           size={'lg'}
                           style={{maxWidth: '100vw', width: '80%'}}
                           isOpen={this.state.isMoalOpen && this.state.modalType === 'kyc'}
                           toggle={this.kycModalToggle} >
                        <ModalHeader toggle={this.kycModalToggle}>
                            KYC 인증
                        </ModalHeader>
                        <ModalBody>
                            <KycView
                                consumerNo={this.state.consumerNo}
                                callback={() => {
                                    this.kycModalToggle();
                                    this.search()
                                }}
                            />
                        </ModalBody>
                    </Modal>
                </Suspense>


                <Modal size="lg" isOpen={this.state.isMoalOpen && this.state.modalType === 'consumerDetail'}
                       toggle={this.kycModalToggle} >
                    <ModalHeader toggle={this.kycModalToggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.consumerNo} onClose={this.kycModalToggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.kycModalToggle}>닫기</Button>
                    </ModalFooter>
                </Modal>

            </div>
        );
    }
}