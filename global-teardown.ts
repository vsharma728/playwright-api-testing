import { request, expect } from "@playwright/test"


async function globalTeardown() {
    console.log("Entering Teardown Setup")
    const context = await request.newContext()
    const deleteArticleResponse = await context.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`, {
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(deleteArticleResponse.status()).toEqual(204)
    console.log("Exiting Teardown Setup")
}

export default globalTeardown;