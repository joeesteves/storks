import React from 'react'
import ReactDOM from 'react-dom'
import { store } from './store'
import { Provider } from 'react-redux'
import ProductosContainer from './src/containers/productosContainer'
import '../node_modules/bootstrap/dist/css/bootstrap.css'


ReactDOM.render(
  <Provider store={store}>
    <ProductosContainer />
  </Provider>,
  document.getElementById('root')
)