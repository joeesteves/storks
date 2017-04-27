import React from 'react'
import ReactDOM from 'react-dom'
import { cookieParser, fromPromise, fetch2JSON } from './helpers'
import Rx from 'rxjs/Rx'


const access_token = cookieParser(document.cookie).access_token

class ProductsContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      myProducts: []
    }
  }

  componentWillMount() {
    fetch2JSON(`https://api.mercadolibre.com/users/254307406/items/search?access_token=${access_token}`)
      .flatMap(res => res.results)
      .flatMap(res => this.getProduct(res))
      .subscribe(producto => this.setState({ myProducts: [...this.state.myProducts, producto.title] }))
  }

  getProduct(id) {
    return fetch2JSON(`https://api.mercadolibre.com/items/${id}`)
  }

  render() {
    return (
      <div>
        <h1>{access_token}</h1>
        <ul>
          {this.state.myProducts.map(product => <li key={product}>{product}</li>)}
        </ul>
      </div>
    )
  }
}

ReactDOM.render(
  <ProductsContainer />,
  document.getElementById('root')
)