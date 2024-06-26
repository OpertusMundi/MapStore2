/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    queryPanelSelector,
    wfsDownloadSelector,
    widgetBuilderAvailable,
    widgetBuilderSelector,
    initialSettingsSelector,
    originalSettingsSelector,
    activeTabSettingsSelector,
    drawerEnabledControlSelector,
    showCoordinateEditorSelector,
    shareSelector,
    showConfirmDeleteMapModalSelector
} from '../controls';

const state = {
    controls: {
        queryPanel: {
            enabled: true
        },
        layerdownload: {
            available: true,
            enabled: true
        },
        widgetBuilder: {
            available: true,
            enabled: true
        },
        featuregrid: {
            enabled: true
        },
        layersettings: {
            initialSettings: {
                id: 'layerId',
                name: 'layerName',
                style: ''
            },
            originalSettings: {
                style: 'generic'
            },
            activeTab: 'style'
        },
        mapDelete: {
            enabled: true
        }
    }
};

describe('Test controls selectors', () => {
    it('test queryPanelSelector', () => {
        const retVal = queryPanelSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });

    it('test wfsDownloadSelector', () => {
        const retVal = wfsDownloadSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test widgetBuilderAvailable', () => {
        const retVal = widgetBuilderAvailable(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test widgetBuilderAvailable no widgetBuilder in state', () => {
        const retVal = widgetBuilderAvailable({});
        expect(retVal).toBe(false);
    });
    it('test widgetBuilderSelector', () => {
        const retVal = widgetBuilderSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test initialSettingsSelector', () => {
        const retVal = initialSettingsSelector(state);
        expect(retVal).toExist();
        expect(retVal).toEqual({
            id: 'layerId',
            name: 'layerName',
            style: ''
        });
    });
    it('test originalSettingsSelector', () => {
        const retVal = originalSettingsSelector(state);
        expect(retVal).toExist();
        expect(retVal).toEqual({
            style: 'generic'
        });
    });
    it('test activeTabSettingsSelector', () => {
        const retVal = activeTabSettingsSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe('style');
        expect(activeTabSettingsSelector({})).toBe('general');
    });
    it('test drawerEnabledControlSelector default value', () => {
        const retVal = drawerEnabledControlSelector(state);
        expect(retVal).toBe(false);
    });
    it('test drawerEnabledControlSelector', () => {
        const retVal = drawerEnabledControlSelector({controls: {drawer: {enabled: true}}});
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test showCoordinateEditorSelector', () => {
        const retVal = showCoordinateEditorSelector({controls: {measure: {showCoordinateEditor: true}}});
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test shareSelector', () => {
        const retVal = shareSelector({controls: {share: {enabled: true}}});
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test showConfirmDeleteMapModalSelector', () => {
        const showConfirmDelete = showConfirmDeleteMapModalSelector(state);
        expect(showConfirmDelete).toBe(true);
    });
});
