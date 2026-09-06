/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 저장소 루트에도 package-lock.json 이 있어서, 기준 경로를 정해 주지 않으면
  // Next.js가 배포 파일 추적 범위를 저장소 전체로 잡고 경고를 낸다.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
