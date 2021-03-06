const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended:false });
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/perfil', urlencodedParser, async function(req, res) {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${req.body.username}`);
    
    
    // check username exists or not exists
    let isUsernameNotFound = await page.evaluate(() => {
        // check selector exists
        if(document.getElementsByTagName('h2')[0]) {
            // check selector text content
            if(document.getElementsByTagName('h2')[0].textContent == "Sorry, this page isn't available.") {
                return true;
            }
        }
    });

    if(isUsernameNotFound) {
        console.log('Account not exists!');

        // close browser
        await browser.close();
        return;
    }

    // get username
    let username = await page.evaluate(() => {
        return document.querySelectorAll('header > section h1')[0].textContent;
    });

    // check the account is verified or not
    let isVerifiedAccount = await page.evaluate(() => {
        // check selector exists
        if(document.getElementsByClassName('coreSpriteVerifiedBadge')[0]) {
            return true;
        } else {
            return false;
        }
    });

    // get username picture URL
    let usernamePictureUrl = await page.evaluate(() => {
        return document.querySelectorAll('header img')[0].getAttribute('src');
    });

    // get number of total posts
    let postsCount = await page.evaluate(() => {
        return document.querySelectorAll('header > section > ul > li span')[0].textContent.replace(/\,/g, '');
    });

    // get number of total followers
    let followersCount = await page.evaluate(() => {
        return document.querySelectorAll('header > section > ul > li span')[1].getAttribute('title').replace(/\,/g, '');
    });

    // get number of total followings
    let followingsCount = await page.evaluate(() => {
        return document.querySelectorAll('header > section > ul > li span')[2].textContent.replace(/\,/g, '');
    });

    // get bio name
    let name = await page.evaluate(() => {
        // check selector exists
        if(document.querySelectorAll('header > section h1')[1]) {
            return document.querySelectorAll('header > section h1')[1].textContent;
        } else {
            return '';
        }
    });

    // get bio description
    let bio = await page.evaluate(() => {
        if(document.querySelector('#react-root > section > main > div > header > section > div.-vDIg > span')) {
            return document.querySelector('#react-root > section > main > div > header > section > div.-vDIg > span').textContent;
        } else {
            return '';
        }
    });

    // get bio URL
    let bioUrl = await page.evaluate(() => {
        // check selector exists
        if(document.querySelectorAll('header > section div > a')[1]) {
            return document.querySelectorAll('header > section div > a')[1].getAttribute('href');
        } else {
            return '';
        }
    });

    // get bio display
    let bioUrlDisplay = await page.evaluate(() => {
        // check selector exists
        if(document.querySelectorAll('header > section div > a')[1]) {
            return document.querySelectorAll('header > section div > a')[1].textContent;
        } else {
            return '';
        }
    });

    // check if account is private or not
    let isPrivateAccount = await page.evaluate(() => {
        // check selector exists
        if(document.getElementsByTagName('h2')[0]) {
            // check selector text content
            if(document.getElementsByTagName('h2')[0].textContent == 'This Account is Private') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });

    // get recent posts (array of url and photo)
    let recentPosts = await page.evaluate(() => {
        let results = [];

        // loop on recent posts selector
        document.querySelectorAll('div[style*="flex-direction"] div > a').forEach((el) => {
            // init the post object (for recent posts)
            let post = {};

            // fill the post object with URL and photo data
            post.url = 'https://www.instagram.com' + el.getAttribute('href');
            post.photo = el.querySelector('img').getAttribute('src');

            // add the object to results array (by push operation)
            results.push(post);
        });

        // recentPosts will contains data from results
        return results;
    });

    info = {'username': username,
                 'is_verified_account': isVerifiedAccount,
                 'username_picture_url': usernamePictureUrl,
                 'posts_count': postsCount,
                 'followers_count': followersCount,
                 'followings_count': followingsCount,
                 'name': name,
                 'bio': bio,
                 'bio_url': bioUrl,
                 'bio_url_display': bioUrlDisplay,
                 'is_private_account': isPrivateAccount,
                 'recent_posts': recentPosts};

    // close the browser


    res.render('perfil', info);
});

app.get('/perfil', (req, res) => {
    res.render('index');
});


app.listen(3000, () => {
    console.log('Server aberto');
});