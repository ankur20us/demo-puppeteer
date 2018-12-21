const puppeteer = require("puppeteer");
const hbs = require("handlebars");
const fs = require("fs-extra");
const path = require("path");

/***
 * Compiles the template with values we provide
 */
const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), templateName);
    const template = await fs.readFile(filePath, "utf-8");
    return hbs.compile(template)(data);
}

const generatePDFByteArray = async ({
    templateName = "./template.hbs",
    data
}) => {
    try {
        /***
         * Got the end html string, after compiling the template with the 'data', 
         * since template is using a variable named 'message', 
         * we passed the 'data' with key named 'message' at line 56; 
         */
        const content = await compile(templateName, data);

        /***
         * Launched the headless chrome in memory.
         */
        const browser = await puppeteer.launch();

        /***
         * Created a new page(tab)
         */
        const page = await browser.newPage();

        /***
         * Set the content of the new page
         */
        await page.setContent(content);
        /***
         * Telling chrome to emulate screen i.e how the page looks if it would have been rendered in the normal browser.
         */
        await page.emulateMedia('screen');
        /***
         * This is needed since in case your template is loading any font from internet
         * this makes sure that the call will be waiting before it actually starts 
         * preparing the pdf capturing.
         */
        await page.goto('data:text/html,' + content, {
            waitUntil: 'networkidle0'
        });
        /***
         * We created the snapshot of the page and took the byte array
         */
        const byteArray = await page.pdf({
            format: "A4",
            landscape: true,
            scale: 1.29,
            printBackground: true
        });

        const buffer = Buffer.from(byteArray, 'binary');
        /**
         * We don't need the acknowledgement of this call that is the reason we are not waiting for this call to return.
         */
        browser.close();

        return buffer;
    } catch (e) {
        console.log('gg', e)
    }
};

(async () => {
    /***
     * The value being passed to the template for handlebar to compile the template and give the html string.
     */
    let data = { message: "This is a test message" };
    let fileName = 'temp.pdf';

    let buffer = await generatePDFByteArray({ data });
    console.log('got the byte buffer');

    console.log('Opening file and writing the buffer to it');
    let handle = await fs.open(fileName, 'w');
    await fs.write(handle, buffer, 0, buffer.length);
    await fs.close(handle);
    console.log('writing done');

    console.log('Please check the ', fileName);
})();

