import { cookieParser } from '../client/helpers'

describe("cookieParser", () => {
  it("creates an object from cookie string", () => {
    console.log(cookieParser("token=prueba1234; nombre=prueba"))

  })
})