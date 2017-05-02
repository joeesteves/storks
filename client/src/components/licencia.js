import React from 'react'
import Modal from 'react-modal'

export default (props) => {
  const handleOnMinus = () => {
    props.onMinus()
  }
  return (
    <tr className={`licencias-${props.id}`}>
      <td>
        <span className="glyphicon glyphicon-minus text-danger" onClick={handleOnMinus}></span>
      </td>
      <td className="col-md-3">
        <input type='text' className="form-control" defaultValue={props.codigo} placeholder="indique código" />
      </td>
      <td className="col-md-2">
        <input type='text' className="form-control" defaultValue={props.cantidad} />
      </td>
      <td className="col-md-6">
        <input type='text' className="form-control" defaultValue={props.downloadLink} />
      </td>
    </tr> 
  )
}