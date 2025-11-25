// src/utils/fileUtils.ts

/**
 * Base64 Data URL을 File 객체로 변환하는 함수
 * @param dataurl - "data:image/png;base64,..." 형태의 문자열
 * @param filename - 생성할 파일의 이름 (예: "image.png")
 * @returns File 객체
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
