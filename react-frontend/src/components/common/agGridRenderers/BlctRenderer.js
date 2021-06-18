import React, { Component, useState, useEffect } from 'react';
import { scOntGetBalanceOfBlctAdmin } from '~/lib/smartcontractApi'
import {Div, Span} from '~/styledComponents/shared/Layouts'

const BlctRenderer = (props) => {
    const [blct, setBlct] = useState(null);

    useEffect(() => {
        getBlct()
    }, [])

    const getBlct= () => {
        const account = props.data.account
        //console.log("scOntGetBalanceOfBlct=account==",account);
        if (account != null) {
            scOntGetBalanceOfBlctAdmin(account).then(({data}) => {
                //console.log("scOntGetBalanceOfBlct===", data);
                if (data != null)
                    setBlct(data)
            })
        }
    }

    if (!blct) return null

    return (<>{blct}</>)
}
export default BlctRenderer