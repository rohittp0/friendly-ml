let neuralNetwork;

function createModel()
{
    const nnOptions = {
        task: "regression",
        activationHidden: "sigmoid",
        activationOutput: "sigmoid",
        debug: true,
        learningRate: 0.1,
        noVal: null,
        hiddenUnits: 1,
        modelMetrics: ["accuracy"],
        modelLoss: "meanSquaredError",
        modelOptimizer: "adam"
    };
    // @ts-ignore
    neuralNetwork = ml5.neuralNetwork(nnOptions);
    modelReady();
}

/**
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

async function modelReady()
{
    console.log("Model ready");

    const data = await getData("data.csv");

    console.log(data);

    data.forEach(({ gender, ssc_percent, ssc_board, hsc_percent, hsc_stream, hsc_board, degree_percent, degree_stream, work_experience, salary }) =>
        neuralNetwork.addData({ gender, ssc_percent, ssc_board, hsc_percent, hsc_stream, hsc_board, degree_percent, degree_stream, work_experience }, { salary }));

    console.log("Data Added");

    neuralNetwork.normalizeData();
    neuralNetwork.train({ batchSize: 16, epochs: 47 },console.log,finishedTraining);
}

function finishedTraining(error) 
{
    console.log("done!");
    document.getElementById("predict_button").disabled = false;
    document.getElementById("save").disabled = false;
}

function getResult(event)
{
    event.preventDefault();
    // gender,ssc_percent,ssc_board,hsc_percent,hsc_stream,hsc_board,degree_percent,degree_stream,work_experience
    const gender = Number(document.getElementById("gender").value);
    const ssc_percent = Number(document.getElementById("ssc_percent").value);
    const ssc_board = Number(document.getElementById("ssc_board").value);
    const hsc_board = Number(document.getElementById("hsc_board").value);
    const hsc_percent = Number(document.getElementById("hsc_percent").value);
    const hsc_stream = Number(document.getElementById("hsc_stream").value);
    const degree_percent = Number(document.getElementById("degree_percent").value);
    const degree_stream = Number(document.getElementById("degree_stream").value);
    const work_experience = document.getElementById("work_experience").value ? 1 : 0;

    const inputs = { gender, ssc_percent, ssc_board, hsc_board, hsc_percent, hsc_stream, degree_percent, degree_stream, work_experience };

    console.log(inputs);
    neuralNetwork.predict(inputs, gotResults);

    return false;
}

function gotResults(err, results)
{
    if (err)
        console.error(err);
    else
    {
        console.log(results);
        document.getElementById("salary").innerText = results[0].value;
    }
}

function saveModel() 
{
    neuralNetwork.save();
}

async function loadModel() 
{
    neuralNetwork = ml5.neuralNetwork({});
    neuralNetwork.load("models/model.json");

    finishedTraining();
}

document.getElementById("form").addEventListener("submit", getResult);