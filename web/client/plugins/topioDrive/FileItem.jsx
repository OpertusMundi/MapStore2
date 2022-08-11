import React from 'react';
import PropTypes from 'prop-types';

import SideCard from '../../components/misc/cardgrids/SideCard';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Moment from 'moment';
import Button from '../../components/misc/Button';

import { Row, Col, Glyphicon } from 'react-bootstrap';

//const Button =  tooltip(ButtonRB);

class FileItem extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        path: PropTypes.string,
        size: PropTypes.number,
        modified: PropTypes.string,
        type: PropTypes.string,
        changeFolder: PropTypes.func
    };

    addToMap(path) {
        console.log(path);
    }

    convertToMB(size) {
        return (size / Math.pow(1024, 2))
    }
    render() {
        var date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let button = this.props.type=='file' ? <Button
            onClick={() => this.addToMap(this.props.path)}
            tooltipId="backgroundDialog.removeAdditionalParameterTooltip"
            className="square-button-md"
            style={{ borderColor: 'transparent' }}>
            <Glyphicon glyph="plus" />
                </Button> : null
        return (
            <div>
                <Row className='row-content'>
                    <Col xs={4} className="col-name">
                    {button}
                        <div className="col-content" onClick={this.props.type=='folder'? () => this.props.changeFolder(this.props.name) : undefined}>
                            <Glyphicon className='icon' glyph={this.props.type=='folder'? 'folder-close': 'file'}/>{this.props.name}
                        </div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{this.convertToMB(this.props.size).toFixed(2)}&nbsp;MB</div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{new Date(this.props.modified).toLocaleDateString("en-UK", date_options)}</div>
                    </Col>
                </Row>

            </div>
        );
    }
}

export default FileItem;