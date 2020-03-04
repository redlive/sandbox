import { HomeService } from '../services/home'
import insertCss from 'insert-css'
import { FontService } from '../services/font'
import { setErrorHandlerMessage } from './app'

export function getTemplatesListByQuery( paging, searchStr, filter ) {
    return function ( dispatch ) {
        dispatch( { type: 'TEMPLATES_LIST_LOADING' } )
        HomeService.getTemplatesListByQuery( paging, searchStr, filter )
            .then(
                function ( { data } ) {
                    dispatch( { type: 'FETCH_TEMPLATES_LIST', payload: data } )
                }.bind( this )
            )
            .catch(
                function ( error ) {
                    dispatch( { type: 'FETCH_TEMPLATES_REJECTED' } )
                }.bind( this )
            )
    }
}

export function deleteMainTemplate( templateId, onErrorCallback ) {
    return function ( dispatch, store ) {
        HomeService.deleteMainTemplate( templateId )
            .then( function () {
                dispatch(
                    setErrorHandlerMessage( {
                        message: 'Template deleted successfully.',
                        visible: true,
                        type: 'positive',
                    } )
                )
                setTimeout(
                    function () {
                        dispatch(
                            setErrorHandlerMessage( {
                                message: '',
                                visible: false,
                                type: 'positive',
                            } )
                        )
                    }.bind( this ),
                    HomeService.getErrorHandlerInterval()
                )
                let currentMasterTemplates = store().app.loggedUserInfo
                    .currentMasterTemplates
                dispatch( {
                    type: 'APP___UPDATE_CURRENT_MASTER_TEMPLATES',
                    payload: --currentMasterTemplates,
                } )
                dispatch( { type: 'DELETE_MAIN_TEMPLATE', payload: templateId } )
            } )
            .catch(
                function ( error ) {
                    dispatch(
                        setErrorHandlerMessage( {
                            message: error.response.data.message,
                            visible: true,
                            type: 'warning',
                        } )
                    )
                    setTimeout(
                        function () {
                            dispatch(
                                setErrorHandlerMessage( {
                                    message: '',
                                    visible: false,
                                    type: 'positive',
                                } )
                            )
                        }.bind( this ),
                        HomeService.getErrorHandlerInterval()
                    )
                    dispatch( {
                        type: 'APP___UPDATE_CURRENT_MASTER_TEMPLATES',
                        payload: --currentMasterTemplates,
                    } )
                    onErrorCallback()
                }.bind( this )
            )
    }
}

export function appendAdminTemplate( newTemplate ) {
    return function ( dispatch, store ) {
        let currentMasterTemplates = store().app.loggedUserInfo
            .currentMasterTemplates
        dispatch( { type: 'APPEND_ADMIN_TEMPLATE', payload: newTemplate } )
        dispatch( {
            type: 'APP___UPDATE_CURRENT_MASTER_TEMPLATES',
            payload: ++currentMasterTemplates,
        } )
    }
}

export function getTenantsFontsListByQuery( searchStr, type ) {
    return function ( dispatch ) {
        dispatch( { type: 'FONTS_LIST_LOADING' } )
        HomeService.getTenantsFontsListByQuery( searchStr, type )
            .then(
                function ( { data } ) {
                    dispatch( { type: 'FETCH_FONTS_LIST', payload: data } )
                    data.forEach( font => {
                        insertCss( FontService.getFontCssUrl( font ) )
                    } )
                }.bind( this )
            )
            .catch( function ( error ) { }.bind( this ) )
    }
}

export function appendAdminFont( newFont ) {
    return function ( dispatch ) {
        dispatch( { type: 'APPEND_ADMIN_FONT', payload: newFont } )
    }
}
