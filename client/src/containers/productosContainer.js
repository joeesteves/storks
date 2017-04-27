import React from 'react'
import Producto from '../components/producto'
import { connect } from 'react-redux'
import { fetch_productos } from '../actions/productos'
import { cookieParser } from '../../helpers'

class ProductosContainter extends React.Component {
  componentDidMount() {
    fetch_productos(cookieParser(document.cookie))
  }
  render() {
    return (
      <div className="panel panel-info">
        <div className="panel-heading">
          <h1> MIS PRODUCTOS </h1>
        </div>
        <div className="panel-body">
          <h3> Descripción de la pantalla </h3>
        </div>
        <div className="input-group input-group-lg">
          <span className="input-group-addon" id="sizing-addon1">
            <span className="glyphicon glyphicon-search"></span>
          </span>
          <input type="text" className="form-control" placeholder="Buscar producto..." aria-describedby="sizing-addon1" />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {this.props.productos.map(producto => <Producto key={producto.id} nombre={producto.title} />)}
          </tbody>
        </table>
      </div>
    )
  }
}


const mapStateToProps = state => ({
  productos: state.productos
})

export default connect(
  mapStateToProps, null
)(ProductosContainter)