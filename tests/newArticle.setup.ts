import { test as setup, expect } from '@playwright/test';

setup('Create New Article', async({request}) => {    
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article":{"title":"Likes test article","description":"This is a test desciption","body":"This is a test body","tagList":[]}
        },
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
})