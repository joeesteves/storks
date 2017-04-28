import React from 'react'
import Producto from '../components/producto'
import { connect } from 'react-redux'
import { fetchProductos } from '../actions/productos'
import { updateSearchFilter } from '../actions/filters'
import { cookieParser } from '../../helpers'
import Rx from 'rxjs'

class ProductosContainter extends React.Component {
  componentDidMount() {
    fetchProductos(cookieParser(document.cookie))
    Rx.Observable.fromEvent(document.getElementById('searchText'), 'keyup')
    .debounce(() => Rx.Observable.timer(200))
    .subscribe(this.handleOnSearch.bind(this))
  }
  handleOnSearch(se){
    this.props.onSearch(se.target.value)
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
          <input id="searchText" type="text" className="form-control" placeholder="Buscar producto..." aria-describedby="sizing-addon1" />
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

const filterProductos = (productos, filters) => {
  if(filters.searchText){
    return productos.filter(producto => new RegExp(filters.searchText,"i").test(producto.title))
  }else {
    return productos
  }
}

const mapStateToProps = state => ({
  productos: filterProductos(state.productos, state.filters)
})
const mapDispatchToProps = {
  onSearch: updateSearchFilter
}


export default connect(
  mapStateToProps, mapDispatchToProps
)(ProductosContainter)