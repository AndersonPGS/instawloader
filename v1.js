app.post('/perfil', urlencodedParser, async function(req, res) {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${req.body.username}`);
    let postsCount = await page.evaluate(() => {
        return document.querySelectorAll('header > section > ul > li span')[0].textContent.replace(/\,/g, '');
    });

    let ImagesSrc = await page.evaluate(() => { 
        let src = [];
        images = window.document.querySelectorAll('.v1Nh3 img');
        images.forEach(image => {
            src.push(image.getAttribute('src'))
        });
        return src;
    });
    
    res.render('perfil', {data: req.body, imgs: ImagesSrc});
});