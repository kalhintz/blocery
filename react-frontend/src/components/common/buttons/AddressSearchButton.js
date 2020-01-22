import React, {Component, Fragment} from 'react'
import { Modal, ModalHeader, ModalBody, Container, Row, Col, Badge, Input, Button, ModalFooter } from 'reactstrap'
import axios from 'axios';
import proj4 from 'proj4';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';



export default class AddressSearchButton extends Component {

    constructor(props){
        super(props)

        this.state = {
            isOpen: false,


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

    componentDidMount(){
    }

    toggle = () => {
        const isOpen = !this.state.isOpen
        this.setState({isOpen: isOpen})
    }

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

    jusoAddressModalPopup = (whichJuso) => {
        this.setState({
            whichJuso: whichJuso, // 어느 주소검색인지 구분값
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
                return {
                    zipNo: row.zipNo,
                    roadAddr: (row.roadAddrPart1 + row.roadAddrPart2),
                    jibunAddr: row.jibunAddr,
                    admCd: row.admCd,
                    rnMgtSn: row.rnMgtSn,
                    udrtYn: row.udrtYn,
                    buldMnnm: row.buldMnnm,
                    buldSlno: row.buldSlno
                };
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



    jusoAddressSelected = async(row, rlgb) => {


        let jusoAddress = "";
        if(rlgb === "R"){
            //도로명주소
            jusoAddress = row.roadAddr;
        }
        else if(rlgb === "J"){
            //지번주소
            jusoAddress = row.jibunAddr;
        }

        console.log('좌표검색', row);

        let bodyFormData = new FormData();
        bodyFormData.set('admCd', row.admCd);
        bodyFormData.set('rnMgtSn',row.rnMgtSn);
        bodyFormData.set('udrtYn', row.udrtYn);
        bodyFormData.set('buldMnnm', row.buldMnnm);
        bodyFormData.set('buldSlno',row.buldSlno);
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey', 'U01TX0FVVEgyMDE5MTExOTE1MzY0NTEwOTIwMzE=');

        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrCoordApiJsonp.do', { method: "post",
            data: bodyFormData,
            config: {
                headers: {
                    dataType:'jasonp',
                    crossDomain: true
                }
            }
        });

        //괄호 제거
        let jsonResults = JSON.parse(allResults.substring(1, allResults.lastIndexOf(')')));

        //GRS80 UTM-K 형태의 좌표가 return됨.-> 위경도로 변환필요. : 참고 https://okky.kr/article/485807?note=1479964
        // console.log('좌표검색결과', jsonResults);  //common.totalCount, common.errorMessage,  juso.entX, juso.entY가 중요
        let convertedX = 0;
        let convertedY = 0;

        if (jsonResults && jsonResults.results && jsonResults.results.juso && jsonResults.results.juso.length > 0) {
            let convertedXy = this.convertXY(jsonResults.results.juso[0].entX,  jsonResults.results.juso[0].entY);
            convertedX = convertedXy[0];
            convertedY = convertedXy[1];
            // console.log('좌표변환결과', convertedX, convertedY);
        }


        console.log('return value',{
            zipNo: row.zipNo,
            address: jusoAddress,
            location : {
                type:'Point',
                coordinates:[convertedX, convertedY]
            }
        })


        this.props.onChange({
            zipNo: row.zipNo,
            address: jusoAddress,
            location : {
                type:'Point',
                coordinates:[convertedX, convertedY]
            }
        })

        this.toggle()
    }

    //xy를 위경도로 변환. [x,y]리턴..
    convertXY = (x, y) => {
        // console.log( 'converXY start', x, y);

        let firstProjection = '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs ';  //GRS80 UTM-K
        let secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'; //위경도
        return proj4(firstProjection,secondProjection,[Number(x), Number(y)]);
    }

    //  endregion ===== 우편번호검색 팝업 메서드 모음 =====

    render(){
        return (

            <Fragment>
                <Button color={'secondary'} onClick={this.toggle} className={this.props.className ? this.props.className : null} style={{width: 100}}

                innerRef={this.props.buttonRef}
                >주소검색</Button>

                <Modal isOpen={this.state.isOpen} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}> 주소 검색 </ModalHeader>
                    <ModalBody >
                        <Container fluid>
                            <Row>
                                <Col xs={9}>
                                    <Input name="jusoInputAddress" type="text" placeholder="도로명 주소 입력" onChange={this.jusoInputSearchHandleChange}
                                    />
                                </Col>
                                <Col xs={3}>
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
                                        <Col xs={12}>
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
                        <Button color="secondary" onClick={this.toggle}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }

}
