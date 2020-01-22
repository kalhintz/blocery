import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'bootstrap/scss/bootstrap.scss'

import 'react-toastify/dist/ReactToastify.css'
import 'react-dates/lib/css/_datepicker.css';
import './styles/react_dates_overrides.css';
import 'moment/locale/ko';  //react-dates 달력에서 한글 포맷

import './styles/customTheme.scss';

//react-id-swiper 는 기존 오픈소스인 swiper 를 리엑트 기반으로 만든것이고 따라서
//아래의 swiper css를 그대로 사용하고있음
// import 'swiper/dist/css/swiper.min.css'

//ag-grid
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import "../src/styles/fontStyle.css"
import "../src/styles/cursor.css"

//swiper css
import 'swiper/dist/css/swiper.css'
// import 'react-id-swiper/lib/styles/css/swiper.css';
//swiper scss
// import 'react-id-swiper/lib/styles/scss/swiper.scss';


import "./App.css"

import Root from './Root'

ReactDOM.render(
    <Root />,
    document.getElementById('root')
);
