import { test as setup } from '@playwright/test';
import user from '../.auth/user.json'
import fs from 'fs'

const authFile = '.auth/user.json'

setup('Authentication', async({request}) => {
    // await page.goto('https://conduit.bondaracademy.com/')
    // await page.getByText('Sign In').click()
    // await page.getByRole('textbox', {name: "Email"}).fill("pwtest728")
    // await page.getByRole('textbox', {name: "Password"}).fill("pwtest")
    // await page.getByRole('button').click()
    // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    // console.log(page.context())
    // await page.context().storageState({path: authFile})

    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user": {"email":"pwtest728", "password":"pwtest"}
        }
      })
      // capture response body -> token for login
      const responseBody = await response.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value = accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      // save the value into process environment variable, reuse it all tests
      process.env['ACCESS_TOKEN'] = accessToken
})