/**
 * A utility function to read csv as json.
 *
 * @param {string} csvPath
 */
async function getData(csvPath) 
{
    const allText = await fetch(csvPath).then(res => res.text());
    const lines = allText.split(/\n\r|\n|\r/).filter((d) => d !== "");

    const headers = lines.shift().split(",");
    const json = [];

    for (const line of lines) 
    {
        const items = line.split(",");
        const row = {};

        for (const header of headers)
            row[header] = Number(items[headers.indexOf(header)]);

        json.push(row);
    }

    return json;
}