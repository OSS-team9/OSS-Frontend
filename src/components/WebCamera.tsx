// components/WebCamera.tsx

// 1. 마법의 주문: "이 파일은 브라우저에서만 작동합니다!"
"use client";

// 2. React에서 필요한 3가지 도구(치트키)를 가져옵니다.
// - useState: 컴포넌트의 데이터를 기억 (예: 카메라 켜짐/꺼짐, 찍은 사진)
// - useRef: HTML 태그(예: <video>)를 직접 제어할 때 사용
// - useEffect: '페이지가 로드되었을 때' 같은 특정 타이밍에 코드 실행
import { useState, useRef, useEffect }from 'react';

export default function WebCamera() {
  // 3. 데이터를 기억하기 위한 state 설정
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // 4. HTML 태그에 '연결'하기 위한 ref 설정
  // videoRef는 <video> 태그에 연결, canvasRef는 <canvas> 태그에 연결
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 5. 카메라 시작 함수
  const startCamera = async () => {
    // 6. 만약 이미 찍은 사진이 있다면, 다시 찍기 위해 초기화
    if (capturedImage) {
      setCapturedImage(null);
    }
    
    // 7. 브라우저의 미디어 장치(카메라)에 접근 요청
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // 후면 카메라 우선
      });

      // 8. <video> 태그(videoRef)에 실시간 카메라 스트림을 연결
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // 비디오 재생
      }
      setIsCameraOn(true); // '카메라 켜짐' 상태로 변경
    } catch (err) {
      console.error("카메라 접근 오류:", err);
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  // 9. 카메라 중지 함수
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // 모든 트랙 중지
      videoRef.current!.srcObject = null;
    }
    setIsCameraOn(false); // '카메라 꺼짐' 상태로 변경
  };

  // 10. 사진 찍기 함수
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // 11. 캔버스 크기를 비디오 크기와 동일하게 설정
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 12. 캔버스에 <video>의 현재 프레임(화면)을 그림
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 13. 캔버스에 그려진 이미지를 데이터(PNG)로 변환
      const imageDataUrl = canvas.toDataURL("image/png");

      // 14. 찍은 사진(이미지 데이터)을 state에 저장
      setCapturedImage(imageDataUrl);

      // 15. 사진을 찍었으니 카메라는 중지
      stopCamera();
    }
  };

  // 16. 페이지가 닫힐 때(컴포넌트가 사라질 때) 카메라를 자동으로 끄기 (메모리 확보)
  useEffect(() => {
    // 이 Effect는 컴포넌트가 마운트될 때 한 번만 실행됨
    // cleanup 함수: 컴포넌트가 언마운트될 때(사라질 때) 실행됨
    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn]); // isCameraOn이 바뀔 때마다 cleanup을 재설정 (안정성을 위해)

  // 17. 화면에 보여줄 HTML(JSX) 부분
  return (
    <div className="w-full max-w-md p-4 mx-auto mt-5 border rounded-lg shadow-md bg-white">
      {/* 캔버스는 화면에 보일 필요가 없으므로 숨김 */}
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        // 18. 만약 '찍은 사진'이 있다면:
        <div className="relative">
          <h2 className="text-xl font-semibold text-center mb-2">촬영된 사진</h2>
          <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
          <button
            onClick={startCamera} // '다시 찍기' 버튼 누르면 startCamera 함수 실행
            className="w-full px-4 py-2 mt-4 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            다시 찍기
          </button>
        </div>
      ) : (
        // 19. 만약 '찍은 사진'이 없다면:
        <div className="relative">
          {/* 카메라 화면이 보일 <video> 태그 */}
          {/* 카메라가 꺼져있으면(isCameraOn=false) 숨김(hidden) */}
          <video
            ref={videoRef}
            className={`w-full rounded-lg ${!isCameraOn ? "hidden" : ""}`}
            autoPlay
            playsInline
            muted
          />
          {!isCameraOn && (
            <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-lg">
              <span className="text-gray-500">카메라가 꺼져있습니다.</span>
            </div>
          )}

          <div className="flex justify-center mt-4 space-x-4">
            {isCameraOn ? (
              // 20. 카메라가 켜져있다면 '사진 찍기', '중지' 버튼 표시
              <>
                <button
                  onClick={takeSnapshot}
                  className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  사진 찍기
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  중지
                </button>
              </>
            ) : (
              // 21. 카메라가 꺼져있다면 '카메라 켜기' 버튼 표시
              <button
                onClick={startCamera}
                className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                카메라 켜기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}