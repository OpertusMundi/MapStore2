/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import DebugUtils from '../utils/DebugUtils';
import { getGroupedEpics, getReducers} from '../utils/PluginsUtils';
import { createEpicMiddleware } from 'redux-observable';
import ListenerEnhancer from '@carnesen/redux-add-action-listener-enhancer';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import {persistMiddleware, createStoreManager} from '../utils/StateUtils';
import localConfig from '../reducers/localConfig';
import locale from '../reducers/locale';
import browser from '../reducers/browser';
import { getApi } from '../api/userPersistedStorage';
import url from "url";
import { findMapType } from '../utils/MapTypeUtils';
import { set } from '../utils/ImmutableUtils';
import {getPlugins} from "../utils/ModulePluginsUtils";
const standardEpics = {};

const appStore = (
    {
        initialState = {
            defaultState: {},
            mobile: {}
        },
        appReducers = {},
        appEpics = {},
        rootReducerFunc = ({ state, action, allReducers }) => allReducers(state, action)
    },
    plugins = {},
    storeOpts = {}
) => {
    const staticPlugins = getPlugins(plugins);
    const history = storeOpts.noRouter ? null : require('./History').default;
    const storeManager = createStoreManager(
        {
            ...appReducers,
            localConfig,
            locale,
            locales: () => null,
            browser,
            // TODO: missing locale default reducer
            ...(!storeOpts.noRouter && { router: connectRouter(history) })
        },
        { ...standardEpics, ...appEpics });
    const epicMiddleware = persistMiddleware(createEpicMiddleware(storeManager.rootEpic));
    const pluginsReducers = getReducers(staticPlugins);
    Object.keys(pluginsReducers).forEach(key => storeManager.addReducer(key, pluginsReducers[key]));

    const allReducers = storeManager.reduce;
    const optsState = storeOpts.initialState || { defaultState: {}, mobile: {} };
    let defaultState = { ...initialState.defaultState, ...optsState.defaultState };
    const urlData = url.parse(window.location.href, true);
    const mapType = findMapType(urlData.href);
    if (mapType) {
        defaultState = set("maptype.mapType", mapType, defaultState);
    }

    const mobileOverride = { ...initialState.mobile, ...optsState.mobile };
    const rootReducer = (state, action) => {
        return rootReducerFunc({
            state,
            action,
            allReducers,
            mobileOverride
        });
    };
    let store;
    let enhancer;
    if (storeOpts && storeOpts.notify !== false) {
        enhancer = ListenerEnhancer;
    }
    if (storeOpts && storeOpts.persist) {
        storeOpts.persist.whitelist.forEach((fragment) => {
            try {
                const fragmentState = getApi().getItem('mapstore2.persist.' + fragment);
                if (fragmentState) {
                    defaultState[fragment] = JSON.parse(fragmentState);
                }
            } catch (e) {
                console.error(e);
            }
        });
        if (storeOpts.onPersist) {
            setTimeout(() => { storeOpts.onPersist(); }, 0);
        }
    }

    let middlewares = [epicMiddleware];
    if (!storeOpts.noRouter) {
        // Build the middleware for intercepting and dispatching navigation actions
        const reduxRouterMiddleware = routerMiddleware(history);
        middlewares = [...middlewares, reduxRouterMiddleware];
    }

    store = DebugUtils.createDebugStore(rootReducer, defaultState, middlewares, enhancer);
    store.storeManager = storeManager;

    const pluginsEpics = getGroupedEpics(staticPlugins);
    Object.keys(pluginsEpics).forEach(key => store.storeManager.addEpics(key, pluginsEpics[key]));

    if (storeOpts && storeOpts.persist) {
        const persisted = {};
        store.subscribe(() => {
            storeOpts.persist.whitelist.forEach((fragment) => {
                const fragmentState = store.getState()[fragment];
                if (fragmentState && persisted[fragment] !== fragmentState) {
                    persisted[fragment] = fragmentState;
                    try {
                        getApi().setItem('mapstore2.persist.' + fragment, JSON.stringify(fragmentState));
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        });
    }
    return store;
};

export default appStore;
