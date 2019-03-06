// ************** Drag and drop js ************** //
let dropArea = document.getElementById("drop-area");
let theme = "dark";

let uploadProgress = [];
let progressBar = document.getElementById('progress-bar');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

// prevent default behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// highlight the gallery
function highlight(e) {
    dropArea.classList.add('highlight');
}

// remove highlight from the gallery
function unhighlight(e) {
    dropArea.classList.remove('active');
}

// handel drop event
function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    handleFiles(files);
}

// initialize progress bar
function initializeProgress(numFiles) {
    progressBar.value = 0;
    uploadProgress = [];

    for (let i = numFiles; i > 0; i--) {
        uploadProgress.push(0);
    }
}

// update progress bar
function updateProgress(fileNumber, percent) {
    uploadProgress[fileNumber] = percent;
    let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length;
    console.debug('update', fileNumber, percent, total);
    progressBar.value = total;
}

// handle the files uploaded to the gallery section
function handleFiles(files) {
    files = [...files];
    initializeProgress(files.length);

    files.forEach(previewFile);
}

// add image thumbnail to gallery
function previewFile(file, i) {
    switch (file.name.split('.')[1].toLowerCase()) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            break;
        default:
            return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function() {
        let tag = document.createElement("a");
        tag.setAttribute("id", getImageCount());
        tag.innerHTML = '<div> ' +
            '<span class="close" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;">x</span>' +
            '<img  onclick="addFragment(\'' + reader.result + '\', \'' + file.name + '\', \'' + bytesToSize(file.size) + '\' );" src ="' + reader.result + '"/>' +
            '</div>';
        document.getElementById('gallery').appendChild(tag);
        updateProgress(i, 100);
    }
}

// add preview fragment
function addFragment(file, name, size) {
    let frag = '<div class="fragment"><div id="content"> ' +
        '<span class="close" onclick="this.parentNode.parentNode.parentNode.innerHTML=\'\'; return false;">x</span>' +
        '<img id="pre" src ="' + file + '" alt="some description" height="150px" width="150px"/> ' +
        '<h2>Image Details</h2>' +
        '<h3>Filename: ' + name + '</h3>' +
        '<h4>File Size: ' + size + '</h4>' +
        '<button type="button" class="button" onclick="fullSize(\'' + file + '\');"> Full Size Preview </button>&nbsp;&nbsp;' +
        '<button type="button" class="button" onclick="compress(\'' + file + '\', \'' + name + '\');"> Compress Image </button>' +
        '</div></div><div id="full"></div>';

    document.getElementById("frag").innerHTML = frag;
}

// get the number of images in the gallery area
function getImageCount() {
    return $("#gallery img").length;
}

// get the size of the image in KB, MB, GB etc.
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// see fullsized image in the preview
function fullSize(file) {
    $("#full").html('<img src="' + file + '" />');
}

// change background and text color
function toggleTheme() {
    switch (this.theme) {
        case "dark":
            $("body").css({
                "color": "white"
            });
            $("body").css({
                "background": "black"
            });
            this.theme = "light";
            break;
        default:
            $("body").css({
                "color": "black"
            });
            $("body").css({
                "background": "white"
            });
            this.theme = "dark";
            break;
    }
}

function compress(img, name) {

    let type = name.split('.')[1].toLowerCase();
    let trim = 22;
    let mime = type;

    if (type === 'jpg' || type === 'jpeg') {
        trim = 23;
        mime = 'jpeg';
    }

    let decoded = atob(img.substr(trim));
    let originalSize = decoded.length;

    let block = img.split(";");
    let contentType = block[0].split(":")[1];
    let realData = block[1].split(",")[1];

    // Convert to blob
    let blob = base64ToBlob(realData, contentType);

    // Create a FormData and append the file
    let fd = new FormData();
    fd.append("image", blob);
    fd.append("format", type);

    $.ajax({
        url: "https://pokiecat.com/example/",
        data: fd,
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        dataType: "json",
        success: function(response) {
            //alert(data);
            let data = response.image;
            let newlen = atob(data.substr(trim)).length;
            let comp = (Math.floor(newlen / originalSize * 100) - 100) * (-1);
            // $("#content").remove('#comp');
            $("span[id=comp]").remove();
            let cimg = '<span id="comp"><h4 >New File Size: ' + bytesToSize(newlen) + ' ' + comp + '% Compression </h4>' +
                '<a href="' + data + '" download="' + name + '"><button type="button" class="button">Download</button></a>&nbsp;&nbsp;' +
                 '<button type="button" class="button" onclick="fullSize(\'' + data + '\');">Compressed Preview</button>' +
                '</span>';
            $("#content").append(cimg);

            fullSize(data);
        },
        error: function(data) {
            let cimg = '<span id="comp"><h3 style="color:red">An Error Occured While Trying To Compress Your Image </h4></span>';
            $("#content").append(cimg);
        }
    });
}

function base64ToBlob(base64, mime) {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {
        type: mime
    });
}