import React from 'react';
import '../../../style/commonInfo.css';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import UserMainPanel from '../../common/userMainPanel';
import userPersonalStore from '../../../stores/userPersonalStore';

const facultiesLinks = {
    'ПМ-ПУ': 'https://vk.com/stipkomsspmpu',
    'Физический': 'https://vk.com/studsovet_ff',
    'Социологический': 'https://vk.com/soc_studsovet',
    'Химический': 'https://vk.com/chemstudsovet',
    'Юридический': 'https://vk.com/jurfak.studsovet',
    'ИНОЗ (География)': 'https://vk.com/studsovet_geofak',
    'Медицинский': 'https://vk.com/grants_medspbu',
    'ФМО': 'https://vk.com/sirspbu',
   // 'ВШМ': '',
    'Политологии': 'https://vk.com/studsovetfp',
    'Психологии': 'https://vk.com/studentunionpsy',
    'МКН': 'https://vk.com/scmcsspbu',
    'ВШЖиМК (журналистика)': 'https://vk.com/studsovet.jfspbu',
    'ВШЖиМК (реклама и связи с общественностью)': 'https://vk.com/studsovet.jfspbu',
    'Исторический': 'https://vk.com/istfak_press',
   // 'Биологический': '',
};

function UserCommonInfo() {
  return (
      <UserMainPanel title={'Информация'}>
      <div className="blue_bg">
        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Документы ПГАС
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
          <a target="_blank" rel="noreferrer"
            href="https://students.spbu.ru/mmen-stipendii/stipendii/povyshennaya-akademicheskaya-stipendiya">
            <span className="name_doc">
                                            Раздел ПГАС на сайте УРМ СПбГУ
            </span>
          </a>
          <br/>
          <a target="_blank" href="https://students.spbu.ru/files/2953_11092020.pdf" rel="noreferrer">
            <span className="name_doc">
                                                Распоряжение об организации работы по назначению ПГАС
            </span>
          </a>
          <br/>
          <a target="_blank"
            href="https://students.spbu.ru/files/Postanovlenie_US-PAS-2019.pdf" rel="noreferrer">
            <span className="name_doc">
                                                Постановление УС об определении размера ПГАС
            </span>
          </a>
        </p>
      </div>

      <div className="blue_bg">
        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Сроки проверки ПГАС в этом семестре
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
                    Проверка заявлений на ПГАС в этом семестре продлится по 13.10.2020. <br/>
                    Апелляции будут проходить с 14.10.2020 по 19.10.2020 <br/>
                    Окончательные результаты проверки должны быть получены не позднее 23.10.2020
        </p>
      </div>
          {(userPersonalStore.Faculty && facultiesLinks[userPersonalStore.Faculty]) && <div className="blue_bg">

              <p className="header_info_desc" style={{fontWeight: '500'}}>
                  Хотите свзяться с проверяющими, но не знаете, куда писать?
              </p>
              <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
                  Соответствующий паблик для Вашего факультета: <a target="_blank" href={facultiesLinks[userPersonalStore.Faculty]} rel="noreferrer">{facultiesLinks[userPersonalStore.Faculty]}</a>
              </p>
          </div>}

      <div className="blue_bg">

        <p className="header_info_desc" style={{fontWeight: '500'}}>
                    Есть вопросы по работе системы?
        </p>
        <p className="desc_selectors desc_criterion_dspo " style={{backgroundColor: '#e1f1ff', color: '#020202'}}>
                    По всем техническим вопросам можно обращаться в личные сообщения <a target="_blank" href="https://vk.com/digital_bss" rel="noreferrer"> паблика разработчика</a>.
        </p>
      </div>
      </UserMainPanel>
  );
}

export default UserCommonInfo;
