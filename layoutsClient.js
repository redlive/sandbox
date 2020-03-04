import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Segment, Dropdown, Header } from "semantic-ui-react";
import { saveDocument, setLayoutActiveVariantIndex } from "../../actions/document";
import {setActiveTemplatePageById} from "../../actions/canvasActions";

export const LayoutsClient = props => {
    const dispatch = useDispatch();
    const template = useSelector(state => state.document.eugene_document);
    const [templateLayouts] = useState(template && template.layouts || {});
    const [layoutModeEnabled] = useState(templateLayouts.enabled || false);
    const [variants] = useState(templateLayouts.variants || []);
    const [activeVariantIndex, setActiveVariantIndex] = useState(templateLayouts.active || "");

    const onVariantChanged = (value) => {
        const index = variants.findIndex(variant => variant.name === value);
        setActiveVariantIndex(value);
        dispatch(setLayoutActiveVariantIndex(value));
        dispatch(setActiveTemplatePageById(variants[index].pages[0]));
        dispatch(saveDocument(false, true));
    };

    if (!layoutModeEnabled || !variants.length) {
        return null;
    }

    return (
        <Segment inverted basic className={`component-layouts__client ${props.compactMode}`}>
            <Header as={'h3'}>Available Layouts:</Header>
            <Dropdown
                onChange={(e, {value})=>onVariantChanged(value)}
                fluid
                placeholder='State'
                search
                selection
                value={activeVariantIndex}
                options={variants.map((variant, index)=>{
                return {
                    key: index,
                    text: variant.name,
                    value: variant.name
                }
            })} />
        </Segment>
    );
};