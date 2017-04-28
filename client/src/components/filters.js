import React from 'react'
import { connect } from 'react-redux'
import { updateSearchFilter } from '../actions/filters'
import Rx from 'rxjs'

class Filters extends React.Component {
  componentDidMount() {
    Rx.Observable.fromEvent(document.getElementById('searchText'), 'keyup')
      .debounce(() => Rx.Observable.timer(200))
      .subscribe(this.handleOnSearch.bind(this))
  }
  
  handleOnSearch(se) {
    this.props.onSearch(se.target.value)
  }
  
  render() {
    return (<div style={{zIndex: 0}} className="input-group input-group-lg">
      <span className="input-group-addon" id="sizing-addon1">
        <span className="glyphicon glyphicon-search"></span>
      </span>
      <input id="searchText" type="text" className="form-control" placeholder="Buscar producto..." aria-describedby="sizing-addon1" />
    </div>)
  }
}

const mapDispatchToProps = {
  onSearch: updateSearchFilter
}
export default connect(null, mapDispatchToProps)(Filters)