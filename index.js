
// import * as faceapi from 'face-api.js';

const video=document.getElementById("video");
const stopVideo=document.getElementById("stopVideo");
const videoButton=document.getElementById("videoButton");
const uplodeImage=document.getElementById("uplodeImage");
const pauseVideo=document.getElementById("pauseVideo");




const imageUploadActionFrame = document.getElementById('imageUpload');

 Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
    
]).then(enableAllButton())

function enableAllButton(){
  document.querySelector(".loadingMassage").classList.add("hide");
  videoButton.classList.remove("hide");
  uplodeImage.classList.remove("hide");
}
videoButton.addEventListener('click',function(){
    uplodeImage.classList.add("hide");
    stopVideo.classList.remove("hide");
    pauseVideo.classList.remove("hide");
    video.classList.remove("hide");
    startVideo();
})
stopVideo.addEventListener('click',function(){
    video.srcObject=stop();
    
})
pauseVideo.addEventListener('click',function(){
    if(pauseVideo.innerHTML=="Pause Video"){
        video.pause();
        pauseVideo.innerHTML="Play Video";
    }
    else{
        video.play();
        pauseVideo.innerHTML="Pause Video";
    }
    
})
uplodeImage.addEventListener('click',function(){
    // document.querySelector("canvas").style.cssText='left:5%';
    videoButton.classList.add("hide");
    video.srcObject=stop();
    video.classList.add("hide");
    document.querySelector(".loadingMassage").classList.remove("hide");
    start();

})



async function startVideo(){

  
  navigator.mediaDevices.getUserMedia(
    {video:true}).then((stream) => {
                video.srcObject=stream;
                err=>console.error(err);
                setTimeout(function(){
                    video.play();
                  },100)
                })

        }
       


            video.addEventListener('play' ,async ()=>{
              
              document.querySelector(".loadingMassage").classList.remove("hide");
              const labeledFaceDescriptors = await loadLabeledImages();
              const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
              document.querySelector(".loadingMassage").classList.add("hide");


                const containerDiv=document.querySelector(".videoDiv");
                console.log("await")
                const canvas = faceapi.createCanvasFromMedia(video);
                canvas.classList.add("canvasVideo");
                containerDiv.append(canvas);
            
                const displaySizeVideo={width:video.width, height:video.height}
                
                faceapi.matchDimensions(canvas, displaySizeVideo);
                
                let attendanceArray=new Array();

                const attendanceDiv = document.createElement('div')
                attendanceDiv.style.position = 'absolute';
                attendanceDiv.classList.add("attendanceDiv");
                document.body.append(attendanceDiv)
              

                const attendanceDivItem=document.querySelector(".attendanceDiv");


                setInterval(async ()=>{

                  

                  const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

                    // const detections=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            
                    const resizedDetections = faceapi.resizeResults(detections,displaySizeVideo);
            
                    canvas.getContext('2d').clearRect(0,0, canvas.width,canvas.height);
            
                    faceapi.draw.drawDetections(canvas,resizedDetections);
                    // faceapi.draw.drawFaceLandmarks(canvas,resizeDetections);
                    // faceapi.draw.drawFaceExpressions(canvas,resizeDetections);

                    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
                        results.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box
                        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                        let consern=0;
                        for(let i=0;i<attendanceArray.length;i++){
                          if(result._label==attendanceArray[i]){
                              consern=1;
                          }
                        }
                        if(consern!=1 && result._label!="unknown"){
                          attendanceArray.push(result._label);
                        }
                        drawBox.draw(canvas)
                      })
                      
                      attendanceDivItem.innerHTML="<div class='attendanceFirst'> "+attendanceArray.length+" Total<br></div><ol type='1'>"
                      for(let i=0;i<attendanceArray.length;i++){
                        if(attendanceArray[i]!="unknown"){
                        attendanceDivItem.innerHTML=attendanceDivItem.innerHTML+"<li>"+attendanceArray[i]+"</li>";
                        }
                       
                      }
                      attendanceDivItem.innerHTML=attendanceDivItem.innerHTML+"</ol>"
                   
                },500)
               
            })
        
       
  

