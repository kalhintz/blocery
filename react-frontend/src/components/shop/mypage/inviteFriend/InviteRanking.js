import React, {useState, useEffect} from 'react';
import {Div, Flex, Right} from '~/styledComponents/shared'
import {getInviteRanking} from '~/lib/shopApi'
import Skeleton from '~/components/common/cards/Skeleton'
import RankingItem from "./RankingItem";
import ComUtil from "~/util/ComUtil";

const InviteRanking = (props) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        search()
    }, [])

    const search = async() => {
        const {data} = await getInviteRanking()
        //console.log({inviteRanking:data})
        setData(data)
    }

    if (!data) return <Skeleton.List count={5}/>

    return <Div p={16}>
        {
            data.map(({combinedName, value}, index) =>
                <RankingItem key={`rank${index}`}
                      no={index+1}
                      name={combinedName}
                      count={`${ComUtil.addCommas(value)}명`}
                />)
        }
    </Div>
}

export default InviteRanking