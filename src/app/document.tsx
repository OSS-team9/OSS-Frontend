import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* Mediapipe FaceMesh - 예제 프로그램과 동일한 파일들 */}
        <script src="/vendor/face_mesh/drawing_utils.js" />
        <script src="/vendor/face_mesh/drawing_styles.js" />
        <script src="/vendor/face_mesh/face_mesh.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
