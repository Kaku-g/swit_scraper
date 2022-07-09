const puppeteer = require("puppeteer");
const prompt = require("prompt-sync")();

const fs = require("fs");

let data = {
  URL: "",
  OEM: "SWIT",
  image: "",
  productName: "",
  sku: "",
  description: "",
  price: "",
  mount: "",
  categories: "",
  specifications: "",
  downloads: "",
  box: "",
  warranty: "",
  features: " ",
};

const getUrl = prompt("Enter the url for the product and press enter -> ");
async function start() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(getUrl);

    //to get url of page
    const URL = await page.url();
    data.URL = URL;

    // to get image of page
    //[NOTE] - again giving null
    const image = await page.evaluate(() => {
      return document.querySelector(".H5gG5");
    });
    // console.log(image);

    //getting nae
    const name = await page.$eval("._2qrJF", (e) => e.textContent);
    data.productName = name;

    //getting sku
    const sku = await page.$eval("._1rwRc", (el) =>
      el.textContent.split(" ").pop()
    );
    data.sku = sku;

    //gettings desc
    const desc = await page.$eval(
      "._3nbVj>div>pre>p:nth-child(3)",
      (e) => e.textContent
    );
    data.description = desc;

    //getting catehories

    const cat = await page.$eval("div.EU1kn>div", (e) =>
      e.innerText.split("/")
    );

    data.categories = cat;

    //gettings features (only 5 from given list)
    for (let i = 6; i < 10; i++) {
      const features = await page.$eval(
        `._3nbVj>div>pre>p:nth-child(${i})`,
        (e) => e.textContent.split("◆")
      );
      if (features) {
        data.features += features;
      }
    }

    // if features is not present in left side look in right side(other class)

    if (!data.features) {
      const features = await page.$$eval(
        "._2knBS:nth-child(1)>div>div>div>div",
        (e) => {
          e.textContent;
        }
      );
      data.features = features;
    }
    //console.log(data);

    //to get price
    const price = await page.$eval("._26qxh>span", (e) => e.textContent);
    data.price = price;

    // to get specifications
    const res = await page.$$eval(".WncCi>table", (e) => {
      let k = [];
      e.forEach((el) => {
        const length = el.querySelectorAll("tbody>tr").length;

        for (let i = 0; i < length; i++) {
          k.push({
            specName: el
              .querySelectorAll("tbody>tr")
              [i].querySelectorAll("td")[0].innerText,
            specDetails: el
              .querySelectorAll("tbody>tr")
              [i].querySelectorAll("td")[1].innerText,
          });
        }
      });
      return k;
    });
    data.specifications = res;

    //to get about box
    const Box = await page.$$eval(
      "._1V4Ij>li:nth-child(2)> div > div > div > div >p",
      (e) => {
        let box = [];

        e.forEach((el) => {
          box.push(el.textContent.split("\n"));
        });
        return box;
      }
    );
    data.box = Box;
    console.log(Box);

    //to get warranty
    const warranty = await page.$eval(
      "._2knBS:nth-child(3)> div > div > div > div ",
      (e) => {
        return e.textContent.split("\n")[0];
      }
    );
    data.warranty = warranty;

    //to get downloads
    const downloads = await page.$eval(
      "._2knBS:nth-child(4)> div > div > div > div ",
      (e) => {
        let d = { downloads: "" };
        let length = e.querySelectorAll("p").length;
        for (let i = 0; i < length; i++) {
          d.downloads = e.querySelectorAll("p")[i].textContent;
        }

        return d;
      }
    );
    data.downloads = downloads;

    console.log(data);

    //convert to json format
    var jsonContent = JSON.stringify(data);

    //saving in output.json file
    fs.writeFile("output.json", jsonContent, "utf8", function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });

    /*
   //////////////// [NOTE]//////////////////

   failing to get image even though the image is there in DOM.
   Also pupeteer is giving many errors similar to this on finding element in Dom although they are present!!

    const img = await page.$eval('[data-hook="product-image"]', (e) => e);
    console.log(img);
    */

    //closing the browser
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

start();