// Image uploding section


// get the glogal context for compatibility with node and browser
var context = typeof window === "undefined" ? global : window;

// flag that will be sliped in the json string
const FLAG_TYPED_ARRAY = "FLAG_TYPED_ARRAY";

async function start() {
    const container = document.createElement('div')
    container.style.position = 'absolute';
    container.classList.add("imagePosition");
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages();
    // console.log(labeledFaceDescriptors);
    
    
    
       
// console.log(decodedJson);
// const labeledFaceDescriptors = decodedJson;

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas
    
    document.querySelector(".loadingMassage").classList.add("hide");
    imageUploadActionFrame.classList.remove("hide");
    imageUpload.addEventListener('change', async () => {
      let attendanceArray=new Array();
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(imageUpload.files[0])
      container.append(image)
      canvas = faceapi.createCanvasFromMedia(image)
      canvas.classList.remove("canvasVideo");
      container.append(canvas)
      
      image.classList.add("imagePosition");
      image.classList.add("imagePosition");

      const displaySize = { width: image.width, height: image.height }
      faceapi.matchDimensions(canvas, displaySize)
      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        attendanceArray.push(result._label);
        drawBox.draw(canvas);
      })
      const attendanceDiv = document.createElement('div')
      attendanceDiv.style.position = 'absolute';
      attendanceDiv.classList.add("attendanceDiv");
      document.body.append(attendanceDiv)

      const attendanceDivItem=document.querySelector(".attendanceDiv");
      let unknown=0;
      let present=0;
      attendanceDivItem.innerHTML="<div class='attendanceFirst'> "+attendanceArray.length+" Total<br></div><ol type='1'>"
      for(let i=0;i<attendanceArray.length;i++){
        if(attendanceArray[i]!="unknown"){
        present+=1;
        attendanceDivItem.innerHTML=attendanceDivItem.innerHTML+"<li>"+attendanceArray[i]+"</li>";
        }
        else{
          unknown+=1;
        }
      }
      attendanceDivItem.innerHTML=attendanceDivItem.innerHTML+"</ol>"
      document.querySelector(".attendanceFirst").innerHTML+=unknown+" Unknown<br>"+present+" Present <br>";
    })
  }
  
  function loadLabeledImages() {
    const labels = ['Piyush Mandloi', 'Rahul Rajput', 'Naman Pathak']
    var i=0;
    return Promise.all(
      labels.map(async label => {


        if(localStorage.getItem('testObject')==null){
          console.log("hello");
        
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/Naman503/Minor-Project/basic/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
          console.log(descriptions);


          var jsonStr = JSON.stringify( descriptions , function( key, value ){
      // the replacer function is looking for some typed arrays.
      // If found, it replaces it by a trio
      if ( value instanceof Int8Array         ||
           value instanceof Uint8Array        ||
           value instanceof Uint8ClampedArray ||
           value instanceof Int16Array        || 
           value instanceof Uint16Array       ||
           value instanceof Int32Array        || 
           value instanceof Uint32Array       || 
           value instanceof Float32Array      ||
           value instanceof Float64Array       )
      {
        var replacement = {
          constructor: value.constructor.name,
          data: Array.apply([], value),
          flag: FLAG_TYPED_ARRAY
        }
        return replacement;
      }
      return value;
    });
    // save the json_str to json file
    localStorage.setItem('testObject'+i,jsonStr);
    // Load json file and parse
        }
    var retrivedObj=localStorage.getItem('testObject'+i);
    // console.log(retrivedObj);

    
    var decodedJson = JSON.parse( retrivedObj, function( key, value ){
      // the reviver function looks for the typed array flag
      try{
        if( "flag" in value && value.flag === FLAG_TYPED_ARRAY){
          // if found, we convert it back to a typed array
          return new context[ value.constructor ]( value.data );
        }
      }catch(e){}
      
      // if flag not found no conversion is done
      return value;
    });
        console.log(label);
        i++;
        return new faceapi.LabeledFaceDescriptors(label, decodedJson)
      })
    )
  }

