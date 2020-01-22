import axios from 'axios'
import { Server } from "../components/Properties";

//식자재 data - findAll
export const findAgriDataAll = () => axios(Server.getRestAPIHost() + '/agridata/all', { method: "post",  withCredentials: true, credentials: 'same-origin' })

//식자재 data - findAll sorted : ASC/DESC + 숫자/날짜형 field명..
// sorter_ex)  {direction: 'ASC', property: 'price'},
export const findAgriDataSorted = (sorter) => axios(Server.getRestAPIHost() + '/agridata/sorted', { method: "post",  data:sorter, withCredentials: true, credentials: 'same-origin' })

//식자재 data - findAll by Date
export const findAgriDataByDate = (date) => axios(Server.getRestAPIHost() + '/agridata/findByDate', { method: "post",  params: {date: date}, withCredentials: true, credentials: 'same-origin' })

//식자재 data - findAll sorted
export const findAgriDataByDateSorted = (date, sorter) => axios(Server.getRestAPIHost() + '/agridata/findByDateSorted', { method: "post",  params: {date: date}, data:sorter, withCredentials: true, credentials: 'same-origin' })

