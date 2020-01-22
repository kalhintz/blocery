// https://github.com/securedeveloper/react-data-export#readme

import React from "react";
import ReactExport from "react-export-excel";
import { Button } from 'reactstrap'
import PropTypes from 'prop-types'

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class ExcelDownload extends React.Component {
    constructor(props){
        super(props)
        // this.state = {
        //     dataSet: [
        //         {
        //             columns: ["주문번호2", "주문시간2", "주문개수2"],
        //             data: [
        //                 ["Johnson", 30000, "Male"],
        //                 ["Monika", 355000, "Female"],
        //                 ["Konstantina", 20000, "Female"],
        //                 ["John", 250000, "Male"],
        //                 ["Josef", 450500, "Male"],
        //             ]
        //         },
        //         {
        //             xSteps: 1, // Will start putting cell with 1 empty cell on left most
        //             ySteps: 5, //will put space of 5 rows,
        //             columns: ["Name", "Department"],
        //             data: [
        //                 ["Johnson", "Finance"],
        //                 ["Monika", "IT"],
        //                 ["Konstantina", "IT Billing"],
        //                 ["John", "HR"],
        //                 ["Josef", "Testing"],
        //             ]
        //         }
        //     ]
        // }
    }
    render() {
        return (
            <ExcelFile element={this.props.button || null}  filename={!this.props.fileName ? "Download" : this.props.fileName} >
                <ExcelSheet dataSet={this.props.data} name={!this.props.sheetName ? "Sheet" : this.props.sheetName} />
            </ExcelFile>
        );
    }
}

ExcelDownload.propTypes = {
    data: PropTypes.array.isRequired,
    button: PropTypes.any
}
ExcelDownload.defaultProps = {
    button: Button
}

export default ExcelDownload