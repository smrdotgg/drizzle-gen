#!/usr/bin/env node

/**
 * Platform-specific binary wrapper for drizzle-gen
 * This script detects the platform and runs the appropriate compiled binary
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const platform = process.platform;
const arch = process.arch;

// Map platform/arch to binary name
const platformMap = {
  darwin: {
    arm64: "drizzle-gen-darwin-arm64",
    x64: "drizzle-gen-darwin-x64",
  },
  linux: {
    x64: "drizzle-gen-linux-x64",
    arm64: "drizzle-gen-linux-arm64",
  },
  win32: {
    x64: "drizzle-gen-windows-x64.exe",
  },
};

function getBinaryName() {
  const platformBinaries = platformMap[platform];
  if (!platformBinaries) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  const binaryName = platformBinaries[arch];
  if (!binaryName) {
    console.error(`Unsupported architecture: ${arch} on ${platform}`);
    process.exit(1);
  }

  return binaryName;
}

function main() {
  const binaryName = getBinaryName();
  const binaryPath = path.join(__dirname, binaryName);

  // Check if binary exists
  if (!fs.existsSync(binaryPath)) {
    console.error(`Binary not found: ${binaryPath}`);
    console.error(`This platform (${platform}-${arch}) may not be supported.`);
    process.exit(1);
  }

  // Make sure binary is executable (not needed on Windows)
  if (platform !== "win32") {
    try {
      fs.accessSync(binaryPath, fs.constants.X_OK);
    } catch {
      try {
        fs.chmodSync(binaryPath, 0o755);
      } catch (err) {
        console.error(`Failed to make binary executable: ${err.message}`);
        process.exit(1);
      }
    }
  }

  // Spawn the binary with all original arguments
  const child = spawn(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    windowsHide: false,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  child.on("error", (err) => {
    console.error(`Failed to run binary: ${err.message}`);
    process.exit(1);
  });
}

main();
