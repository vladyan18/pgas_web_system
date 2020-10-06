import React from 'react';
import '../../../style/commonInfo.css';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import styled from '@emotion/styled';
import {Panel, HorizontalLine} from './style'

function UserCommonInfo(props) {
  return (<Panel className="col-md-9">
    <div css={css`margin-bottom: 2rem;`}>
      <p className="headline">
                Информация
      </p>
      <HorizontalLine/>
      <div className="blue_bg">
        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Документы ПГАС
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
          <a target="_blank"
            href="https://students.spbu.ru/mmen-stipendii/stipendii/povyshennaya-akademicheskaya-stipendiya">
            <span className="name_doc">
                                            Раздел ПГАС на сайте УРМ СПбГУ
            </span>
          </a>
          <br/>
          <a target="_blank" href="https://students.spbu.ru/files/2953_11092020.pdf">
            <span className="name_doc">
                                                Распоряжение об организации работы по назначению ПГАС
            </span>
          </a>
          <br/>
          <a target="_blank"
            href="https://students.spbu.ru/files/Postanovlenie_US-PAS-2019.pdf">
            <span className="name_doc">
                                                Постановление УС об определении размера ПГАС
            </span>
          </a>
        </p>
      </div>

      <div className="blue_bg">
        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Объявлен прием заявлений на академическую стипендию в повышенном размере
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
                    Уважаемые студенты!
          <br/>
                    Сотрудники учебных отделов по направлениям в срок до 17:45 2 октября 2020 года принимают от
                    студентов Университета, получающих академическую стипендию, заявления-анкеты на повышенную
                    государственную академическую стипендию, заполненные только в электронном виде и распечатанные в
                    соответствии с установленной формой.
        </p>
      </div>
      <div className="blue_bg">

        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Обнаружили ошибку или неточность? Есть вопросы по работе системы?
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
                    По всем вопросам можно обращаться в личные сообщения <a target="_blank" href="https://vk.com/stipkomsspmpu"> Стипкома
                    Студсовета ПМ-ПУ.</a>
        </p>
      </div>
    </div>
  </Panel>);
}

export default UserCommonInfo;
