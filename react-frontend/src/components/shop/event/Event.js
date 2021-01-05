import React, { Component, Fragment } from 'react'
import { ShopXButtonNav, BlocerySpinner } from '~/components/common'
import {getEventInfo} from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
export default class Event extends Component {

    constructor(props){
        super(props);
        //console.log('event props : ', this.props);
        let eventNo = this.props.no ||  ComUtil.getParams(this.props).no;
        this.state = {
            eventNo: eventNo,
            loading: true,
            event: null
        }
    }
    async componentDidMount(){
        await this.search()
    }
    search = async () => {

        this.setState({loading: true});
        const eventNo = this.state.eventNo;

        const { data:event } = await getEventInfo(eventNo);
        //console.log('event:',event, event.eventNo);

        this.setState({
            loading: false,
            event: event
        })
    };

    render() {
        const { event } = this.state;
        return (
            <Fragment>
                {this.state.loading && event ? (<BlocerySpinner/>) : null}
                <ShopXButtonNav underline historyBack>{event && event.eventTitle}</ShopXButtonNav>
                {/*<img className="w-100" src="https://blocery.com/images/Vaom0ZXrBo33.png"/>*/}
                <div className={"ql-container ql-snow ql-no-border"}>
                    <div className={'ql-editor ql-no-border ql-no-resize'}
                         style={{padding:0}}
                         dangerouslySetInnerHTML={{
                             __html: event && event.eventContent
                         }}></div>
                </div>
            </Fragment>
        )
    }
}

