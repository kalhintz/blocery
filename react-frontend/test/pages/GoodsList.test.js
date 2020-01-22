import React from 'react'
import { create } from 'react-test-renderer'
import { LoginTab, Goods, Mypage, Recommend, Main, Resv } from '../../src/components/shop'

//Resv 상품목록 - 낮은가격순 정렬
describe("shop/resv/Resv sorting", () => {
    test("상품목록의 낮은가격순 테스트", async () => {
        const component = create(<Resv/>);
        const instance = component.getInstance();
        await instance.search();
        const root = component.root;

        /*

        //버튼 객체 찾기(array)

        const button = root.findAllByProps({type: 'button', value: 0})
        const button = root.findAll(el=>el.props.type === 'button' && el.props.value === 0)
        console.log('===================================================================',button[0].props)
        console.log('===================================================================',button[0].children)
        console.log('===================================================================',button[0].props.value)
        */

        /*

        //버튼 객체 찾기(object)

        const button = root.findByProps({type: 'button', children: '낮은가격순'})  //Blocery추천
        console.log('===================================================================',button.props)
        console.log('===================================================================',button.props.children)
        console.log('===================================================================',button.props.value)
        button.props.onClick({value: 1, text:''})
        */

        instance.onSortClick({value: 1, text:''})   //낮은 가격순 정렬

        await instance.search()

        const rows = instance.state.rowData.map(({currentPrice, discountRate, consumerPrice}) => {
            return {
                currentPrice,
                discountRate,
                consumerPrice
            }
        })

        console.table(rows)

        //상품 건수가 두건 이상 일 경우만 테스트
        if(rows.length >= 2){
            for(let i = 0 ; i < rows.length-1; i++){
                const bp = rows[i].currentPrice
                const ap = rows[i+1].currentPrice
                const isCheaper = bp <= ap ? true : false
                if(!isCheaper) console.log(`${i} 번째의 현재가격이 ${i+1} 번째보다 더 높습니다`)
                expect(isCheaper).toBe(true)
            }
        }


    })
})