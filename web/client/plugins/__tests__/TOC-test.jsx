/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {DragDropContext as dragDropContext} from 'react-dnd';
import TestBackend from 'react-dnd-test-backend';

import TOCPlugin from '../TOC';
import { getPluginForTest } from './pluginsTestUtils';

const dndContext = dragDropContext(TestBackend);

describe('TOCPlugin Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Shows TOCPlugin plugin', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            controls: {
                addgroup: {
                    enabled: true
                }
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.getElementsByClassName('mapstore-toc').length).toBe(1);
    });

    it('TOCPlugin shows annotations layer in openlayers mapType', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{id: 'default', title: 'Default', nodes: ['annotations']}],
                flat: [{id: 'annotations', title: 'Annotations'}]
            },
            mapType: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelector('.toc-title').textContent).toBe('Annotations');
        expect(document.querySelector('.toc-group-title').textContent).toBe('Default');
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(1);
    });

    it('TOCPlugin hides filter layer if no groups and no layers are present', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{ id: 'default', title: 'Default', nodes: [] }],
                flat: []
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(0);
    });
    it('TOCPlugin hides filter layer if a group with no layers are present', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [],
                flat: []
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
        expect(document.querySelectorAll('.mapstore-filter.form-group').length).toBe(0);
    });
    it('TOCPlugin use custom group node', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{
                    expanded: true,
                    id: 'Default',
                    name: 'Default',
                    nodes: [ 'layer_01', 'layer_02' ],
                    title: 'Default'
                }],
                flat: [{
                    id: 'layer_01',
                    title: 'title_01'
                }, {
                    id: 'layer_02',
                    title: 'title_02'
                }]
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const GroupNode = ({ node }) => {
            return <div className="custom-group-node">{node.title}</div>;
        };
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin
            groupNodeComponent={GroupNode}/>, document.getElementById("container"));
        const groupNodes = document.querySelectorAll('.custom-group-node');
        expect(groupNodes.length).toBe(1);
        const [ groupNode ] = groupNodes;
        expect(groupNode.innerHTML).toBe('Default');
    });
    it('TOCPlugin use custom layer node', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{
                    expanded: true,
                    id: 'Default',
                    name: 'Default',
                    nodes: [ 'layer_01', 'layer_02' ],
                    title: 'Default'
                }],
                flat: [{
                    id: 'layer_01',
                    title: 'title_01'
                }, {
                    id: 'layer_02',
                    title: 'title_02'
                }]
            },
            maptype: {
                mapType: 'openlayers'
            }
        });
        const LayerNode = ({ node }) => {
            return <div className="custom-layer-node">{node.dummy ? 'dummy' : node.title}</div>;
        };
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin
            layerNodeComponent={LayerNode}/>, document.getElementById("container"));
        const groupNodes = document.querySelectorAll('.custom-layer-node');
        expect(groupNodes.length).toBe(3);
        const [ layerNode01, layerNode02, layerNodeDummy ] = groupNodes;
        expect(layerNode01.innerHTML).toBe('title_01');
        expect(layerNode02.innerHTML).toBe('title_02');
        expect(layerNodeDummy.innerHTML).toBe('dummy');
    });
    it('Update layer title and description button', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{
                    expanded: true,
                    id: 'Default',
                    name: 'Default',
                    nodes: [ 'layer_01', 'layer_02', 'layer_03' ],
                    title: 'Default'
                }],
                flat: [{
                    id: 'layer_01',
                    title: 'title_01',
                    type: 'tileprovider'
                }, {
                    id: 'layer_02',
                    title: 'title_02',
                    type: 'wmts'
                }, {
                    id: 'layer_03',
                    title: 'title_03',
                    type: 'wms',
                    group: 'background'
                }]
            },
            maptype: {
                mapType: 'openlayers'
            },
            security: {
                user: {
                    role: 'ADMIN'
                }
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin items={[{name: 'MetadataExplorer'}, {name: 'AddGroup'}, {name: 'LayerInfo'}]}/>, document.getElementById("container"));
        const tocHead = document.getElementsByClassName('mapstore-toc-head')[0];
        expect(tocHead).toExist();
        const buttons = tocHead.getElementsByTagName('button');
        expect(buttons.length).toBe(3);
    });
    it('Update layer title and description button is hidden when there are no valid layers for updating', () => {
        const { Plugin } = getPluginForTest(TOCPlugin, {
            layers: {
                groups: [{
                    expanded: true,
                    id: 'Default',
                    name: 'Default',
                    nodes: [ 'layer_01', 'layer_02', 'layer_03' ],
                    title: 'Default'
                }],
                flat: [{
                    id: 'layer_01',
                    title: 'title_01',
                    type: 'tileprovider'
                }, {
                    id: 'layer_02',
                    title: 'title_02',
                    type: 'wmts',
                    group: 'background'
                }, {
                    id: 'layer_03',
                    title: 'title_03',
                    type: 'wms',
                    group: 'background'
                }]
            },
            maptype: {
                mapType: 'openlayers'
            },
            security: {
                user: {
                    role: 'ADMIN'
                }
            }
        });
        const WrappedPlugin = dndContext(Plugin);
        ReactDOM.render(<WrappedPlugin items={[{name: 'MetadataExplorer'}, {name: 'AddGroup'}, {name: 'LayerInfo'}]}/>, document.getElementById("container"));
        const tocHead = document.getElementsByClassName('mapstore-toc-head')[0];
        expect(tocHead).toExist();
        const buttons = tocHead.getElementsByTagName('button');
        expect(buttons.length).toBe(2);
    });
    describe('render items from other plugins', () => {
        const TOOL_BUTTON_SELECTOR = '.btn-group button';
        const SELECTED_LAYER_STATE = {
            layers: {
                flat: [
                    {
                        id: 'topp:states__6',
                        format: 'image/png8',
                        search: {
                            url: 'https://something/geoserver/wfs',
                            type: 'wfs'
                        },
                        name: 'topp:states',
                        type: 'wms',
                        url: 'https://something/geoserver/wms',
                        bbox: {
                            crs: 'EPSG:4326',
                            bounds: {
                                minx: -124.73142200000001,
                                miny: 24.955967,
                                maxx: -66.969849,
                                maxy: 49.371735
                            }
                        },
                        visibility: true
                    }
                ],
                groups: [
                    {
                        id: 'Default',
                        title: 'Default',
                        name: 'Default',
                        nodes: [
                            'topp:states__6'
                        ],
                        expanded: true
                    }
                ],
                selected: [
                    'topp:states__6'
                ],
                settings: {
                    expanded: false,
                    node: null,
                    nodeType: null,
                    options: {}
                },
                layerMetadata: {
                    expanded: false,
                    metadataRecord: {},
                    maskLoading: false
                }
            }
        };
        describe('target: toolbar', () => {
            it('render custom plugin', () => {
                const { Plugin } = getPluginForTest(TOCPlugin, {
                    layers: {
                        groups: [{ id: 'default', title: 'Default', nodes: [] }],
                        flat: []
                    },
                    maptype: {
                        mapType: 'openlayers'
                    }
                });
                const WrappedPlugin = dndContext(Plugin);
                ReactDOM.render(<WrappedPlugin items={[{
                    name: "Custom",
                    target: "toolbar",
                    Component: () => <button id="toolbarCustomButton"></button>
                }]} />, document.getElementById("container"));
                expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(1);
                expect(document.querySelector(`${TOOL_BUTTON_SELECTOR}#toolbarCustomButton`)).toExist();
            });
            it('selector do not show the button when return false', () => {
                const { Plugin } = getPluginForTest(TOCPlugin, {
                    layers: {
                        groups: [{ id: 'default', title: 'Default', nodes: [] }],
                        flat: []
                    },
                    maptype: {
                        mapType: 'openlayers'
                    }
                });
                const WrappedPlugin = dndContext(Plugin);
                ReactDOM.render(<WrappedPlugin items={[{
                    name: "Custom",
                    target: "toolbar",
                    selector: () => {
                        return false;
                    },
                    Component: () => <button id="toolbarCustomButton"></button>
                }]} />, document.getElementById("container"));
                expect(document.querySelector(`${TOOL_BUTTON_SELECTOR}#toolbarCustomButton`)).toNotExist();
            });
            it('selector reads status, selectedGroups, selectedLayers', () => {
                const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
                const WrappedPlugin = dndContext(Plugin);
                ReactDOM.render(<WrappedPlugin items={[{
                    name: "Custom",
                    target: "toolbar",
                    selector: ({ status, selectedGroups, selectedLayers}) => {
                        return status === "LAYER" && selectedGroups.length === 0 && selectedLayers[0].id === "topp:states__6";
                    },
                    Component: () => <button id="toolbarCustomButton"></button>
                }]} />, document.getElementById("container"));
                expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBeGreaterThan(0); // other buttons are shown.
                expect(document.querySelector(`${TOOL_BUTTON_SELECTOR}#toolbarCustomButton`)).toExist();
            });
            it('Component receives the property \`status\`', () => {
                const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
                const WrappedPlugin = dndContext(Plugin);
                ReactDOM.render(<WrappedPlugin items={[{
                    name: "Custom",
                    target: "toolbar",
                    Component: ({ status, selectedGroups, selectedLayers}) => {
                        expect(status === "LAYER" && selectedGroups.length === 0 && selectedLayers[0].id === "topp:states__6").toBeTruthy();
                        return <button id={`toolbarCustomButton-${status}`}></button>;
                    }
                }]} />, document.getElementById("container"));
                expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBeGreaterThan(0); // other buttons are shown.
                expect(document.querySelector(`${TOOL_BUTTON_SELECTOR}#toolbarCustomButton-LAYER`)).toExist();
            });
        });

        it('AddLayer and AddGroup do not show without proper plugins', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, {
                layers: {
                    groups: [{ id: 'default', title: 'Default', nodes: [] }],
                    flat: []
                },
                maptype: {
                    mapType: 'openlayers'
                }
            });
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(0);
        });
        it('render AddLayer', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, {
                layers: {
                    groups: [{ id: 'default', title: 'Default', nodes: [] }],
                    flat: []
                },
                maptype: {
                    mapType: 'openlayers'
                }
            });
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "MetadataExplorer"
            }]} />, document.getElementById("container"));
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(1);
            expect(document.querySelector(`${TOOL_BUTTON_SELECTOR} .glyphicon-add-layer`)).toExist();
        });
        it('render AddGroup', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, {
                layers: {
                    groups: [{ id: 'default', title: 'Default', nodes: [] }],
                    flat: []
                },
                maptype: {
                    mapType: 'openlayers'
                }
            });
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "AddGroup"
            }]} />, document.getElementById("container"));
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(1);
            expect(document.querySelector(`${TOOL_BUTTON_SELECTOR} .glyphicon-add-folder`)).toExist();
        });
        const ZOOM_TO_SELECTOR = `${TOOL_BUTTON_SELECTOR} .glyphicon-zoom-to`;
        const FEATURES_GRID_SELECTOR = `${TOOL_BUTTON_SELECTOR} .glyphicon-features-grid`;
        const REMOVE_SELECTOR = `${TOOL_BUTTON_SELECTOR } .glyphicon-trash`;
        const SETTINGS_SELECTOR = `${TOOL_BUTTON_SELECTOR} .glyphicon-wrench`;
        const FILTER_LAYER_SELECTOR = `${TOOL_BUTTON_SELECTOR} .glyphicon-filter-layer`;
        const WIDGET_BUILDER_SELECTOR = `${TOOL_BUTTON_SELECTOR} .glyphicon-stats`;
        it('render default tools (zoomToLayer, remove layer, for selected layer, metadata tool', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin />, document.getElementById("container"));
            // check zoom and remove selector
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(3);
            expect(document.querySelector(ZOOM_TO_SELECTOR)).toExist();
            expect(document.querySelector(REMOVE_SELECTOR)).toExist();

        });
        it('render FeatureEditor', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "FeatureEditor"
            }]} />, document.getElementById("container"));
            // check tools
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(4);
            expect(document.querySelector(ZOOM_TO_SELECTOR)).toExist();
            expect(document.querySelector(FEATURES_GRID_SELECTOR)).toExist();
            expect(document.querySelector(REMOVE_SELECTOR)).toExist();
        });
        it('render TOCItemsSettings', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "TOCItemsSettings"
            }]} />, document.getElementById("container"));
            // check tools
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(4);
            expect(document.querySelector(ZOOM_TO_SELECTOR)).toExist();
            expect(document.querySelector(SETTINGS_SELECTOR)).toExist();
            expect(document.querySelector(REMOVE_SELECTOR)).toExist();
        });
        it('render FilterLayer', () => {
            const { Plugin } = getPluginForTest(TOCPlugin, SELECTED_LAYER_STATE);
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "FilterLayer"
            }]} />, document.getElementById("container"));
            // check tools
            expect(document.querySelectorAll(TOOL_BUTTON_SELECTOR).length).toBe(4);
            expect(document.querySelector(ZOOM_TO_SELECTOR)).toExist();
            expect(document.querySelector(FILTER_LAYER_SELECTOR)).toExist();
            expect(document.querySelector(REMOVE_SELECTOR)).toExist();
        });
        it('render WidgetBuilder', () => { // this test fails only on travis (not locally)
            const { Plugin } = getPluginForTest(TOCPlugin, { ...SELECTED_LAYER_STATE, controls: { widgetBuilder: {available: true}}});
            const WrappedPlugin = dndContext(Plugin);
            ReactDOM.render(<WrappedPlugin items={[{
                name: "WidgetBuilder"
            }, {
                name: "Widgets"
            }]} />, document.getElementById("container"));
            // check tools

            expect(document.querySelector(ZOOM_TO_SELECTOR)).toExist("zoom doesn't exist");
            expect(document.querySelector(WIDGET_BUILDER_SELECTOR)).toExist("widget doesn't exist");
            expect(document.querySelector(REMOVE_SELECTOR)).toExist("remove doesn't exist");
        });
    });
});
