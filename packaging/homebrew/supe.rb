class Supe < Formula
  desc "Supe.js — scaffold planning and starter catalog CLI"
  homepage "https://github.com/supejs/supe"
  url "https://github.com/supejs/supe/archive/refs/tags/v1.0.1.tar.gz"
  sha256 "PUT_REAL_SHA256_HERE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", "-g", "--prefix", libexec, "."
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/supe", "--help"
  end
end
