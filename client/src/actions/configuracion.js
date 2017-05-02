import { configuracionAct } from '../constants/actionTypes'
import { store } from '../../store'

export const toggleEditConfiguracion = () => ({
  type: configuracionAct.edit
})

export const saveConfiguracion = (configuracion) => {
  fetch('../configuracion', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(configuracion)
  }).then(() => console.log("CONFIGURACION GUARDADA"))

  return {
    type: configuracionAct.save,
    configuracion
  }
}
export const fetchConfiguracion = () => {
  fetch('../configuracion')
    .then(res => res.json())
    .then(conf => store.dispatch(populateConfiguracion(conf)))
}

export const populateConfiguracion = (configuracion) => (
  {
    type: configuracionAct.populate,
    configuracion
  }
)
