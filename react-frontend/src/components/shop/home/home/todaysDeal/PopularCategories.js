import React  from 'react'
import { Server } from '~/components/Properties'
import Css from './PopularCategories.module.scss'

import {
    IconCateVeggies,
    IconCateFruit,
    IconCateRice,
    IconCateProcFood,
    IconCateMeat,
    IconCateFish
} from "../../../../common/icons/Icons";

//인기 카테고리
const PopularCategories = (props) => {

    const { ...rest } = props
    const data = (Server._serverMode() === 'production') ?
       [ {icon: IconCateVeggies, to: '/category/5/all'},
        {icon: IconCateFruit, to: '/category/6/all'},
        {icon: IconCateRice, to: '/category/7/all'},
        {icon: IconCateProcFood, to: '/category/8/all'},
        {icon: IconCateMeat, to: '/category/9/all'},
        {icon: IconCateFish, to: '/category/10/all'}]

      : [ {icon: IconCateVeggies, to: '/category/1/all'}, //Stage:225
          {icon: IconCateFruit, to: '/category/2/all'},
          {icon: IconCateRice, to: '/category/3/all'},
          {icon: IconCateProcFood, to: '/category/4/all'},
          {icon: IconCateMeat, to: '/category/5/all'},
          {icon: IconCateFish, to: '/category/6/all'}]


    function onClick(url){
        props.history.push(url)
    }
    
    return(
        <div {...rest}>
            <div className={Css.grandTitleBox}>
                <div>인기 카테고리</div>
                <div>가장 많이 찾는 카테고리를 만나보세요!</div>
            </div>

            <div className={Css.flexRow}>
                {
                    data.map(({icon: Icon, to}, index)=>(
                        <div key={'category'+index} className={Css.card}>
                            <div onClick={onClick.bind(this, to)}>
                                {
                                    <Icon style={{width: 32, height: 32}}/>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>


    )
    
    // return(
    //     <div className={Css.wrap}>
    //         <div className={Css.titleBox}>
    //             <div className={Css.titleLarge}>
    //                 인기 카테고리
    //             </div>
    //             <div className={Css.titleSmall}>
    //                 <LightGray>가장 많이 찾는 카테고리를 만나보세요!</LightGray>
    //             </div>
    //         </div>
    //
    //         <div className={Css.categoryBox}>
    //
    //             {/* selected 된것 */}
    //             <div className={Css.category}>
    //                 {/* circle */}
    //                 <div className={[Css.circle, Css.circleActive].join(' ')}>
    //                     <IconTomato />
    //                 </div>
    //             </div>
    //
    //             {/* selected 안된것 */}
    //             {
    //                 [0,1,2,3,4,5,6,7,8,9].map((item, index) =>
    //                     <div
    //                         key={'store'+index}
    //                         className={Css.category}
    //                     >
    //                         {/* circle */}
    //                         <div className={Css.circle}>
    //                             <IconTomato />
    //                         </div>
    //                     </div>
    //                 )
    //             }
    //         </div>
    //     </div>
    // )

}

export default PopularCategories