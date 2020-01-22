import React, {Component} from "react";

export default class BlctRenderer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            blct : 'loading...'
        }
    }

    async componentDidMount() {
        let {data:blct} = await this.props.data.getBalanceOfBlct(this.props.data.account);
        this.setState (
            {blct: blct}
        )
    }

    render() {
        return this.state.blct
    }
}