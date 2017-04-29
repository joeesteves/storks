import React from 'react'
import Modal from 'react-modal'

export default (props) => {
  const handleOnMinus = () => {
    props.onMinus()
  }
  return (
    <div className={`licencias-${props.id}`}>
      <span className="glyphicon glyphicon-minus text-danger" onClick={handleOnMinus}></span>
      <input type='text' defaultValue={props.codigo} placeholder="indique código" />
      <input type='text' defaultValue={props.cantidad} />
    </div>
  )
}