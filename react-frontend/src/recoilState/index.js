import {atom, selector, selectorFamily, useRecoilValue} from 'recoil'
/*
    사용법 [useRecoilState]
    설명 : state의 get, set 모두 팔요한 곳에 사용

    import {useRecoilState} from 'recoil'
    import {globalState} from "~/hooks/atomState";

    //hooks 내부에서..
    //get 인 globalState, set인 setGlobalState 모두 사용가능
    const [globalState, setGlobalState] = useRecoilState(globalState);

*/

//장바구니 카운트
export const cartCountrState = atom({
    key: 'cartCountrState',
    default: 0
})

export const allFilterClearState = atom({
    key: 'allFilterClearState',
    default: 0
})

