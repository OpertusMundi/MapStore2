/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';
import { Glyphicon, SplitButton, MenuItem } from 'react-bootstrap';
import Message from '../../components/I18N/Message';
import tooltip from '../../components/misc/enhancers/tooltip';
import searchIcon from '../../themes/default/svg/search-topio.svg';
import filterIcon from '../../themes/default/svg/filter-topio.svg';

const SplitButtonT = tooltip(SplitButton);
const splitToolButtonConfig = {
    title: <Glyphicon glyph="transfer"/>,
    tooltipId: "toc.compareTool",
    tooltipPosition: "top",
    className: "square-button-md no-border",
    pullRight: true
};

const SwipeButton = (props) => {
    const { swipeSettings, onSetActive, onSetSwipeMode, status} = props;

    const showConfiguration = () => {
        if (!swipeSettings.configuring && (status === 'LAYER')) {
            onSetActive(true, "configuring");
        } else {
            onSetActive(false, "configuring");
        }
    };

    const showSwipeTools = () => {
        if (!swipeSettings.active && (status === 'LAYER')) {
            onSetActive(true);
        } else {
            onSetActive(false);
        }
    };

    return (
        <SplitButtonT
            onClick={() => showSwipeTools()}
            bsStyle={swipeSettings?.active ? "success" : "primary"}
            {...splitToolButtonConfig}>
            <MenuItem
                active={swipeSettings?.mode === "swipe"}
                onClick={() => {
                    onSetSwipeMode("swipe");
                    onSetActive(true);
                }}>
                <Glyphicon glyph="vert-dashed"/><Message msgId="toc.swipe" />
            </MenuItem>
            <MenuItem
                active={swipeSettings?.mode === "spy"}
                onClick={() => {
                    onSetSwipeMode("spy");
                    onSetActive(true);
                }}>
            </MenuItem>
            <MenuItem
                onClick={() => showConfiguration()}>
                 <img src={filterIcon} /><Message msgId="toc.configureTool" />
            </MenuItem>
        </SplitButtonT>
    );
};

SwipeButton.propTypes = {
    swipeSettings: PropTypes.object,
    status: PropTypes.string,
    onSetActive: PropTypes.func,
    onSetSwipeMode: PropTypes.func
};

SwipeButton.defaultProps = {
    status: "LAYER",
    onSetSwipeMode: () => { },
    onSetActive: () => { }
};

export default SwipeButton;
