(() => {
    const width = 320; 
    let height = 0;
    let streaming = false;
    let video = null;
    let canvas = null;
    let photo = null;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video.addEventListener('canplay', () => {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        document.getElementById("save").addEventListener("click", save)

        function save() {
            takepicture();
            sendData(canvas.toDataURL('image/png'), true);
        }

        document.getElementById("capture").addEventListener("click", capture)

        function capture() {
            takepicture();
            sendData(canvas.toDataURL('image/png', false));
        }
    }

    function takepicture() {
        const context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const data = canvas.toDataURL('image/png');
            document.querySelector("#file").setAttribute("file", data)
        }
    }

    window.addEventListener('load', startup, false);
})();

function dataURItoBlob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

function sendData(url, save) {
    var request = new XMLHttpRequest();

    // TODO: change url
    request.open("POST", "http://localhost:5001", true);
    request.addEventListener("load", reqListener);

    var formData = new FormData();
    var dataURI = url;
    var imageData = dataURItoBlob(dataURI);

    formData.append("file", imageData, "photo.png");

    if (save) {
        formData.append("name", document.getElementById("name").value);
    }

    request.send(formData);
}

function reqListener() {
    response_area = document.getElementById("response");
    response = JSON.parse(this.response)
    response_area.innerText = this.response;

    if (response["name"] == "unkown") {
        document.getElementById("who").style.display = "block";
    } else{
        document.getElementById("who").style.display = "none";
    }
}