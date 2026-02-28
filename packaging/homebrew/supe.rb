class Supe < Formula
  desc "Supe.js — scaffold planning and starter catalog CLI"
  homepage "https://github.com/gwon-omega/supe.js"
  url "https://github.com/gwon-omega/supe.js/archive/refs/tags/v1.0.1.tar.gz"
  sha256 "EBF23B135AD62D012ABF3CCE5A4522329B650FEE47968D708534EAA645AF8E77"
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
