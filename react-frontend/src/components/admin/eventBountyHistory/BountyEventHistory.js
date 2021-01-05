import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Button } from 'reactstrap'
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import moment from 'moment-timezone'

import { getAllBlctBountyHistory } from "~/lib/eventApi"

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";


const BountyEventHistory = (props) => {

    const [search, setSearch] = useState({
        year:moment().format('YYYY')
    });

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
    });

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);
    const [totalBlct, setTotalBlct] = useState(0);

    useEffect(() => {
        async function getData() {
            await getSearch();
        }
        getData();
    }, []);

    useEffect(()=> {
        async function excelData() {
            await setExcelData();
        }
        excelData();
    }, [dataList]);

    useEffect(() => {
        async function getData() {
            await getSearch();
        }
        getData();
    }, [search]);

    const getSearch = async () => {
        const params = {
            year:search.year
        };
        const {data} = await getAllBlctBountyHistory(params);
        console.log("getAllBlctBountyHistory",data);

        let r_toto_blct_sum = 0;

        data.map(item => {
            r_toto_blct_sum = r_toto_blct_sum + item.amount ;
            let date = item.date ? ComUtil.utcToString(item.date,'YYYY-MM-DD HH:mm'):null;
            item.date = date;
        });
        //console.log("r_toto_blct_sum",r_toto_blct_sum);
        setTotalBlct(r_toto_blct_sum);
        setDataList(data)
    };

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

    const onSearchDateChange = (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, search);
        search.year = date.getFullYear();
        setSearch(search);
    }

    const ExampleCustomDateInput = ({ value, onClick }) => (
        <Button
            color="secondary"
            active={true}
            onClick={onClick}>검색 {value} 년</Button>
    );

    return(
        <div>
            <div className="d-flex align-items-center p-1">
                <div className='ml-2'>
                    <DatePicker
                        selected={new Date(moment().set('year',search.year))}
                        onChange={onSearchDateChange}
                        showYearPicker
                        dateFormat="yyyy"
                        customInput={<ExampleCustomDateInput />}
                    />
                </div>
                <div className='ml-2 mr-2'>
                    <Button color={'info'} onClick={getSearch}>검색</Button>
                </div>
                <ExcelDownload data={excelData} size={'md'} fileName="이벤트 BLY 지급목록"/>
                <div className="ml-2">
                    총 지급된 BLY : {totalBlct}
                </div>
            </div>

            <div className="p-1">
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '600px'
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
        </div>
    )
}

export default BountyEventHistory