import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Button } from 'reactstrap'
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'

import { getAllBlctBountyHistory } from "~/lib/eventApi"


const BountyEventHistory = (props) => {
    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "날짜", field: "date", sort: "desc", width:170},
            {headerName: "소비자번호", field: "consumerNo", width:100},
            {headerName: "이름", field: "name", width:100},
            {headerName: "email", field: "email", width:200},
            {headerName: "account", field: "account", width:320},
            {headerName: "event 제목", field: "stateName", width:170},
            {headerName: "event 소제목", field: "eventName", width:270},
            {headerName: "지급된 토큰양", field: "amount", width:120},
        ],
        defaultColDef: {
            width: 100,
            resizable: true
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);
    const [totalBlct, setTotalBlct] = useState(0);

    useEffect(()=> {
        // console.log('useEffect dataList : ', dataList)

        async function excelData() {
            await setExcelData();
        }

        excelData();

    }, [dataList]);

    useEffect(() => {

        async function getData() {
            const {data} = await getAllBlctBountyHistory();
            console.log("getAllBlctBountyHistory",data);

            let r_toto_blct_sum = 0;

            data.map(item => {
                r_toto_blct_sum = r_toto_blct_sum + item.amount ;
                let date = item.date ? ComUtil.utcToString(item.date,'YYYY-MM-DD HH:mm'):null;
                item.date = date;
            });
            console.log("r_toto_blct_sum",r_toto_blct_sum);
            setTotalBlct(r_toto_blct_sum);
            setDataList(data)
        }
        getData();

    }, []);

    const setExcelData = async () => {
        let excelData = await getExcelData();
        setDataExcel(excelData);
    };

    const getExcelData = async() => {
        const columns = [
            '날짜',
            '소비자번호', '이름', 'email', 'account', 'event 제목', 'event소제목', '지급된 토큰양'
        ];

        const data = dataList.map((item ,index)=> {
            return [
                item.date,
                item.consumerNo,
                item.name,
                item.email,
                item.account,
                item.stateName,
                item.eventName,
                item.amount
            ]
        });
        return [{
            columns: columns,
            data: data
        }]
    };

    return(
        <div>
            <div className="d-flex"> <div>총 지급된 BLCT : {totalBlct} </div>

                <div className="ml-2">
                    <ExcelDownload data={excelData}
                                   fileName="이벤트 BLCT 지급목록"
                                   button={<Button color={'success'} size={'sm'} block>
                                       <div>
                                           엑셀 다운로드
                                       </div>
                                   </Button>}/>
                </div>

            </div>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    enableSorting={true}
                    enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    rowData={dataList}
                    //onRowClicked={selectRow}
                />
            </div>
        </div>
    )
}

export default BountyEventHistory