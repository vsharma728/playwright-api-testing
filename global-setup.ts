import { request, expect } from "@playwright/test"
import user from '../pw-apitest-app/.auth/user.json'
import fs from 'fs'

async function globalSetup(){

    console.log("Entering Global Setup")
    const authFile = '.auth/user.json'
    const context = await request.newContext()

    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user": {"email":"pwtest728", "password":"pwtest"}
        }
      })
      // capture response body -> token for login
      const responseBody = await responseToken.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value = accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      // save the value into process environment variable, reuse it all tests
      process.env['ACCESS_TOKEN'] = accessToken

    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article":{"title":"Global Likes test article","description":"This is a test desciption","body":"This is a test body","tagList":[]}
        },
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
    console.log("SlugId: " + process.env.SLUGID)
    console.log("Exiting Global Setup")
}

export default globalSetup;