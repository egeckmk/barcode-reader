import { useEffect, useRef, useState } from "react";

function App() {
  const video = useRef(null);
  const canvas = useRef(null);

  const [barcode, setBarcode] = useState(null);
  const [basket, setBasket] = useState([]);

  const openCam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((stream) => {
        video.current.srcObject = stream;
        video.current.play();

        const ctx = canvas.current.getContext("2d");
        const barcodeDetector = new window.BarcodeDetector({
          formats: [
            "aztec",
            "code_128",
            "code_39",
            "code_93",
            "codabar",
            "data_matrix",
            "ean_13",
            "ean_8",
            "itf",
            "pdf417",
            "qr_code",
            "upc_a",
            "upc_e",
          ],
        });
        setInterval(() => {
          canvas.current.width = video.current.videoWidth;
          canvas.current.height = video.current.videoHeight;
          ctx.drawImage(
            video.current,
            0,
            0,
            video.current.videoWidth,
            video.current.videoHeight
          );
          barcodeDetector
            .detect(canvas.current)
            .then(([data]) => {
              if (data) {
                setBarcode(data.rawValue);
              }
            })
            .catch((err) => console.log(err));
        }, 100);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (barcode) {
      // request to database
      fetch(`https://localhost:5001/api/getBarcode=${barcode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setBasket(...basket, data);
          } else {
            alert("Not found!");
          }
        });
    }
  }, [barcode]);

  return (
    <>
      <button onClick={openCam}>Open Cam</button>
      <div>
        <video ref={video} muted hidden />
        <canvas ref={canvas} />
        {barcode && <div>Barcode: {barcode}</div>}
        {basket &&
          basket.map((item) => (
            <div>
              {item.name}
              {item.price}
              <img src={item.image} style={{ width: 100, height: 100 }} />
            </div>
          ))}
      </div>
    </>
  );
}

export default App;
