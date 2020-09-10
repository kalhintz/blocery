import React, { Fragment, useState, useEffect } from 'react'
import { BlocerySpinner, HeaderTitle } from '~/components/common'
import { Doc } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import { getTransitionWithOrderSaleByProducerNo } from '~/lib/producerApi'
import Highcharts from 'highcharts' // 하이차트
import HighchartsReact from 'highcharts-react-official' // 하이차트 리액트 오피셜

const OrderSaleTransition = (props) => {
    const defaultChartOptions = {
        reflow:true,
        chart: {
            type: "line"
        },
        title: {
            text: null
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
        },
        yAxis: {
            title: {
                text: null
            }
        },
        series: [
            {
                type: 'line',
                name: "주문",
                color: "blue",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                type: 'line',
                name: "매출",
                color: "green",
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    };

    const [loading, setLoading] = useState(false);

    const [chartOptions, setChartOptions] = useState(defaultChartOptions);

    const initOrder = [
        {orderMonth:1,orderCnt:0,orderAmt:0},
        {orderMonth:2,orderCnt:0,orderAmt:0},
        {orderMonth:3,orderCnt:0,orderAmt:0},
        {orderMonth:4,orderCnt:0,orderAmt:0},
        {orderMonth:5,orderCnt:0,orderAmt:0},
        {orderMonth:6,orderCnt:0,orderAmt:0},
        {orderMonth:7,orderCnt:0,orderAmt:0},
        {orderMonth:8,orderCnt:0,orderAmt:0},
        {orderMonth:9,orderCnt:0,orderAmt:0},
        {orderMonth:10,orderCnt:0,orderAmt:0},
        {orderMonth:11,orderCnt:0,orderAmt:0},
        {orderMonth:12,orderCnt:0,orderAmt:0}
    ];

    //componentDidMount
    useEffect(() => {
        search()
    }, []);

    async function search() {

        setLoading(true);

        // 주문 건수
        // 매출액 0.1(1000원) 단위 환산

        // 주문/매출 추이 1월~12월
        const { data } = await getTransitionWithOrderSaleByProducerNo();

        const order = [
            {orderMonth:1,orderCnt:0,orderAmt:0},
            {orderMonth:2,orderCnt:0,orderAmt:0},
            {orderMonth:3,orderCnt:0,orderAmt:0},
            {orderMonth:4,orderCnt:0,orderAmt:0},
            {orderMonth:5,orderCnt:0,orderAmt:0},
            {orderMonth:6,orderCnt:0,orderAmt:0},
            {orderMonth:7,orderCnt:0,orderAmt:0},
            {orderMonth:8,orderCnt:0,orderAmt:0},
            {orderMonth:9,orderCnt:0,orderAmt:0},
            {orderMonth:10,orderCnt:0,orderAmt:0},
            {orderMonth:11,orderCnt:0,orderAmt:0},
            {orderMonth:12,orderCnt:0,orderAmt:0}
        ];

        data.map( (item,idx) => {

            order.map( (orderItem,idx) => {

                if(orderItem.orderMonth === item.orderMonth){
                    //console.log("item.orderMonth",item.orderMonth);
                    //console.log("item.orderCnt",item.orderCnt);
                    //console.log("item.orderAmt",item.orderAmt);
                    orderItem.orderCnt = item.orderCnt;

                    // 매출 1000원 단위로 환산 0.1   소수점 한자리까지..
                    orderItem.orderAmt = parseFloat((item.orderAmt/1000).toFixed(1));
                }

            });

        });

        let option = setOption(order);
        setChartOptions(option);

        setLoading(false);
    }

    function setOption(data){

        // data 주문데이터, 매출데이터 세팅
        let orderData = [];
        let saleData  = [];

        data.map( (item,idx) => {
            orderData.push(item.orderCnt);
            saleData.push(item.orderAmt);
        });

        const chartOptions = {
            reflow:true,
            chart: {
                type: "line",
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ],
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            series: [
                {
                    type: 'line',
                    name: "주문",
                    color: "blue",
                    data: orderData
                },
                {
                    type: 'line',
                    name: "매출",
                    color: "green",
                    data: saleData
                }
            ]
        };
        return chartOptions;
    }

    return (


        <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { width: '100%', height: '100%' } }}
        />

    )
}
export default OrderSaleTransition