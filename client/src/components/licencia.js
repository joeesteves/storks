import React from 'react'
import Modal from 'react-modal'

export default (props) => {
  const handleOnMinus = () => {
    props.onMinus()
  }
  return (
    <form className="form-inline">
      <div className={`licencias-${props.id}`}>
        <span className="glyphicon glyphicon-minus text-danger col-md-2" onClick={handleOnMinus}></span>
        <input type='text' className="form-control col-md-3" defaultValue={props.codigo} placeholder="indique código" />
        <input type='text' className="form-control col-md-3" defaultValue={props.cantidad} />
        <input type='text' className="form-control col-md-3" defaultValue={props.downloadLink} />
    </div>
    </form>
  )
}