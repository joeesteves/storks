import { createStore } from 'redux'
import reducer from './src/reducers'

export const store =  createStore(reducer)