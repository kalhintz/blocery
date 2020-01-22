import React from 'react'
import { create } from 'react-test-renderer'
import { Mypage } from '../../src/components/shop/index'
import { TestLibs } from '../TestLibraries'
import { BrowserRouter } from 'react-router-dom'
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

const userType = 'consumer';
const email = 'gary@ezfarm.co.kr';
const valWord = 'ezfarm#3414'

let wrapper;

describe("shop/mypage/Mypage component", () => {

    //로그인
    beforeEach(async ()=> {
        await TestLibs.Login(userType, email, valWord);
    })

    test("로그인이 올바르게 되었는지 localStorage 확인", async () => {
        expect(localStorage.getItem("email")).toBe(email);
    })

    test('마이페이지 렌더링 테스트', () => {
        //TODO: Mypage 내 link 이슈로 인해서 BrowserRouter를 감싸줬지만, 이것으로 인해 wrapper.instance().componentDidMount() 강제호출 실패함. 그래서 스냅샷 내용이 didMount를 일으키기 전 내용임
        wrapper = mount(<BrowserRouter><Mypage /></BrowserRouter>);
        expect(wrapper).toMatchSnapshot();
    });
})