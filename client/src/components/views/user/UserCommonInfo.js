import React from 'react';
import '../../../style/commonInfo.css'

function UserCommonInfo(props) {
    return (<div className="col-md-9 rightBlock">
        <div className="block_main_right">
            <p className="headline">
                Информация
            </p>
            <hr className="hr_blue"/>
            <div className="blue_bg">
                <p className="header_info_desc">
                    Документы ПГАС
                </p>
                <p className="desc_selectors desc_criterion_dspo ">
                    <a className="document" target="_blank"
                       href="https://students.spbu.ru/mmen-stipendii/stipendii/povyshennaya-akademicheskaya-stipendiya">
                                        <span className="name_doc">
                                            Раздел ПГАС на сайте УРМ СПбГУ
                                        </span>
                    </a>
                    <br/>
                    <a className="document" target="_blank" href="https://students.spbu.ru/files/20190911_2616.pdf">
                                            <span className="name_doc">
                                                Распоряжение об организации работы по назначению ПГАС
                                            </span>
                    </a>
                    <br/>
                    <a className="document" target="_blank"
                       href="https://students.spbu.ru/files/Postanovlenie_US-PAS-2019.pdf">
                                            <span className="name_doc">
                                                Постановление УС об определении размера ПГАС
                                            </span>
                    </a>
                </p>
            </div>
            <div className="blue_bg">
                <p className="header_info_desc">
                    Объявлен прием заявлений на академическую стипендию в повышенном размере
                </p>
                <p className="desc_selectors desc_criterion_dspo ">
                    Уважаемые студенты!
                    <br/>
                    Сотрудники учебных отделов по направлениям в срок до 17:45 3 октября 2019 года принимают от
                    студентов Университета, получающих академическую стипендию, заявления-анкеты на повышенную
                    государственную академическую стипендию, заполненные только в электронном виде и распечатанные в
                    соответствии с установленной формой.
                </p>
            </div>
            <div className="blue_bg">
                <p className="header_info_desc">
                    Обнаружили ошибку или неточность? Есть вопросы по работе системы?
                </p>
                <p className="desc_selectors desc_criterion_dspo ">
                    По всем вопросам можно обращаться в личные сообщения <a target="_blank" href="https://vk.com/stipkomsspmpu"> Стипкома
                    Студсовета ПМ-ПУ.</a>
                </p>
            </div>
        </div>
    </div>)
}

export default UserCommonInfo
