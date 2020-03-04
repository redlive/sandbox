import "./layoutAdmin.scss";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Segment, Checkbox, Button, Grid, Icon, Dropdown, Popup, Input, Image, Menu, Message } from "semantic-ui-react";
import { toggleLayoutModeEnabled, setDocumentLyoutVariants } from "../../actions/document";
import {DocumentService} from "../../services/document";

export const LayoutsAdmin = props => {
    const dispatch = useDispatch();
    const templateLayouts = useSelector(state => state.document.eugene_document.layouts);
    const compactMode = useSelector(state => state.app.compactMode|| 'default');
    const thumbnailSrc = useSelector(state => state.canvas.canvasThumbnails || []);
    const [editLayoutStatus, setEditLayoutStatus] = useState({});
    const [validLayoutTitle, setValidLayoutTitle] = useState({});
    const [layoutModeEnabled, setLayoutModeEnabled] = useState(templateLayouts.enabled || false);
    const [variants, setVariants] = useState(
        templateLayouts.variants = templateLayouts.variants.map((variant)=>{
            return {
                ...variant,
                id: DocumentService.guid()
            };
        }) || [{
            id: DocumentService.guid(),
            name: `Default Layout`,
            pages: [0, 0]
        }]
    );
    const setLayoutVariants = (variants) => {
        setVariants([...variants]);
        dispatch(setDocumentLyoutVariants([...variants]));
    };
    const handleToggleLayoutMode = () => {
        setLayoutModeEnabled(!layoutModeEnabled);
        dispatch(toggleLayoutModeEnabled(!layoutModeEnabled));
    };
    const addLayout = () => {
        setLayoutVariants([...variants, {
            id: DocumentService.guid(),
            name: `Default Layout #${DocumentService.guid(3)}`,
            pages: [0, 0]
        }]);
    };
    const deleteLayout = (layoutIndex) => {
        variants.splice(layoutIndex, 1);
        setLayoutVariants([...variants]);
    };
    const editLayoutTitle = (layoutId) => {
        editLayoutStatus[layoutId] = true;
        setEditLayoutStatus({...editLayoutStatus});
    };
    const dropDownOnChange = (layoutIndex, pageIndex, editorPageValue) => {
        variants[layoutIndex].pages[pageIndex] = editorPageValue;
        setLayoutVariants([...variants]);
    };
    const layoutTitleOnChange = (layoutIndex, value) => {

        variants[layoutIndex].name = value;
        setLayoutVariants([...variants]);

        if (isLayoutTitleValid(layoutIndex, value)) {
            delete validLayoutTitle[layoutIndex];
        } else {
            validLayoutTitle[layoutIndex] = true;
        }

        setValidLayoutTitle({...validLayoutTitle});
    };
    const layoutTitleOnChangeDone = (layoutId) => {
        if (!Object.keys(validLayoutTitle).length){
            delete editLayoutStatus[layoutId];
            setEditLayoutStatus({...editLayoutStatus});
        }
    };
    const isLayoutTitleValid = (layoutIndex, value) => {
        return value.length && variants.findIndex((v, i)=>v.name === value && layoutIndex !== i) === -1;
    };

    const drawColumn = (layout, layoutIndex) => {
        return (
            layout.pages.map((activePageIndex, pageIndex)=> {
                return  <Grid.Column key={pageIndex}>
                    <Dropdown
                        placeholder='Preview...'
                        fluid
                        selection
                        value={activePageIndex}
                        onChange={(e, {value})=>dropDownOnChange(layoutIndex, pageIndex, value)}
                        options={
                            thumbnailSrc.map((thumbnail, thumbnailIndex)=>{
                                return {
                                    key: `${pageIndex}-${thumbnailIndex}`,
                                    text: `Page #${thumbnailIndex + 1}`,
                                    value: thumbnailIndex
                                }
                            })
                        }
                    />
                    <Image src={thumbnailSrc[activePageIndex]} size='small'/>
                </Grid.Column>;
            })
        );
    };

    useEffect(()=> {
        if(templateLayouts.enabled !== layoutModeEnabled){
            setLayoutModeEnabled(templateLayouts.enabled);
        }
    });

    return (
        <Segment basic className={`component-layouts-admin ${compactMode}`}>
            <Menu className={compactMode}>
                <Menu.Item>
                    <Checkbox
                        className="middle aligned"
                        toggle
                        label="Enabled"
                        onChange={() => handleToggleLayoutMode()}
                        checked={layoutModeEnabled}
                    />
                </Menu.Item>
                <Popup
                    position='top right'
                    content='Add new layout'
                    trigger={
                        <Menu.Item className={'component-layouts-admin__add-new-layout'}>
                            <Button
                                color='green'
                                compact
                                onClick={() => addLayout()}
                            >
                                <Icon name='plus' fitted/>
                            </Button>
                        </Menu.Item>
                    }
                />
            </Menu>
            {
                layoutModeEnabled && variants.length>0 &&
                <Grid celled>
                    {
                        variants.map((layout, i)=>{
                            return (
                                <Grid.Row key={layout.id}>
                                    <Grid.Column>
                                        {
                                            editLayoutStatus[layout.id] &&
                                            <Input
                                                error={validLayoutTitle[i]}
                                                fluid
                                                label={
                                                    <Button
                                                        color={'yellow'}
                                                        disabled={validLayoutTitle[i]}
                                                        icon={'check'}
                                                        onClick={() => layoutTitleOnChangeDone(layout.id)}
                                                    />
                                                }
                                                labelPosition='right'
                                                placeholder='Layout Name'
                                                value={layout.name}
                                                onKeyPress={({charCode}) => {
                                                    if (charCode === 13) {
                                                        layoutTitleOnChangeDone(layout.id);
                                                    }
                                                }}
                                                onChange={(e, {value}) => layoutTitleOnChange(i, value)}
                                                onBlur={() => layoutTitleOnChangeDone(layout.id)}
                                            />
                                        }
                                        {
                                            validLayoutTitle[i] && !layout.name.length && <Message color='red' size='mini'>Empty layout name</Message>
                                        }
                                        {
                                            validLayoutTitle[i] && layout.name.length && <Message color='red' size='mini'>Duplicate layout name</Message>
                                        }
                                        {
                                            !editLayoutStatus[layout.id] &&
                                            <Menu.Item name='browse' className={'component-layouts-admin__layout-options'}>
                                                <Popup
                                                    inverted
                                                    position='top right'
                                                    content='Delete layout'
                                                    trigger={<Icon name='trash' onClick={() => deleteLayout(i)} />}
                                                />
                                                <Popup
                                                    inverted
                                                    position='top right'
                                                    content='Edit layout'
                                                    trigger={<Icon name='pencil' onClick={() => {
                                                        editLayoutTitle(layout.id);
                                                    }} />}
                                                />
                                                <b>{layout.name}</b>
                                            </Menu.Item>
                                        }
                                        <Grid celled>
                                            <Grid.Row columns={2}>
                                                {
                                                    drawColumn(layout, i)
                                                }
                                            </Grid.Row>
                                        </Grid>
                                    </Grid.Column>
                                </Grid.Row>
                            )
                        })
                    }
                </Grid>
            }
        </Segment>
    );
};
