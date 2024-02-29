// sort by score
export const sortByScore = (a, b) => {
    return b.label_score - a.label_score;
};

export const concatenateLabels = (list) => {
    let concatenatedString = "";
    list.forEach((item, index) => {
      concatenatedString += `${item.label_name} (${item.label_score})`;
        if (index !== list.length - 1) {
        concatenatedString += ", ";
      }
    });
      return concatenatedString;
  };



// webcam to bytes 

export const captureFrameAndSendIt = async (socket, stream) => {
  const videoTrack = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(videoTrack);

  try {
    const frame = await imageCapture.grabFrame();
    const blob = await frameToBlob(frame);
    const byteArray = await blobToByteArray(blob);
    
    // Send byte array to server
    socket.emit('webcam_stream', byteArray);
  } catch (error) {
    console.error('Error capturing frame:', error);
  }
};

const frameToBlob = async (frame) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = frame.width;
  canvas.height = frame.height;
  ctx.drawImage(frame, 0, 0);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
};

const blobToByteArray = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};