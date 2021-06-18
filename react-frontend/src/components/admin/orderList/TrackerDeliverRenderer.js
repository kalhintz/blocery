import React, {useEffect, useState} from 'react';
import { getTrackerDeliverTrace } from '~/lib/deliveryOpenApi'
const TrackerDeliverRenderer = (props) => {

    const [status, setStatus] = useState("");

    useEffect(() => {
        const transportCompanyCode = props.data.transportCompanyCode
        const trackingNumber = props.data.trackingNumber
        if (transportCompanyCode && trackingNumber) {
            if (trackingNumber.toString().length > 10) {
                setStatus("배송추적");
                // api 부하로 인해 안부름
                // getTrackerDeliverTrace(transportCompanyCode, trackingNumber).then(({data}) => {
                //     //console.log("getTrackerDeliverTrace",data)
                //     setStatus(data.stateText);
                // })
            }
        }
    }, []);

    const onClickTrackDeliverInfo = () => {
        let track_id = props.data.trackingNumber;
        let carrier_id = "";
        const v_TransportCompanyCd = props.data.transportCompanyCode;
        if(v_TransportCompanyCd === '01') carrier_id = 'kr.logen';
        else if(v_TransportCompanyCd === '02') carrier_id = 'kr.cjlogistics';
        else if(v_TransportCompanyCd === '03') carrier_id = 'kr.epost';
        else if(v_TransportCompanyCd === '04') carrier_id = 'kr.lotte';
        else if(v_TransportCompanyCd === '05') carrier_id = 'kr.cupost';
        else if(v_TransportCompanyCd === '07') carrier_id = 'kr.hanjin';
        let trackingUrl = `https://tracker.delivery/#/${carrier_id}/${track_id}`;
        window.open(trackingUrl,'_blank')
    }

    return(
        <div>
            {
                (props.data.trackingNumber && props.data.transportCompanyCode) ?
                    <span className='text-primary' onClick={onClickTrackDeliverInfo} style={{textColor:'blue'}}>{status}</span>
                    :
                    <span>{status}</span>
            }
        </div>
    )
}

export default TrackerDeliverRenderer;