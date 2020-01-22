import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Badge, Alert, InputGroup } from 'reactstrap'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { SingleImageUploader, FooterButtonLayer } from '~/components/common'
import { BlocerySpinner } from '~/components/common'

import axios from 'axios';
import { getSellerShopBySellerNo, setSellerShopModify } from '~/lib/b2bSellerApi'

import Style from './ShopModify.module.scss'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const style = {
    cell: {
        padding: 0,
        margin: 0
    }
}
export default class ShopModify extends Component {

    constructor(props) {
        super(props);

        const { sellerNo } = this.props;

        this.state = {
            isOpen: false,
            isDidMounted:false,
            loading: false,    //블로서리 로딩용
            loginUser: {},
            sellerShop: {
                sellerNo:sellerNo,          //생산자NO
                email:null,                 //생산자 이메일
                name:null,                  //생산자명
                farmName:null,              //농장명

                profileImages:[],           //상점 프로필 사진
                profileBackgroundImages:[], //상점 프로필 배경 사진
                shopBizType:null,           //상점 업종
                shopZipNo:null,             //상점 우편번호
                shopAddress:null,           //상점 주소
                shopAddressDetail:null,     //상점 주소상세
                shopPhone:null,             //상점 고객센터(연락처)
                shopMainItems:null,         //상점 주요취급품목
                shopIntroduce:null          //상점 한줄소개
            },

            // region ===== 주소검색용 ag-grid =====
            columnDefs: [
                {headerName: "주소", cellRenderer: "jusoAddressRenderer", width: 500}
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
            },
            frameworkComponents: {
                jusoAddressRenderer:this.jusoAddressRenderer
            },
            rowHeight: 50,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            // endregion ===== 주소검색용 ag-grid =====
            /* region === 주소검색용 === */
            jusoModal:false,  //주소검색 모달
            jusoInputAddress: '',
            jusoTotalCount: '', //검색건수text
            jusoResults:[], //[{zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}, {zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}]
            /* endregion === 주소검색용 === */
        }
    }

    componentDidMount = async() => {
        this.search();
    }

    //조회
    search = async () => {

        //생산자 번호
        let sellerNo = this.state.sellerShop.sellerNo;

        const { status, data } = await getSellerShopBySellerNo(sellerNo);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({sellerShop:data,isDidMounted:true});

    }

