import React, {Component} from 'react';
import '../../../style/user_main.css';
import lock from '../../../img/lock.png';
import logo from '../../../img/gerb.png';
import DateInput from "../../DateInput";
import {fetchSendWithoutRes} from "../../../services/fetchService";
import {withRouter} from "react-router";

class UserRegistrationPage extends Component {
    constructor(props) {
        super(props);
        this.state = {isDateValid: false, dateValidationResult: true, Type: "Бакалавриат"};

        this.handleChange = (e, field) => {
            let st = this.state;
            st[field] = e.target.value;
            this.setState(st)
        };

        this.register = (e) => {
            let user = {};
            user.lastname = this.state.LastName;
            user.name = this.state.Name;
            user.patronymic = this.state.Patronymic;
            user.spbuId = this.state.SpbuId;
            user.birthdate = makeDate(this.state.Birthdate);
            user.faculty = this.state.Faculty;
            user.type = this.state.Type;
            user.course = this.state.Course;

            fetchSendWithoutRes('/api/registerUser', user).then((result) => {
                if (result) this.props.history.push('/');
            })

        };

        this.handleDateChange = (value) => {
            let st = this.state;
            st.Birthdate = value;
            this.setState(st)
        }

    };


    render() {
        return (
            <div className="container-fluid">
                <header>
                    <div className="row page_top">
                        <div className="col-12 block_header">
                            <img src={logo} className="logo_img"/>
                            <div className="p_header">Санкт-Петербургский государственный университет <br/>
                                Регистрация
                            </div>

                        </div>
                    </div>

                </header>
                <main style={{margin: "0"}}>
                    <div className="row register_background">
                        <div className="col-xl-4 col-lg-3 col-md-2 col-sm-2 col-1"></div>
                        <div className="col-xl-4 col-lg-6 col-md-8 col-sm-8 col-10 login">
                            <img src={lock} className="pic_lock"/>
                            <div className="title_text">Регистрация в системе ПГАС</div>
                            <div className="header_logo_text">Для использования системы необходимо пройти
                                регистрацию.<br/>
                                Запрашиваемые данные необходимы для формирования анкеты. Регистрируясь вы разрешаете
                                СПбГУ и Студсовету обрабатывать ваши персональные данные (согласно анкете на ПГАС).
                            </div>
                            <form id='register'>
                                <span className="redText">*</span><label>Фамилия</label><br/>
                                <input type='text' style={{margin: "0"}} id='lastname' name='lastname'
                                       onChange={(e) => this.handleChange(e, 'LastName')} className="form-control"
                                       required autocomplete="off"/><br/>
                                <span className="redText">*</span><label>Имя</label><br/>
                                <input type='text' style={{margin: "0"}} id='name' name='name'
                                       onChange={(e) => this.handleChange(e, 'Name')} className="form-control" required
                                       autocomplete="off"/><br/>
                                <label>Отчество</label><br/>
                                <input type='text' style={{margin: "0"}} id='patronymic' name='patronymic'
                                       onChange={(e) => this.handleChange(e, 'Patronymic')} oninput="$(this).validate()"
                                       className="form-control" autocomplete="off"/><br/>

                                <span className="redText">*</span><label>Дата рождения</label><br/>
                                <DateInput style={{width: "100%"}} updater={this.handleDateChange}
                                           isValid={this.state.dateValidationResult}/><br/>

                                <span className="redText" style={{"margin-top": "2rem"}}>*</span><label>Почта
                                СПбГУ</label><br/>
                                <input type='text' style={{margin: "0"}} id='name' name='name'
                                       onChange={(e) => this.handleChange(e, 'SpbuId')}
                                       className="form-control" required autoComplete="off"
                                       placeholder="st******@student.spbu.ru"/><br/>
                                <span className="redText">*</span><label>Факультет</label><br/>
                                <select id="faculty" className="form-control "
                                        onChange={(e) => this.handleChange(e, 'Faculty')} required defaultValue="">
                                    <option disabled value="">Факультет</option>
                                    {this.props.faculties.map((fac) => {
                                        return (<option value={fac}>{fac}</option>)
                                    })}
                                </select><br/>
                                <span className="redText">*</span><label>Ступень обучения</label><br/>
                                <select id="type" name="type" style={{margin: "0"}} className="form-control "
                                        onChange={(e) => this.handleChange(e, 'Type')} required>
                                    <option disabled>Ступень</option>
                                    <option selected value="Бакалавриат">
                                        Бакалавриат
                                    </option>
                                    <option value="Магистратура">
                                        Магистратура
                                    </option>
                                    <option value="Специалитет">
                                        Специалитет
                                    </option>
                                </select><br/>
                                <span className="redText">*</span><label>Курс</label><br/>
                                <input type='number' style={{margin: "0"}} id='course'
                                       onChange={(e) => this.handleChange(e, 'Course')} name='course'
                                       className="form-control" required autocomplete="off"/><br/>


                                <button type="button" onClick={this.register}
                                        className="btn btn-primary btn-md button_send"
                                        value="регистрация">
                                    Регистрация
                                </button>
                            </form>
                        </div>
                        <div class="col-xl-4 col-lg-3 col-md-2 col-sm-2 col-1"></div>
                    </div>
                </main>
            </div>)
    }
}

function makeDate(d) {
    if (!d) return undefined;
    let date = d.split('.');
    return new Date(date[2] + '-' + date[1] + '-' + date[0])
}

export default withRouter(UserRegistrationPage)