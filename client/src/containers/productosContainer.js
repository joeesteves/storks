import React from 'react'
import { connect } from 'react-redux'
import { store } from '../../store'
// Components
import Producto from '../components/producto'
import Filters from '../components/filters'
// Actions & Helpers
import { fetchProductos, toggleEditProducto, turnOffEditProducto } from '../actions/productos'
import { cookieParser } from '../../helpers'

class ProductosContainter extends React.Component {
  componentDidMount() {
    fetchProductos(cookieParser(document.cookie))
    document.addEventListener('keydown' ,(ev) => ev.keyCode === 27 ? store.dispatch(turnOffEditProducto()) : undefined )
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
        <Filters />
        <table className="table">
          <tbody>
            {this.props.productos.map(p => (
              <Producto key={p.id} id={p.id} {...p} toggleEdit={this.props.toggleEdit} />
              ))}
          </tbody>
        </table>
      </div>
    )
  }
}

const filterProductos = (productos, filters) => {
  if (filters.searchText) {
    return productos.filter(producto => new RegExp(filters.searchText, "i").test(producto.title))
  } else {
    return productos
  }
}

const mapStateToProps = state => ({
  productos: filterProductos(state.productos, state.filters)
})

const mapDispatchToProps = {
  toggleEdit: toggleEditProducto
}

export default connect(
  mapStateToProps, mapDispatchToProps
)(ProductosContainter)