import React from 'react'
import { create } from 'react-test-renderer'
import { LoginTab } from '../src/components/shop'

export const TestLibs = {
    Login : async (userType, email, valword) => {
        const component = create(<LoginTab/>);
        const root = component.root;
        const instance = component.getInstance();

        //로그인 탭의 두번째(생산자) 클릭
        const a = root.findAllByType('a')


        switch(userType){
            case 'consumer':
                a[0].props.onClick();
                break;
            case 'producer':
                a[1].props.onClick();
                break;
        }

        // if(userType === 'consumer') a[0].props.onClick()
        // else if(userType === 'producer') a[1].props.onClick()

        const form = root.findByType("form");
        const input = root.findAllByType('input');
        const id = input[0]
        const pw = input[1]

        //id, pw 지정
        id.value = email//"producer236@ezfarm.co.kr";
        pw.value = valword//"ezfarm#3414";

        //로그인 시도
        await form.props.onSubmit({
            target: [
                id,
                pw
            ],
            preventDefault: function(){} //HARD CODING..
        })
    }
}


// async function Login (userType, email, valword){
//     const component = create(<LoginTab/>);
//     const root = component.root;
//     const instance = component.getInstance();
//
//     //로그인 탭의 두번째(생산자) 클릭
//     const a = root.findAllByType('a')
//
//
//     switch(userType){
//         case 'consumer':
//             a[0].props.onClick();
//             break;
//         case 'producer':
//             a[1].props.onClick();
//             break;
//     }
//
//     // if(userType === 'consumer') a[0].props.onClick()
//     // else if(userType === 'producer') a[1].props.onClick()
//
//     const form = root.findByType("form");
//     const input = root.findAllByType('input');
//     const id = input[0]
//     const pw = input[1]
//
//     //id, pw 지정
//     id.value = email//"producer236@ezfarm.co.kr";
//     pw.value = valword//"ezfarm#3414";
//
//     //로그인 시도
//     await form.props.onSubmit({
//         target: [
//             id,
//             pw
//         ],
//         preventDefault: function(){} //HARD CODING..
//     })
// }