import React from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { saveConfiguracion } from '../actions/configuracion'


const Configuracion = (props) => {
  const handleSave = () => {
    const email = document.getElementById('email').value,
      smtp = document.getElementById('smtp').value,
      password = document.getElementById('password').value
    props.save({ email, smtp, password })

  }

  return (<Modal isOpen={props.configuracion.isOpen} contentLabel="Modal">
    <h1>
      <div style={{ float: 'right' }} className="row">
        <button className="btn btn-warning" onClick={props.toggleConf}>Cancel </button>
        <button className="btn btn-success" onClick={handleSave}> Guardar </button>
      </div>
    </h1>
    <form className="form-inline">
      <div className="form-group">
        <label htmlFor="email">EMAIL</label>
        <input id="email" type="email" className="form-control" defaultValue={props.configuracion.email} />
      </div>
      <div className="form-group">
        <label htmlFor="smtp">SMTP</label>
        <input id="smtp" type="text" className="form-control" defaultValue={props.configuracion.smtp} />
      </div>
      <div className="form-group">
        <label htmlFor="password">PASSWORD</label>
        <input id="password" type="password" className="form-control" defaultValue={props.configuracion.password} />
      </div>
    </form>
  </Modal >)

}

const mapStateToProps = state => ({
  configuracion: state.configuracion
})

const mapDispatchToProps = {
  save: saveConfiguracion
}

export default connect(mapStateToProps, mapDispatchToProps)(Configuracion)