const puppeteer = require('puppeteer');
const fs = require('fs');

const url = process.argv[2];

async function main() {

    const data = {
        reviews: [],
        properties: [],
        images: [],
        url
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');
    await page.goto(url);

    const imageTagWrapperElement = await page.$('#imageBlock .imgTagWrapper img');
    const imageSrc = await imageTagWrapperElement.evaluate(el => el.getAttribute('src'));
    data.images.push(imageSrc);

    const prodTableDetailsSection1Rows = await page.$$('#prodDetails #productDetails_techSpec_section_1 tr');
    for (const prodTableDetailsSection1Row of prodTableDetailsSection1Rows) {

        const rowEntryElement = await prodTableDetailsSection1Row.$('th');
        const rowEntryText = await rowEntryElement.evaluate(el => el.textContent);

        const rowValueElement = await prodTableDetailsSection1Row.$('td');
        const rowValueText = await rowValueElement.evaluate(el => el.textContent);

        data.properties.push({
            entry: rowEntryText.trim(),
            value: rowValueText.trim()
        });
    }

    const reviews = await page.$$('#cm-cr-dp-review-list .review');
    for (const review of reviews) {

        const ratingElement = await review.$('.review-rating span');
        const ratingText = await ratingElement.evaluate(el => el.textContent);

        const dateElement = await review.$('.review-date')
        const dateText = await dateElement.evaluate(el => el.textContent);

        const titleElement = await review.$('.review-title span:not(.a-letter-space):not(.a-icon-alt)')
        const titleText = await titleElement.evaluate(el => el.textContent);

        const textElement = await review.$('.review-text-content span')
        const textText = await textElement.evaluate(el => el.textContent);

        data.reviews.push({
            title: titleText.trim(),
            rating: ratingText.trim(),
            text: textText.trim(),
            date: dateText.trim()
        });
    }
    await browser.close();

    /**
     * TODO: Transform and sanitize information here...
     */

    fs.writeFile('output/data.json', JSON.stringify(data, null, 2), (error) => {
        if (error) {
            throw error;
        }
    });
}

main();
