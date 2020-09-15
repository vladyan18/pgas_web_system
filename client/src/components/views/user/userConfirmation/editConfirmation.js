import React from 'react';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import styled from '@emotion/styled';
import {useState} from 'react';
import {Panel, HorizontalLine} from "../style";
import HelpButton from "../helpButton";

function LinkConfirmation(props) {
    let url = props.confirmation.Data;
    if (url.startsWith("//")) {
        url = url.substring(2);
    }
    const [URL, setURL] = useState(url);
    const [Name, setName] = useState(props.confirmation.Name);
    const [additionalInfo, setAdditionalInfo] = useState(props.confirmation.additionalInfo);

    return (
        <div>
            <form>
                <label htmlFor="Name"><span className="redText">*</span>Название:
                </label>
                <input id="Name" className="form-control" type="text" disabled required autoComplete={'off'}
                       onInput={(e) => setName(e.target.value)} defaultValue={Name} autoFocus={true}/>
                <label htmlFor="Link"><span className="redText">*</span>Ссылка:</label>
                <input id="Link" className="form-control" type="text" disabled required
                       onInput={(e) => setURL(e.target.value)} defaultValue={URL} autoComplete={'off'}/>
                <label htmlFor="AddInfo">Дополнительная информация:
                </label>
                <input id="AddInfo" className="form-control" type="text" required
                       onInput={(e) => setAdditionalInfo(e.target.value)} defaultValue={additionalInfo} autoComplete={'off'}/>
                       <div style={{display: "flex", justifyContent: "space-between"}}>
                <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                       onClick={() => {props.saveCallback({URL, Name, additionalInfo})}} disabled={!(URL && Name)}/>
                <input id="SaveButton" className="btn btn-danger" type="button" value="Отменить"
                       onClick={() => {props.saveCallback()}}/>
                       </div>
            </form>
        </div>
    )
}

function DocConfirmation(props) {
    const [Name, setName] = useState(props.confirmation.Name);
    const [additionalInfo, setAdditionalInfo] = useState(props.confirmation.additionalInfo);

    return (
        <div>
            <form>
                <label htmlFor="Name"><span className="redText">*</span>Название:
                </label>
                <input id="Name" className="form-control" type="text" required autoComplete={'off'}
                       onInput={(e) => setName(e.target.value)} defaultValue={Name} disabled autoFocus={true}/>
                <label htmlFor="AddInfo">Дополнительная информация:
                </label>
                <input id="AddInfo" className="form-control" type="text" required
                       onInput={(e) => setAdditionalInfo(e.target.value)} defaultValue={additionalInfo} autoComplete={'off'}/>

                <div style={{display: "flex", justifyContent: "space-between"}}>
                <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                       onClick={() => {props.saveCallback({Name, additionalInfo})}} disabled={!(Name)}/>
                <input id="SaveButton" className="btn btn-danger" type="button" value="Отменить"
                       onClick={() => {props.saveCallback()}}/>
                </div>
            </form>
        </div>
    )
}

function SZConfirmation(props) {
    const [SZAppendix, setSZAppendix] = useState(props.confirmation.SZ.Appendix);
    const [SZParagraph, setSZParagraph] = useState(props.confirmation.SZ.Paragraph);
    const [Name, setName] = useState(props.confirmation.Name);

    return (
        <div>
            <form >
            <label htmlFor="Name"><span className="redText">*</span>Название служебной записки:
            </label>
            <input disabled id="SZName" name="SZname" className="form-control" type="text" required
                   onChange={(e) => setName(e.target.value)} defaultValue={Name} autoFocus={true}/>
            <label htmlFor="Link">Приложение:</label>
            <input disabled id="SZApp" className="form-control" type="text" required
                   onChange={(e) => setSZAppendix(e.target.value)} defaultValue={SZAppendix}/>
            <label htmlFor="Link">Пункт:</label>
            <input disabled id="SZPar" className="form-control" type="text" required
                   onChange={(e) => setSZParagraph(e.target.value)} defaultValue={SZParagraph}/>
            <div style={{display: "flex", justifyContent: "space-between"}}>
            <input id="SaveButton" className="btn btn-success" type="button" value="Сохранить"
                   onClick={() => {props.saveCallback({SZ: {Appendix: SZAppendix, Paragraph: SZParagraph}, Name})}}
                   disabled={!(Name)}/>
            <input id="SaveButton" className="btn btn-danger" type="button" value="Отменить"
                   onClick={() => {props.saveCallback()}}/>
            </div>
        </form>
        </div>
    )
}

function EditConfirmation(props) {
    const [confirmation, setConfirmation] = useState(props.confirmation);

    function save(object) {
        props.save(object);
    }

    return (<div className="modalContentWrapper" style={{display: "flex", justifyContent: "center", maxWidth: "100vw"}}>
        <div className="block"
             style={{maxHeight: "inherit", width: "25rem", overflow: "auto"}}>
            <p className="headline">Редактирование подтверждения</p>
            <HorizontalLine/>
            {(confirmation.Type === 'link') && <LinkConfirmation confirmation={confirmation} saveCallback={save}/>}
            {(confirmation.Type === 'SZ') && <SZConfirmation confirmation={confirmation} saveCallback={save}/>}
            {(confirmation.Type === 'doc') && <DocConfirmation confirmation={confirmation} saveCallback={save}/>}
        </div>
    </div>);
}

export default EditConfirmation;
