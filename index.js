require("dotenv").config();
const incbg = require("./helpers/inacbg");

const data = JSON.stringify({
    metadata: "test",
    claim: 123
});

(async () => {
    const result = await incbg.Request(data);
    console.log(result);
})();
