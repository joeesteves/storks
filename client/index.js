import React from 'react'
import ReactDOM from 'react-dom'
// import request from 'request'
import { cookieParser } from './helpers'

class ProductsContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {
    // request.
  }
  render() {
    return (
      <h1>{cookieParser(document.cookie).access_token}</h1>
    )
  }
}

ReactDOM.render(
  <ProductsContainer nombre="joseph" />,
  document.getElementById('root')
)