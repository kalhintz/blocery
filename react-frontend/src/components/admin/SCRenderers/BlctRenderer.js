import React, {Component} from "react";

export default class BlctRenderer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            blct : '..' //'loading...'
        }
    }

    async componentDidMount() {
        if (!this.props.data.getBalanceOfBlct) return; //버튼 눌러서 blct조회로 수정.

        let {data:blct} = await this.props.data.getBalanceOfBlct(this.props.data.account);
        this.setState (
            {blct: blct}
        )
    }

    render() {
        return this.state.blct
    }
}