import React from 'react'
import Modal from 'react-modal'
import { Maybe } from 'ramda-fantasy'
import Licencia from './licencia'
import { connect } from 'react-redux'
import { updateLicencias, addLicencia, removeLicencia } from '../actions/productos'

const EditarProducto = (props) => {

  const handleSubmit = () => {
    props.onSubmit(props.id, parseLicencias(document.getElementsByClassName(`licencias-${props.id}`)))
    props.toggleEdit()
  }
  const handleOnPlus = () => {
    props.onPlus(props.id)
  }

  const parseLicencias = (nodes) => {
    let ary = []
    for (let node of nodes) {
      //children 1 es codigo y children 2 es cantidad..
      ary.push({ codigo: node.children[1].value, cantidad: node.children[2].value, downloadLink: node.children[3].value })
    }
    return ary
  }

  return (<Modal isOpen={props.isOpen} contentLabel="Modal">
    <h1>
      {props.title}
      <div style={{ float: 'right' }} className="row">
        <button className="btn btn-warning" onClick={props.toggleEdit} >Cancel </button>
        <button className="btn btn-success" onClick={handleSubmit}> Guardar </button>
      </div>
      <div className="row">
        <div className="col-md-12">
          <span className="glyphicon glyphicon-plus text-success" onClick={handleOnPlus}></span>
        </div>
        <div className="col-md-12">
          {props.licencias ? props.licencias.map((lic, i) => <Licencia key={i} id={props.id} { ...lic } onMinus={props.onMinus.bind(this, props.id, i)} />) : ''}
        </div>

      </div>
    </h1>
    <p></p>

  </Modal >)
}

const mapDispatchToProps = {
  onSubmit: updateLicencias,
  onPlus: addLicencia,
  onMinus: removeLicencia
}

export default connect(null, mapDispatchToProps)(EditarProducto)