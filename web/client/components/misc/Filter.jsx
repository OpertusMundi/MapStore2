/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './style/filter.css';

import PropTypes from 'prop-types';
import React from 'react';
import { FormControl, FormGroup, Glyphicon, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import filterIcon from '../../themes/default/svg/filter-topio.svg';

class Filter extends React.Component {

    static propTypes = {
        loading: PropTypes.bool,
        filterText: PropTypes.string,
        filterPlaceholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        onFilter: PropTypes.func,
        onFocus: PropTypes.func,
        tooltipClear: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        loading: false,
        filterText: '',
        filterPlaceholder: '',
        onFilter: () => {},
        onFocus: () => {},
        tooltipClear: 'Clear'
    };

    onFilter = (e) => {
        this.props.onFilter(e.target.value);
    }

    onClear = () => {
        this.props.onFilter('');
    }

    render() {
        const icon = !this.props.filterText ?
            <img src={filterIcon} />
            :
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="mapstore-toc-filter">{this.props.tooltipClear}</Tooltip>}>
                <Glyphicon glyph="1-close" className="text-primary close-filter" onClick={this.onClear}/>
            </OverlayTrigger>;
        return (
            <FormGroup className="mapstore-filter">
                <InputGroup>
                    <FormControl
                        value={this.props.filterText}
                        placeholder={this.props.filterPlaceholder}
                        onChange={this.onFilter}
                        onFocus={this.props.onFocus}
                        type="text"/>
                    <InputGroup.Addon className="square-button-md">
                        {this.props.loading ? <div className="toc-inline-loader"></div> : icon}
                    </InputGroup.Addon>
                </InputGroup>
            </FormGroup>
        );
    }
}

export default Filter;
