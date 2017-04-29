import React from 'react'
import Modal from 'react-modal'

export default (props) => (
  <div className={`licencias-${props.id}`}>
    <span className="glyphicon glyphicon-minus text-success"></span>
    <input type='text' defaultValue={props.codigo} />
    <input type='text' defaultValue={props.cantidad} />
  </div>
)