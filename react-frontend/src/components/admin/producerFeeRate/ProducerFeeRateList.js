import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { getLoginAdminUser } from "~/lib/loginApi";
import { getProducerFeeRate } from "~/lib/adminApi"
import ProducerFeeRateReg from './ProducerFeeRateReg';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Cell } from '~/components/common'

const ProducerFeeRateList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: '번호', field: 'producerRateId', width: 120, cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: '수수료율(%)', field: 'rate', cellRenderer: "rateRenderer", sort:"asc", width:200, cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: '설명', field: 'explain', cellRenderer: "explainRenderer", width: 300, cellStyle:getCellStyle({cellAlign: 'left'})},
        ],
        defaultColDef: {
            width: 100,
            resizable: true
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        frameworkComponents: {
            rateRenderer: RateRenderer,
            explainRenderer: ExplainRenderer
        },
    })

    const [producerFeeRateList, setProducerFeeRateList] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [feeRateData, setFeeRateData] = useState(null);

    useEffect(()=> {

        async function fetch(){
            await checkLogin();
            await getData();
        }

        fetch()

    }, []);

    async function checkLogin() {

        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            window.location = '/admin/login'
        }
    }

    async function getData() {
        // 리스트 불러오는 api 호출
        const {data} = await getProducerFeeRate();
        setProducerFeeRateList(data);
    }

    function RateRenderer({value, data:rowData}) {
        return (
            rowData.producerRateId == 0 ? (
                <Cell textAlign="left">
                    {rowData.rate}
                </Cell>
            ) : (
                <Cell textAlign="left">
                    <div onClick={selectFeeRate.bind(this, rowData)} style={{color: 'blue'}}>
                        <u>{rowData.rate}</u>
                    </div>
                </Cell>
            )
        )
    }

    function ExplainRenderer({value, data:rowData}) {
        return (
            rowData.producerRateId == 0 ? (
                <Cell textAlign="left">
                    {rowData.explain}
                </Cell>
            ) : (
                <Cell textAlign="left">
                    <div onClick={selectFeeRate.bind(this, rowData)} style={{color: 'blue'}}>
                        <u>{rowData.explain}</u>
                    </div>
                </Cell>
            )
        )
    }

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const regProducerFee = () => {
        setFeeRateData({});
        toggle();
    }

    const regFeeRateFinished = () => {
        toggle();
        getData();
    }

    const selectFeeRate = (feeRate) => {
        setFeeRateData(feeRate);
        toggle();
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    function getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
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

    return (
        <div
            className="ag-theme-balham"
            style={{
                height: '700px'
            }}
        >
            <Button outline size='sm' color={'info'} onClick={regProducerFee} className='m-2'>생산자 수수료 등록</Button>

            <AgGridReact
                enableSorting={true}
                enableFilter={true}
                columnDefs={agGrid.columnDefs}
                defaultColDef={agGrid.defaultColDef}
                rowSelection={'single'}  //멀티체크 가능 여부
                enableColResize={true}
                rowHeight={40}
                overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                rowData={producerFeeRateList}
                // onRowClicked={selectFeeRate}
                frameworkComponents={agGrid.frameworkComponents}
            />

            <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
                <ModalHeader toggle={toggle}>생산자 수수료 등록</ModalHeader>
                <ModalBody>
                    <ProducerFeeRateReg feeRateData={feeRateData} onClose={regFeeRateFinished}/>
                </ModalBody>
            </Modal>

        </div>
    )

}

export default ProducerFeeRateList