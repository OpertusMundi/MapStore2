/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './drawer/drawer.css';

import { partialRight } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Panel, FormGroup, ControlLabel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { setControlProperty, toggleControl } from '../actions/controls';
import { changeMapStyle } from '../actions/map';
import tooltip from '../components/misc/enhancers/tooltip';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import MenuTopioComp from './topioDrive/MenuTopio';
import Message from './locale/Message';
import ButtonB from '../components/misc/Button';


const Button = tooltip(ButtonB);


const menuSelector = createSelector([
    state => state.controls.topioDrive && state.controls.topioDrive.enabled,
    state => state.controls.topioDrive && state.controls.topioDrive.menu || "1",
    state => state.controls.queryPanel && state.controls.queryPanel.enabled && state.controls.topioDrive && state.controls.topioDrive.width || state.controls.topioDrive && state.controls.topioDrive.resizedWidth || undefined,
    state => mapLayoutValuesSelector(state, {height: true})
], (show, activeKey, dynamicWidth, layout) => ({
    show,
    activeKey,
    dynamicWidth,
    layout
}));

const Menu = connect(menuSelector, {
    onToggle: toggleControl.bind(null, 'topioDrive', null),
    onResize: setControlProperty.bind(null, 'topioDrive', 'resizedWidth'),
    onChoose: partialRight(setControlProperty.bind(null, 'topioDrive', 'menu'), true),
    changeMapStyle: changeMapStyle
})(MenuTopioComp);

const DrawerButton = connect(state => ({
    disabled: state.controls && state.controls.topioDrive && state.controls.topioDrive.disabled
}), {
    toggleMenu: toggleControl.bind(null, 'topioDrive', null)
})(({
    id = '',
    menuButtonStyle = {},
    buttonStyle = 'primary',
    buttonClassName = 'square-button ms-topiodrivemenu-menu-button',
    toggleMenu = () => {},
    disabled = false,
    glyph = 'folder-open',
    tooltipId = 'topioDrive.drawerButton',
    tooltipPosition = 'bottom'
}) =>
    <Button
        id={id}
        style={menuButtonStyle}
        bsStyle={buttonStyle}
        key="menu-button"
        className={buttonClassName}
        onClick={toggleMenu}
        disabled={disabled}
        tooltipId={tooltipId}
        tooltipPosition={tooltipPosition}>
        <Glyphicon glyph={glyph}/>
    </Button>
);

/**
 * TopioDriveMenu plugin. It is a container for other plugins.
 * It shows a collapsible panel on the left with some plugins rendered inside it (typically the {@link #plugins.TOC|TOC})
 * and a button on the top-left corner to open this panel.
 * @prop {string} cfg.glyph glyph icon to use for the button
 * @prop {object} cfg.menuButtonStyle Css inline style for the button. Display property will be overridden by the hideButton/forceDrawer options.
 * @prop {string} cfg.buttonClassName class for the toggle button
 * @prop {object} cfg.menuOptions options for the drawer menu
 * @prop {boolean} cfg.menuOptions.docked
 * @prop {number} cfg.menuOptions.width
 * @prop {boolean} cfg.menuOptions.resizable enables horizontal resizing
 * @memberof plugins
 * @class
 * @example
 * {
 *   "name": "TopioDriveMenu",
 *   "cfg": {
 *     "hideButton": true
 *   }
 * }
 */

 const SAMPLE_ITEM = {
    plugin: "TEST",
    name: 'topio-drive',
    position: 1,
    glyph: "1-layer",
    icon: <div></div>,
    buttonConfig: {
        buttonClassName: "square-button no-border",
        tooltip: "toc.layers"
    },
    priority: 2
};

class TopioDriveMenu extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        active: PropTypes.string,
        toggleMenu: PropTypes.func,
        id: PropTypes.string,
        glyph: PropTypes.string,
        buttonStyle: PropTypes.string,
        menuOptions: PropTypes.object,
        singleSection: PropTypes.bool,
        buttonClassName: PropTypes.string,
        menuButtonStyle: PropTypes.object,
        disabled: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static testItem = {
            name: 'settings',
            position: 3,
            title: 'settings',
            priority: 2
    }
    static defaultProps = {
        id: "mapstore-topiodrivemenu",
        items: [],
        toggleMenu: () => {},
        glyph: "folder-open",
        buttonStyle: "primary",
        menuOptions: {},
        singleSection: true,
        buttonClassName: "square-button ms-topiodrive-menu-button",
        disabled: false
    };

    

    getTools = () => {
        var testItems = [{
            name: 'TopioDrive',
            position: 3,
            title: 'TopioDrive',
            priority: 2,
            panel: true,
            glyph: "folder-open",
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "toc.layers"
            },
            icon: <Glyphicon glyph="folder-open"/>
    }];
        const unsorted = testItems
            .map((item, index) => assign({}, item, {position: item.position || index}));
        //return unsorted.sort((a, b) => a.position - b.position);
        return testItems;
    };

    renderItems = () => {
        return this.getTools().map((tool, index) => {
            const Plugin =  tool.plugin;
            const plugin = (<Plugin
                isPanel
                //{...tool.cfg}
                items={SAMPLE_ITEM || []}
                groupStyle={{style: {
                    marginBottom: "0px",
                    cursor: "pointer"
                }}}
            />);
            const header = tool.title ? <div className={'drawer-menu-head drawer-menu-head-' + tool.name}><Message msgId={tool.title}/></div> : null;

            return <Panel icon={tool.icon} glyph={tool.glyph} buttonConfig={tool.buttonConfig} key={tool.name} eventKey={index + 1 + ""} header={header}>
                       {plugin}
                </Panel>
        });
    };

    render() {
        const files = [
            {"size": 33328,"path": "/csv/DKV_Berlin.csv", "name": "DKV_Berlin.csv","modified": "2022-04-19T05:49:19.976Z"},
            {"size": 3084452,"path": "/shapefile/rivers.zip","name": "rivers.zip","modified": "2022-03-29T10:46:52.95Z"},
            {"size": 3084452,"path": "/shapefile/lakes.zip","name": "lakes.zip","modified": "2022-06-15T08:31:52.49Z"}
        ];
        //toggleMenu = () => {},
        return this.getTools().length > 0 ? (
            <div id={this.props.id}>
                <DrawerButton {...this.props} id="topiodrivemenu-menu-button"/>
                <Menu files={files} single={this.props.singleSection} {...this.props.menuOptions} title={<Message msgId="menu" />} alignment="left">
                    {this.renderItems()}
                </Menu>
            </div>
        ) : null;
    }
}

const TopioDriveMenuPlugin = connect((state) => ({
    active: state.controls && state.controls.drawer && state.controls.drawer.active,
    disabled: state.controls && state.controls.drawer && state.controls.drawer.disabled
}), {
    toggleMenu: toggleControl.bind(null, 'drawer', null)
})(TopioDriveMenu);

export default {
    TopioDriveMenuPlugin: assign(TopioDriveMenuPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}",
        FloatingLegend: {
            priority: 1,
            name: 'drawer-menu',
            button: DrawerButton
        }
    }),
    reducers: {}
};
