import React from 'react'
import { connect } from 'react-redux'
import { store } from '../../store'
// Components
import Producto from '../components/producto'
import Filters from '../components/filters'
import Configuracion from '../components/configuracion'
// Actions & Helpers
import { fetchProductos, toggleEditProducto, turnOffEditProducto } from '../actions/productos'
import { fetchConfiguracion } from '../actions/configuracion'
import { toggleEditConfiguracion } from '../actions/configuracion'
import { cookieParser } from '../../helpers'
import { Maybe } from 'ramda-fantasy'

class ProductosContainter extends React.Component {
  componentDidMount() {
    fetchProductos(cookieParser(document.cookie))
    fetchConfiguracion()
    // Esc Cierra los modals
    document.addEventListener('keydown', (ev) => ev.keyCode === 27 ? store.dispatch(turnOffEditProducto()) : undefined)
  }


  render() {
    return (
      <div className="panel panel-info">
        <div className="panel-heading row">
          <div className="col-md-6">
            <h1>PremiumFD Envíos Automaticos</h1>
            <p>Cantidad de productos mostrados: {this.props.productos.length}</p>
          </div>
          <div className="col-md-6">

            <h1 style={{ float: 'right' }}><span className="glyphicon glyphicon-th-large" onClick={this.props.toggleConf}></span></h1>
          </div>
        </div>
        <div className="panel-body">
          <Configuracion toggleConf={this.props.toggleConf} />
        </div>
        <Filters />
        <table className="table">
          <tbody>
            {this.props.productos.map(p => (
              <Producto key={p.id} id={p.id} {...p} toggleEdit={this.props.toggleEdit} />
            ))}
          </tbody>
        </table>
      </div >
    )
  }
}

const filterProductos = (productos, filters) => {
  if (filters.length === 0) return productos
  return filterProductos(Maybe(filters[0].value)
    .map(value => productos.filter(producto => new RegExp(value, "i").test(producto[filters[0].key])))
    .getOrElse(productos), filters.slice(1))
}

const mapStateToProps = state => ({
  productos: filterProductos(state.productos, state.filters)
})

const mapDispatchToProps = {
  toggleEdit: toggleEditProducto,
  toggleConf: toggleEditConfiguracion
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(ProductosContainter)