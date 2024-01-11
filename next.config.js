/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devServer: {
    // 设置监听地址为 0.0.0.0 表示监听所有网络接口
    // 如果需要只监听指定网卡的接口，可以使用该网卡的 IP 地址
    host: "0.0.0.0",
  },
};

module.exports = nextConfig;
