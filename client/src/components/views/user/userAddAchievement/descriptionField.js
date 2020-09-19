import React, {useEffect, useState} from 'react';
import {css, jsx} from '@emotion/core';
import criteriasStore, {fetchSendObj} from "../../../../stores/criteriasStore";
import ReactMarkdown from "react-markdown";
import HelpButton from "../helpButton";
import {Popover} from "react-bootstrap";
import userPersonalStore from "../../../../stores/userPersonalStore";
/** @jsx jsx */

const recommendationStyle = css`
  color: blue;
  cursor: pointer;
  font-weight: lighter;
  
  :hover {
  color: #7c969e;
  }
  
          @media only screen and (max-device-width: 768px) {
            font-size: small;
        }
`;

const fieldStyle = css`
      @media only screen and (max-device-width: 768px) {
            ::placeholder {
                font-size: small;
            }
      }   
`

const getLineColor = function(isInvalid) {
    if (isInvalid === false) return '#19b319';
    if (isInvalid === true) return '#dc3545';
    return undefined;
};

const achievementPopover = (
    <Popover id="popover-basic">
        <Popover.Content style={{backgroundColor: 'rgb(243, 243, 255)'}}>
            Название достижения должно позволить однозначно понять, что это за достижение. <br/>
            <span style={{color: '#4d4d4d'}}>
                    Примеры:<br/>
            <i>- Статья *название* с докладом на конференции *название*</i> <br/>
            <i>- Победа в олимпиаде *название*</i>
          </span>
        </Popover.Content>
    </Popover>
);

function RecommendationBlock(props) {
    if (!props.value) return null;
    return <div>
        <div><span><i>Возможно, это:</i></span></div>
        <div css={recommendationStyle} onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.cb(props.value);
        }}>
            {props.value.toString().replace(/,/g, ', ')}
        </div>
    </div>
}

let timer;
const debounce = (callback, wait = 250) => {
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), wait);
    };
};

function getValidityClass(val) {
    if  (val) {
        return ' is-invalid';
    }
    if (val === false) {
        return ' is-valid';
    }
    return '';
}

function DescriptionField(props) {
    const [recommendation, setRecommendation] = useState();
    const [recommendationHidden, setRecommendationHidden] = useState();
    const [textRef, setTextRef] = useState();
    const recommendationCb = (newValue) => {
        setRecommendation(undefined);
        if (localStorage.getItem('descriptionsHidden')) {
            const ref = props.dateRef();
            if (ref) ref.inputElement.focus();
        }
        props.updateChars({chars: newValue});
    };

    const changeCb = (e) => {
        const newValue = e.target.value;
        if (!props.disableRecommend && ['ПМ-ПУ'].includes(userPersonalStore.Faculty)) {
            classify(newValue);
        }
        props.updateDescr(newValue);
    };

    const classify = debounce((descr) => {
        if (!descr || descr.length < 3) {
            setRecommendation(undefined);
            return;
        }
        fetchSendObj('/classifyDescription', {data: descr, faculty: userPersonalStore.Faculty}).then(res => {
            if (userPersonalStore.LastName === 'Волосников')
                console.log(res.root);
            setRecommendation(res.classifier);
        })}, 300);

    useEffect(() => {
        if (textRef) {
            //textRef.style.height = 'inherit';
            const height = Math.max(textRef.scrollHeight + 2, 70) + "px";
            if (height !== textRef.style.height) {
                textRef.style.height = 0;
                textRef.style.height = height;
            }
        }
    }, [textRef, props.value]);
    return <div className="form_elem_with_left_border" style={{marginTop: '20px', borderColor: getLineColor(props.descrInvalid)}}>
        <label className="control-label" htmlFor="comment">Название достижения:
            <HelpButton overlay={achievementPopover} placement={"top"} />
        </label>
        <textarea
            ref={(textRef) => {
                setTextRef(textRef);
                props.descriptionRef(textRef);
            }}
            autoFocus={!!localStorage.getItem('descriptionsHidden')}
            disabled={props.disabled}
            className={'form-control area_text' + getValidityClass(props.descrInvalid)}
            name="comment"
            placeholder={
                'Краткое, но однозначное название \nНапример: Победа в международной олимпиаде "Суперолимпиада" по физике'
            }
            id="comment"
            required onChange={changeCb} value={props.value} style={{marginTop: '0', width: '100%', minHeight: '3rem'}}
        />

        {!props.disableRecommend && <RecommendationBlock value={recommendation} cb={recommendationCb}/>}
    </div>
}

export default DescriptionField;