    //프로필 이미지
    onProfileImageChange = (images) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.profileImages = images;
        this.setState({sellerShop})
    }
    //프로필배경 이미지
    onBackgroundImageChange = (images) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.profileBackgroundImages = images;
        this.setState({sellerShop})
    }

    //상점정보 온체인지 값
    onInputChange = (e) => {
        let { name, value } = e.target;
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop[name] = value;
        this.setState({sellerShop})
    }

    //상점정보 저장
    onSaveClick = async () => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        const {status, data} = await setSellerShopModify(sellerShop);
        if(status !== 200) {
            alert('상점정보 변경이 실패 하였습니다');
            return
        }
        console.log(data);
        if(data === 1) {
            this.props.onClose(true); //Shop.js callback search
            return
        }
    }

    //  region ===== 우편번호검색 팝업 메서드 모음 =====

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    //Ag-Grid Cell 주소검색 주소렌더러
    jusoAddressRenderer = ({value, data:rowData}) => {
        let zipNo = rowData.zipNo;
        let roadAddr = rowData.roadAddr;
        let jibunAddr = rowData.jibunAddr;
        return (
            <div>
                <small>도로명:</small><span className="text-primary" onClick={() => this.jusoAddressSelected(rowData,'R')} style={{cursor:'pointer'}}>({zipNo}){roadAddr}</span><br/>
                <small>지번:</small><span className="text-primary" onClick={() => this.jusoAddressSelected(rowData,'J')} style={{cursor:'pointer'}}>({zipNo}){jibunAddr}</span>
            </div>
        );
    }

    // 주소검색용 검색 온체인지
    jusoInputSearchHandleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    jusoAddressModalPopup = () => {
        this.setState({
            jusoModal:true //주소검색창 오픈.
        });
    }

    jusoSearchAPIcall = async () => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        //공공주소 open API
        let query = this.state.jusoInputAddress;
        //console.log('query:'+query);
        let bodyFormData = new FormData();

        bodyFormData.set('currentPage','1');
        bodyFormData.set('countPerPage','100');
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey','U01TX0FVVEgyMDE5MDQyNjEzMDEwNjEwODY4Mjc='); //이지팜 키.
        bodyFormData.set('keyword', query);

        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrLinkApiJsonp.do', { method: "post",
            data: bodyFormData,
            config: {
                headers: {
                    dataType:'jasonp',
                    crossDomain: true
                }
            }
        });
        //console.log(allResults);
        //괄호 제거
        let jsonResults = JSON.parse(allResults.substring(1, allResults.lastIndexOf(')')));
        let totalCount = jsonResults.results.common.totalCount;
        const juso = jsonResults.results.juso || [];
        let results = juso.map( (row,i) => {
                return {zipNo: row.zipNo, roadAddr: (row.roadAddrPart1 + row.roadAddrPart2), jibunAddr: row.jibunAddr };
            }
        );
        //console.log(totalCount);
        //console.log(results);
        this.setState({
            jusoTotalCount: totalCount,
            jusoResults: results
        });

        //ag-grid api
        if(this.gridApi) {

            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();
        }
    }

    jusoModalToggle = () => {
        this.setState(prevState => ({
            jusoModal: !prevState.jusoModal
        }));
    }

    jusoAddressSelected = (row, rlgb) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.shopZipNo = row.zipNo;
        let jusoAddress = "";
        if(rlgb === "R"){
            //도로명주소
            jusoAddress = row.roadAddr;
        }
        else if(rlgb === "J"){
            //지번주소
            jusoAddress = row.jibunAddr;
        }
        sellerShop.shopAddress = jusoAddress;
        this.setState({
            sellerShop
        });
        this.jusoModalToggle();
    }
    //  endregion ===== 우편번호검색 팝업 메서드 모음 =====

    render() {
        if(!this.state.isDidMounted) return null;
        let { sellerShop } = this.state;

        return(
            <div className={Style.wrap}>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/* region ===== 상점정보 수정 ===== */}
                <Container fluid>
                    <Row>
                        <Col sm={12} lg={12} className='border p-0'>
                            <Container>
                                <Row>
                                    <Col className='pt-2'>
                                        <h6>상점관리</h6>
                                        <Alert color={'secondary'} className='small'>
                                            - 상점은 내 회사(농가) 전용 정보 페이지 입니다.<br/>
                                            - 소비자에게 다양한 경로로 노출되는 화면이나 이미지, 텍스트 등 내용을 꼼꼼하게 등록해 주세요.<br/>
                                        </Alert>
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <Label>프로필사진</Label>
                                    <SingleImageUploader images={sellerShop.profileImages} defaultCount={1} isShownMainText={false} onChange={this.onProfileImageChange} />
                                    {/*<Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>*/}
                                </FormGroup>

                                <FormGroup>
                                    <Label>배경이미지</Label>
                                    <SingleImageUploader images={sellerShop.profileBackgroundImages} defaultCount={1} isShownMainText={false} onChange={this.onBackgroundImageChange} />
                                </FormGroup>

                                <FormGroup>
                                    <Label>업종</Label>
                                    <Input name="shopBizType"
                                           value={sellerShop.shopBizType || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>
                                <FormGroup>
                                    <Label>고객센터</Label>
                                    <Input name="shopPhone"
                                           placeholder={"고객센터 전화번호를 입력해 주세요 (예:XXX-XXXX-XXX)"}
                                           value={sellerShop.shopPhone || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>주소</Label>
                                    <InputGroup>
                                        <Input name="shopZipNo" placeholder="우편번호5자리" maxLength="5" value={sellerShop.shopZipNo || ''} onChange={this.onInputChange} />
                                        <Button outline color="secondary" onClick={this.jusoAddressModalPopup}>주소검색</Button>
                                    </InputGroup>
                                    <Input name="shopAddress" placeholder="주소" value={sellerShop.shopAddress || ''} onChange={this.onInputChange} />
                                    <Input name="shopAddressDetail" placeholder="상세주소" value={sellerShop.shopAddressDetail || ''} onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>주요취급품목</Label>
                                    <Input name="shopMainItems"
                                           placeholder={"주요취급품목을 입력해 주세요"}
                                           value={sellerShop.shopMainItems || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                                <FormGroup>
                                    <Label>한줄소개</Label>
                                    <Input name="shopIntroduce"
                                           placeholder="회사(농가)를 잘 표현할 수 있는 문구를 입력해 주세요."
                                           value={sellerShop.shopIntroduce || ''}
                                           onChange={this.onInputChange}/>
                                </FormGroup>

                            </Container>

                            <FooterButtonLayer data={[
                                <Button onClick={this.onSaveClick} block color={'warning'}>확인</Button>
                            ]} />
                        </Col>
                    </Row>
                </Container>
                {/* endregion ===== 상점정보 수정 ===== */}

                {/* region ===== 주소검색 모달 ===== */}
                <Modal isOpen={this.state.jusoModal} toggle={this.jusoModalToggle}>
                    <ModalHeader toggle={this.jusoModalToggle}> 주소 검색 </ModalHeader>
                    <ModalBody>
                        <Container fluid>
                            <Row>
                                <Col xs={9} style={style.cell}>
                                    <Input name="jusoInputAddress" type="text" placeholder="도로명 주소 입력" onChange={this.jusoInputSearchHandleChange}/>
                                </Col>
                                <Col xs={3} style={style.cell}>
                                    {' '}<Button block outline color="secondary" onClick={this.jusoSearchAPIcall}>검색</Button>
                                </Col>
                            </Row>
                            <p/>
                            {
                                this.state.jusoResults.length <= 0 && (
                                    <p className="text-muted text-center">검색된 내용이 없습니다</p>
                                )
                            }
                            {
                                this.state.jusoResults.length > 0 && (
                                    <Row>
                                        <Col xs={12} style={style.cell}>
                                            <small className="text-muted">검색결과 : <Badge color={'warning'}>{this.state.jusoTotalCount}</Badge> 건{this.state.jusoTotalCount >100 && '(100건 초과 - 필요시 재검색 요망)'}</small>
                                            <div
                                                id="myGrid"
                                                className={"ag-theme-balham"}
                                                style={{height:"300px"}}
                                            >
                                                <AgGridReact
                                                    enableSorting={false}                //정렬 여부
                                                    enableFilter={false}                 //필터링 여부
                                                    floatingFilter={false}               //Header 플로팅 필터 여부
                                                    columnDefs={this.state.columnDefs}  //컬럼 세팅
                                                    defaultColDef={this.state.defaultColDef}
                                                    rowSelection={false}  //멀티체크 가능 여부
                                                    rowHeight={this.state.rowHeight}
                                                    enableColResize={true}              //컬럼 크기 조정
                                                    overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                                                    overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                                                    onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                                                    rowData={this.state.jusoResults}
                                                    components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                                                    frameworkComponents={this.state.frameworkComponents}
                                                    suppressMovableColumns={true} //헤더고정시키
                                                >
                                                </AgGridReact>
                                            </div>
                                        </Col>
                                    </Row>
                                )
                            }
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.jusoModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* endregion ===== 주소검색 모달 ===== */}
            </div>
        )
    }
}
