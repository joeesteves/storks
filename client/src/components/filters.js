import React from 'react'
import { connect } from 'react-redux'
import { updateSearchFilter, updateSelectFilter } from '../actions/filters'
import Rx from 'rxjs'

class Filters extends React.Component {
  componentDidMount() {
    Rx.Observable.fromEvent(document.getElementById('searchText'), 'keyup')
      .debounce(() => Rx.Observable.timer(200))
      .subscribe(this.handleOnSearch.bind(this))
    Rx.Observable.fromEvent(document.getElementById('selectOrigen'), 'change')
      .subscribe(this.handleOnSelectOrigen.bind(this))
  }

  handleOnSearch(se) {
    this.props.onSearch(se.target.value)
  }

  handleOnSelectOrigen(se){
    this.props.onSelectOrigen(se.target.value)
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-6">
          <div style={{ zIndex: 0 }} className="input-group input-group-lg">
            <span className="input-group-addon" id="sizing-addon1">
              <span className="glyphicon glyphicon-search"></span>
            </span>
            <input id="searchText" type="text" className="form-control" placeholder="Buscar producto..." aria-describedby="sizing-addon1" />
          </div>
        </div>
        <div className="col-md-6">
          <select id="selectOrigen" className="form-control">
            <option value=""> MercadoLibre & MercadoShops </option>
            <option value="MercadoLibre"> MercadoLibre </option>
            <option value="MercadoShops"> MercadoShops </option>
          </select>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  onSearch: updateSearchFilter,
  onSelectOrigen: updateSelectFilter
}
export default connect(null, mapDispatchToProps)(Filters)