import React from 'react'
import Modal from 'react-modal'
import { Maybe } from 'ramda-fantasy'
import Licencia from './licencia'

export default (props) => (
  <Modal isOpen={props.isOpen} contentLabel="Modal">
    <h1>
      {props.title}
      <div style={{ float: 'right' }} className="row">
        <button className="btn btn-warning" onClick={props.toggleEdit} >Cancel </button>
        <button className="btn btn-success"> Guardar </button>
      </div>
      <div className="row">
        <span className="glyphicon glyphicon-plus text-success"></span>
        { props.licencias ? props.licencias.map((lic,i) => <Licencia key={i}/>) : '' }
      </div>
    </h1>
    <p>{props.tag}</p>

  </Modal >
)
