export default function reducer(
    state = {
        loading: true,
        templates: [],
        templatesMetaData: {},
        fonts: [],
        jobs: [],
        assets: [],
        jobsMetaData: {},
        assetsMetaData: {},
        error: null,
        assetIsDeleted: null,
        assetsTags: [],
    },
    action
) {
    switch (action.type) {
        case 'TEMPLATES_LIST_LOADING':
            state = { ...state, templates: [], loading: true, error: false }
            break
        case 'JOBS_LIST_LOADING':
            state = { ...state, jobs: [], loading: true, error: false }
            break
        case 'ASSETS_LIST_LOADING':
            state = { ...state, assets: [], loading: true, error: false }
            break
        case 'APPEND_JOB_TEMPLATE':
            state.jobs.unshift(action.payload)
            state = {
                ...state,
                jobs: [...state.jobs],
                loading: false,
                error: false,
            }
            break
        case 'APPEND_ADMIN_TEMPLATE':
            state.templates.unshift(action.payload)
            state = {
                ...state,
                templates: [...state.templates],
                loading: false,
                error: false,
            }
            break
        case 'APPEND_ADMIN_FONT':
            state.fonts.unshift(action.payload)
            state = {
                ...state,
                fonts: [...state.fonts],
                loading: false,
                error: false,
            }
            break
        case 'FETCH_TEMPLATES_LIST':
            state = {
                ...state,
                templates: action.payload.list,
                templatesMetaData: action.payload.metadata,
                loading: false,
                error: false,
            }
            break
        case 'FETCH_TEMPLATES_REJECTED':
            state = { ...state, templates: [], loading: false, error: true }
            break
        case 'DELETE_MAIN_TEMPLATE_AND_JOBS':
            const reducedTemplate = state.templates.filter(template => {
                return template.id !== action.payload
            })
            state = {
                ...state,
                templates: reducedTemplate,
                loading: false,
                error: true,
            }
            break
        case 'DELETE_MAIN_TEMPLATE':
            const reducedTemplates = state.templates.filter(template => {
                return template.id !== action.payload
            })
            state = {
                ...state,
                templates: reducedTemplates,
                loading: false,
                error: true,
            }
            break
        case 'DELETE_JOB':
            const reducedJobss = state.jobs.filter(job => {
                return job.id !== action.payload
            })
            state = {
                ...state,
                jobs: reducedJobss,
                loading: false,
                error: true,
            }
            break
        case 'DELETE_ALL_JOBS_ON_MASTER_TEMPLATE':
            let templateIndex = state.templates.findIndex(
                template => template.id === action.payload
            )

            state = {
                ...state,
                templates: state.templates.map((item, index) => {
                    if (index !== templateIndex) return item

                    return {
                        ...item,
                        jobCount: 0,
                    }
                }),
            }

            break
        case 'FETCH_JOBS_LIST':
            state = {
                ...state,
                jobs: action.payload.list,
                jobsMetaData: action.payload.metadata,
                loading: false,
                error: false,
            }
            break
        case 'FETCH_ASSETS_LIST':
            state = {
                ...state,
                assets: action.payload.list,
                assetsMetaData: action.payload.metadata,
                loading: false,
                error: false,
            }
            break
        case 'APPEND_ASSETS_LIST':
            state.assets.unshift(action.payload)
            state = {
                ...state,
                assets: [...state.assets],
                loading: false,
                error: false,
            }
            break
        case 'FETCH_ASSETS_REJECTED':
            state = { ...state, assets: [], loading: false, error: true }
            break
        case 'DELETE_ASSET':
            const reducedAssets = state.assets.filter(asset => {
                return asset.id !== action.payload
            })
            state = {
                ...state,
                assets: reducedAssets,
                loading: false,
                error: true,
                assetIsDeleted: true,
            }
            break
        case 'DELETE_ASSET_SUCCESSFUL':
            state = { ...state, assetIsDeleted: true }
            break
        case 'DELETE_ASSET_REJECTED':
            state = {
                ...state,
                loading: false,
                error: action.payload,
                assetIsDeleted: false,
            }
            break
        case 'GET_ASSETS_TAGS':
            state = { ...state, assetsTags: action.payload }
            break
        case 'DELETE_FONT':
            const reducedFonts = state.fonts.filter(font => {
                return font.font_id !== action.payload
            })
            state = {
                ...state,
                fonts: reducedFonts,
                loading: false,
                error: true,
            }
            break
        case 'FETCH_FONTS_LIST':
            state = {
                ...state,
                fonts: action.payload,
                loading: false,
                error: false,
            }
            break
        case 'TOGGLE_PUBLISH_TEMPLATE':
            const templates = [...state.templates].map(template => {
                if (template.id === action.payload.templateId) {
                    template.published = action.payload.published
                }
                return template
            })
            state = { ...state, templates }
            break
    }
    return state
}
