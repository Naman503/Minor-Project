
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
                  },50)
                })

        }
       


            video.addEventListener('play' ,async ()=>{
              
              document.querySelector(".loadingMassage").classList.remove("hide");
              const labeledFaceDescriptors = await loadLabeledImages();
              const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
              document.querySelector(".loadingMassage").classList.remove("hide");


                const containerDiv=document.querySelector(".videoDiv");
                console.log("await")
                const canvas = faceapi.createCanvasFromMedia(video);
                
                containerDiv.append(canvas);
            
                const displaySize={width:video.width, height:video.height}
                
                faceapi.matchDimensions(canvas, displaySize);
                





                setInterval(async ()=>{

                  

                  const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

                    // const detections=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            
                    const resizedDetections = faceapi.resizeResults(detections,displaySize);
            
                    canvas.getContext('2d').clearRect(0,0, canvas.width,canvas.height);
            
                    faceapi.draw.drawDetections(canvas,resizedDetections);
                    // faceapi.draw.drawFaceLandmarks(canvas,resizeDetections);
                    // faceapi.draw.drawFaceExpressions(canvas,resizeDetections);

                    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
                        results.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box
                        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                        // attendanceArray.push(result._label);
                        drawBox.draw(canvas)
                      })
                   
                },100)
               
            })
        
       
        
      

    




// Image uploding section




async function start() {
    const container = document.createElement('div')
    container.style.position = 'absolute';
    container.classList.add("imagePosition");
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image
    let canvas
    let attendanceArray=new Array();
  
    document.querySelector(".loadingMassage").classList.add("hide");
    imageUploadActionFrame.classList.remove("hide");
    imageUpload.addEventListener('change', async () => {
      if (image) image.remove()
      if (canvas) canvas.remove()
      image = await faceapi.bufferToImage(imageUpload.files[0])
      container.append(image)
      canvas = faceapi.createCanvasFromMedia(image)
      container.append(canvas)
      
      const displaySize = { width: image.width, height: image.height }
      faceapi.matchDimensions(canvas, displaySize)
      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        attendanceArray.push(result._label);
        drawBox.draw(canvas)
      })
      console.log(attendanceArray);
    })
  }
  
  function loadLabeledImages() {
    const labels = ['Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Naman Pathak']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/Naman503/Minor-Project/basic/labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

