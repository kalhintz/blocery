import React from 'react';
import { Goods } from '../../src/components/shop/index'
import Enzyme, {mount, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });

const goodsNo = 1;
let wrapper;

// jest.useFakeTimers();

describe('<Goods />', () => {

    test(`${goodsNo}번 상품상세 렌더링 테스트`, async() => {
        window.scrollTo = function(){}
        wrapper = mount(
            <Goods goodsNo={goodsNo} />
        );

        // jest.runAllTimers(); //원하는 스냅샷이 되질 않아서 주석처리함


        //방법 1 promise 를 이용한 스냅샷 업데이트
        /*
        return wrapper.instance().componentDidMount().then(()=>{
            wrapper.update();                   // 강제 스냅샷 업데이트
            expect(wrapper).toMatchSnapshot();  //스냅샷
        })
        */

        //방법 2 await 를 이용한 스냅샷 업데이트
        await wrapper.instance().componentDidMount()
        wrapper.update();                       // 강제 스냅샷 업데이트
        expect(wrapper).toMatchSnapshot();      //스냅샷
    });

    test(`props.goodsNo=${goodsNo} 이어야 함`, () => {
        expect(wrapper.props().goodsNo).toBe(goodsNo);
    })

    test(`${goodsNo}번 상품 조회된 결과 state 확인`, () => {
        expect(wrapper.state().goodsNo).toBe(goodsNo);
        expect(wrapper.state().goods.goodsNo).toBe(goodsNo);
        expect(wrapper.state().goods.itemName).toBe('미나리');
        expect(wrapper.state().goods.confirm).toBe(true);
    })

    test(`${goodsNo}번 상품 DOM 확인`, () => {

        const goodsDetailComponent = wrapper.find('GoodsDetail');
        const tdElements = wrapper.find('td');

        expect(goodsDetailComponent.exists()).toBe(true);   //상품상세 컴포넌트 렌더링 되었는지 존재여부
        expect(tdElements.exists()).toBe(true);             //td 존재여부
        expect(tdElements.contains('김옥한')).toBe(true);
        expect(tdElements.contains('미나리')).toBe(true);
    })


});
