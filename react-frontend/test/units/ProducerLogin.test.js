import React from 'react'
import { create } from 'react-test-renderer'
import OrderList from '../../src/components/producer/orderList/index'
import { LoginTab } from '../../src/components/shop/index'
import ComUtil from '../../src/util/ComUtil';
import { getOrderByProducerNo } from '../../src/lib/producerApi'
import { getLoginUser, getLoginUserType } from '../../src/lib/loginApi'

import { TestLibs } from '../TestLibraries'

const userType = "producer";
const email = "farmtory@ezfarm.co.kr";
const valword = "ezfarm#3414";

describe("생산자 상품목록 테스트", () => {

    //로그인
    beforeEach(async () => {
        await TestLibs.Login(userType, email, valword);
    });

    test("로그인이 올바르게 되었는지 localStorage 확인", async () => {
        expect(localStorage.getItem("email")).toBe(email);
    })

    //TODO: 위에서 로그인은 성공 했지만 getLoginUserType() 에서는 세션정보를 불러 올 수 없음(다른 세션으로 처리하는듯함)
    /*
        test("loginUserType 확인", async () => {
            const {status, data} = await getLoginUserType();
            expect(status).toBe(200);
            expect(data).toBe(userType);
        })
    */

});