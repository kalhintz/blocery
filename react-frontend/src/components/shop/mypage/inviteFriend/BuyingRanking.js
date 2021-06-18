import React, {useState, useEffect} from 'react';
import {Div, Flex, Right} from '~/styledComponents/shared'
import {getBuyingRanking} from '~/lib/shopApi'
import Skeleton from '~/components/common/cards/Skeleton'
import RankingItem from "./RankingItem";
import ComUtil from "~/util/ComUtil";

const BuyingRanking = (props) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        search()
    }, [])

    const search = async() => {
        const {data} = await getBuyingRanking()
        //console.log({buyRanking:data})
        setData(data)
    }

    if (!data) return <Skeleton.List count={5}/>

    return <Div p={16}>
        {
            data.map(({combinedName, value}, index) =>
                <RankingItem key={`rank${index}`}
                             no={index+1}
                             name={combinedName}
                             count={`${ComUtil.addCommas(value)}원`}
                />)
        }
    </Div>
}

export default BuyingRanking