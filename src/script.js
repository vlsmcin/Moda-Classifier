const URL = "../model/";

let model, webcam, labelContainer, maxPredictions;
let category;
let img = null
// window.onload = init

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    // const flip = true; // whether to flip the webcam
    // webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    // await webcam.setup(); // request access to the webcam
    // await webcam.play();

    // append elements to the DOM
    //document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    await predict();
    await searchImages();
}

async function loop() {
    // webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function loadImage() {
    const image = document.getElementById("clotheimage")
    const canvas = document.getElementById("meuCanvas")
    const ctx = canvas.getContext("2d");

    const file = image.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload  = function(e) {
            img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;
                const x = (canvas.width - newWidth) / 2;
                const y = (canvas.height - newHeight) / 2;
                ctx.drawImage(img, x, y, newWidth, newHeight);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    else {
        img = null;
    }
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    
    if (img != null) {    
        const prediction = await model.predict(img);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }

        const sorted = prediction.sort((a, b) => b.probability - a.probability);
        category = sorted[0];
    }
}

async function searchImages() {
    const url = `http://localhost:3000/scrape?query=${encodeURIComponent(category["className"])}`;

    const res = await fetch(url);
    const products = await res.json();

    const container = document.getElementById('products')
    container.innerHTML = '';
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${prod.image}" width="150"><br>
          <strong>${prod.name}</strong><br>
          ${prod.price}<br>
          <a href="${prod.link}" target="_blank">Ver produto</a>
        `;
        container.appendChild(card);
    })
}