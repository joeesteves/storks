import React from 'react'
import Modal from 'react-modal'

export default (props) => (
  <Modal isOpen={props.isOpen} contentLabel="Modal">
    <h1>
      {props.title}
      <div style={{float: 'right'}}>
        <button className="btn btn-warning" onClick={props.toggleEdit} >Cancel </button>
        <button className="btn btn-success"> Guardar </button>
      </div>
    </h1>
    <p>{props.detalle}</p>

  </Modal>
)
