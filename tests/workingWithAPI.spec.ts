import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import exp from 'constants';
import { request } from 'http';

test.beforeEach(async ({page}) => {
  // in order to mock an api call, intercept call use 'page.route'
  // to mock data, create and add test data as tags.json
  // to use this test-data, use 'route.fulfill'
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  // Access application url and login from saved auth state
  await page.goto('https://conduit.bondaracademy.com/')
})


test('Verify Page Title, Arcticle Title and Decription', async ({ page }) => {

    // Three Steps to MOCK an API Call
    // 1. intercept the desired call
  await page.route('*/**/api/articles*', async route => {    
    // complete the api call and get response using route.fetch
    const response = await route.fetch()
    const responseBody = await response.json()
    // 2. update the response with our test data
    responseBody.articles[0].title = 'This is a MOCK test title'
    responseBody.articles[0].description = 'This is a MOCK description'

    // 3. mock the response by fulfilling above modified response as deired response to the application 
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  // refresh the page to reflect our above desired data in global feed and assert
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description')
});

// add request fixture so that we can perform request operation to create an article using post operation
test('Login, Create via API and Delete Article via UI', async({page, request}) => {
  // In playwright, request body/payload is called as 'data'
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     "user": {"email":"pwtest728", "password":"pwtest"}
  //   }
  // })
  // capture response body -> token for login
  // const responseBody = await response.json()
  // const accessToken = responseBody.user.token
  // console.log(accessToken)

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"This is a test title","description":"This is a test desciption","body":"This is a test body","tagList":[]}
    },
    // headers: {
    //   Authorization: `Token ${accessToken}`
    // }
  })
  // assert new article was created successfully
  expect(articleResponse.status()).toEqual(201)

  // navigate to new article and perform deletion
  await page.getByText('Global Feed').click()
  await page.getByText('This is a test title').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a MOCK test title')

})

test('Create and Delete Article via API', async({page, request}) => {
  // create article via UI
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: "Article Title"}).fill('Playwright is Awesome')
  await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the Playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('We like to use playwright for automation')
  await page.getByRole('button', {name: "Publish Article"}).click()

  // wait for the response operation to complete and verify article creation via API
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug
  await expect(page.locator('.article-page h1')).toContainText('Playwright is Awesome')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is Awesome')

  // in order make new api request to delete, we need access token
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     "user": {"email":"pwtest728", "password":"pwtest"}
  //   }
  // })
  // // capture response body -> token for login
  // const responseBody = await response.json()
  // const accessToken = responseBody.user.token

  // delete new article via API using the above access token 
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {    
    // headers: {
    //   Authorization: `Token ${accessToken}`
    // }
  })

  // assert new article was deleted successfully
  expect(deleteArticleResponse.status()).toEqual(204)

})
