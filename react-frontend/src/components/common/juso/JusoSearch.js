import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Badge } from 'reactstrap'

import axios from 'axios';

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
class JusoSearch extends Component{
    constructor(props){
        super(props)
        this.state = {
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

        let {data:allResults} = await axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrLinkApiJsonp.do', { method: "post",
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

    jusoAddressSelected = (row, rlgb) => {
        let jusoZipNo = row.zipNo;
        let jusoAddress = "";
        if(rlgb === "R"){
            //도로명주소
            jusoAddress = row.roadAddr;
        }
        else if(rlgb === "J"){
            //지번주소
            jusoAddress = row.jibunAddr;
        }
        let result = {
            zipNo : jusoZipNo,
            address : jusoAddress
        };

        this.props.onChange(result);
    }
    //  endregion ===== 우편번호검색 팝업 메서드 모음 =====

    render(){

        return(
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
        )
    }
}
JusoSearch.propTypes = {
}
JusoSearch.defaultProps = {
}
export default JusoSearch
