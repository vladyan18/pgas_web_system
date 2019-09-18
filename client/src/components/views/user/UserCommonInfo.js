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
                    <a className="document" target="_blank" href="/doc/Kriterii_PGAS_PM-PU.pdf">
                                        <span className="name_doc">
                                            Критерии ПГАС ПМ-ПУ
                                        </span>
                    </a>
                    <br/>
                    <a className="document" target="_blank" href="/doc/rasporyazhenie_vesna_2019.pdf">
                                            <span className="name_doc">
                                                Распоряжение об организации работы по назначению ПГАС
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
                    Сотрудники учебных отделов по направлениям в срок до 17:45 5 марта 2019 года принимают от
                    студентов Университета, получающих академическую стипендию, заявления-анкеты на повышенную
                    государственную академическую стипендию, заполненные только в электронном виде и распечатанные в
                    соответствии с установленной формой.
                </p>
            </div>
            <div className="blue_bg">
                <p className="header_info_desc">
                    Списки студентов, представленных к назначению повышенной академической стипендии в весеннем семестре
                    2017-2018 учебного года
                </p>
                <p className="desc_selectors desc_criterion_dspo ">
                    Ниже публикуем списки студентов (с баллами по анкетам), которые представлены к назначению
                    государственной академической стипендии в повышенном размере в весеннем семестре 2017-2018 учебного
                    года.
                    <br/>
                    Биология
                    <br/>
                    Востоковедение
                    <br/>
                    География и геоэкология.
                </p>
            </div>
        </div>
    </div>)
}

export default UserCommonInfo