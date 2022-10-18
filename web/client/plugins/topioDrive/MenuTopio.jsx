/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import Sidebar from 'react-sidebar';

import OverlayTrigger from '../../components/misc/OverlayTrigger';
import Message from '../../components/I18N/Message';
import Button from '../../components/misc/Button';


import FileGrid from './FileGrid';

import Tab from "./Tab";


class MenuTopio extends React.Component {
    static propTypes = {
        title: PropTypes.node,
        alignment: PropTypes.string,
        activeKey: PropTypes.string,
        docked: PropTypes.bool,
        show: PropTypes.bool,
        onToggle: PropTypes.func,
        onChoose: PropTypes.func,
        single: PropTypes.bool,
        width: PropTypes.number,
        dynamicWidth: PropTypes.number,
        overlapMap: PropTypes.bool,
        changeMapStyle: PropTypes.func,
        layout: PropTypes.object,
        resizable: PropTypes.bool,
        onResize: PropTypes.func,
        fileSystem: PropTypes.object,
    };

    state = {
        activeFolder: this.props.fileSystem
    }
    
    static defaultProps = {
        docked: false,
        single: false,
        width: 300,
        overlapMap: true,
        layout: {},
        resizable: false,
        onResize: () => { }
    };

    constructor (props){
        super(props);
        this.changeFolder = this.changeFolder.bind(this);
    }

    componentDidMount() {
        if (!this.props.overlapMap && this.props.show) {
            let style = { left: this.props.width, width: `calc(100% - ${this.props.width}px)` };
            this.props.changeMapStyle(style, "drawerMenu");
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.props.overlapMap && prevProps.show !== this.props.show) {
            let style = this.props.show ? { left: this.props.width, width: `calc(100% - ${this.props.width}px)` } : {};
            this.props.changeMapStyle(style, "drawerMenu");
        }
    }

    getWidth = () => {
        return this.props.dynamicWidth || this.props.width;
    };

    renderChildren = (child, index) => {
        const props = {
            key: child.key ? child.key : index,
            ref: child.ref,
            open: this.props.activeKey && this.props.activeKey === child.props.eventKey
        };
        const { glyph, icon, buttonConfig, ...childProps } = child.props;
        return <child.type {...props} {...childProps}></child.type>;
    };

    renderButtons = () => {
        return this.props.children.map((child) => {
            const button = (<Button key={child.props.eventKey} bsSize="large" className={(child.props.buttonConfig && child.props.buttonConfig.buttonClassName) ? child.props.buttonConfig.buttonClassName : "square-button"} onClick={this.props.onChoose.bind(null, child.props.eventKey, this.props.activeKey === child.props.eventKey)} bsStyle={this.props.activeKey === child.props.eventKey ? 'default' : 'primary'}>
                {child.props.glyph ? <Glyphicon glyph={child.props.glyph} /> : child.props.icon}
            </Button>);
            if (child.props.buttonConfig && child.props.buttonConfig.tooltip) {
                const tooltip = <Tooltip key={"tooltip." + child.props.eventKey} id={"tooltip." + child.props.eventKey}><Message msgId={child.props.buttonConfig.tooltip} /></Tooltip>;
                return (
                    <OverlayTrigger placement={"bottom"} key={"overlay-trigger." + child.props.eventKey}
                        overlay={tooltip}>
                        {button}
                    </OverlayTrigger>
                );
            }
            return button;
        });
    };

    handleChange(event, newValue) {
        //setValue(newValue);
        console.log('in handle change')
    }

    browseFiles(element, path) {

        if (element.name == path || path == 'My files') {
            return element;
        } else if (element.folders != null) {
            var i;
            var result = null;
            for (i = 0; i < element.folders.length; i++) {
                if (result == null) {
                    result = this.browseFiles(element.folders[i], path);
                }
            }
            return result;
        }
        return null;
    }

    changeFolder(newFolder) {
        let activeFolder = this.browseFiles(this.props.fileSystem, newFolder);
        this.setState({
            activeFolder
            } 
        );
    }

    renderContent = () => {
        let paths = ["My files"];
        if (this.state.activeFolder.path!='/')
            paths.push(...this.state.activeFolder.path.slice(1).split('/'))
        const breadcrumbs = paths.map(path => <li><a  onClick={() => this.changeFolder(path)} >{path}</a></li>);
        const tabContent = [
            {
                title: "Topio Drive Files",
                content:
                    <div className={"nav-body topio-drive-grid"}>
                        <nav className="nav-bar">
                            <ul>
                                {breadcrumbs}
                            </ul>
                        </nav>
                        <FileGrid activeFolder={this.state.activeFolder} changeFolder={this.changeFolder}/>
                    </div>,
            },
            {
                title: "Purchased Datasets",
                content: `Bought Datasets from Topio.`,
            },
            {
                title: "Open Datasets",
                content: `Open datasets available for use.`,
            },
        ];
        const header = this.props.single ?
            (<div className="navHeader" >
                <Glyphicon glyph="1-close" className="no-border btn-default" onClick={this.props.onToggle} style={{ cursor: "pointer" }} />
                <span class="nav-title">Catalogs</span>
                <div className="navButtons">
                    {this.renderButtons()}
                </div>
            </div>)
            : (<div className="navHeader">
                <span className="title">{this.props.title}</span>
                <Glyphicon glyph="1-close" className="no-border btn-default" onClick={this.props.onToggle} style={{ cursor: "pointer" }} />
            </div>);
        const tabs =
            (<div className="titles text-left">
                <Tab>
                    {tabContent.map((tab, idx) => (
                        <Tab.TabPane key={`Tab-${idx}`} tab={tab.title}>
                            {tab.content}
                        </Tab.TabPane>
                    ))}
                </Tab>
            </div>)
        const content = (<div className={"nav-content"}>
            {header}
            {tabs}
        </div>);
        //return this.props.resizable ? <Resizable axis="x" resizeHandles={['e']} width={this.getWidth()} onResize={this.resize}>{content}</Resizable> : content;
        return content;
    };

    render() {
        return (
            <Sidebar styles={{
                sidebar: {
                    ...this.props.layout,
                    zIndex: 1022,
                    width: this.getWidth()
                },
                overlay: {
                    zIndex: 1021
                },
                root: {
                    right: this.props.show ? 0 : 'auto',
                    width: '0',
                    overflow: 'visible'
                },
                content: {
                    overflowY: 'auto'
                }
            }} sidebarClassName="nav-menu" onSetOpen={() => {
                this.props.onToggle();
            }} open={this.props.show} docked={this.props.docked} sidebar={this.renderContent()}>
                <div />
            </Sidebar>
        );
    }


    resize = (event, { size }) => {
        this.props.onResize(size.width);
    };

}

export default MenuTopio;
